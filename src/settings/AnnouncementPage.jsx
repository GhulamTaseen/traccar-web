import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Radio,
  RadioGroup,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import { useAsyncTask, useCatchCallback } from '../reactHelper';
import useSettingsStyles from './common/useSettingsStyles';
import SelectField from '../common/components/SelectField';
import { prefixString } from '../common/util/stringUtils';
import { formatTime } from '../common/util/formatter';
import fetchOrThrow from '../common/util/fetchOrThrow';

const storageKey = 'scheduledAnnouncements';

const readScheduled = () => {
  try {
    const items = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

const writeScheduled = (items) => {
  localStorage.setItem(storageKey, JSON.stringify(items));
};

const sendAnnouncement = ({ users, notificator, message }) => {
  const query = new URLSearchParams();
  users.forEach((userId) => query.append('userId', userId));
  return fetchOrThrow(`/api/notifications/send/${notificator}?${query.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
};

const AnnouncementPage = () => {
  const navigate = useNavigate();
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const [users, setUsers] = useState([]);
  const [notificator, setNotificator] = useState();
  const [message, setMessage] = useState({});
  const [scheduleMode, setScheduleMode] = useState('now');
  const [sendAt, setSendAt] = useState('');
  const [scheduled, setScheduled] = useState(readScheduled);

  useAsyncTask(async () => {
    const items = readScheduled();
    const due = items.filter((item) => new Date(item.sendAt).getTime() <= Date.now());
    if (due.length === 0) {
      return;
    }
    const remaining = [];
    let failure = null;
    for (const item of items) {
      if (due.includes(item)) {
        try {
          await sendAnnouncement(item);
        } catch (error) {
          remaining.push(item);
          failure = failure || error;
        }
      } else {
        remaining.push(item);
      }
    }
    writeScheduled(remaining);
    setScheduled(remaining);
    if (failure) {
      throw failure;
    }
  }, []);

  const handleSend = useCatchCallback(async () => {
    if (scheduleMode === 'later') {
      const items = [...readScheduled(), { users, notificator, message, sendAt }];
      writeScheduled(items);
      setScheduled(items);
      setMessage({ subject: '', body: '' });
      setSendAt('');
      return;
    }
    await sendAnnouncement({ users, notificator, message });
    navigate(-1);
  }, [users, notificator, message, scheduleMode, sendAt, navigate]);

  const handleDelete = useCatchCallback(async (index) => {
    const items = readScheduled().filter((_, i) => i !== index);
    writeScheduled(items);
    setScheduled(items);
  }, []);

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['serverAnnouncement']}>
      <Container maxWidth="xs" className={classes.container}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">{t('sharedRequired')}</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <SelectField
              multiple
              value={users}
              onChange={(e) => setUsers(e.target.value)}
              endpoint="/api/users"
              label={t('settingsUsers')}
            />
            <SelectField
              value={notificator}
              onChange={(e) => setNotificator(e.target.value)}
              endpoint="/api/notifications/notificators?announcement=true"
              keyGetter={(it) => it.type}
              titleGetter={(it) => t(prefixString('notificator', it.type))}
              label={t('notificationNotificators')}
            />
            <TextField
              value={message.subject}
              onChange={(e) => setMessage({ ...message, subject: e.target.value })}
              label={t('sharedSubject')}
            />
            <TextField
              value={message.body}
              onChange={(e) => setMessage({ ...message, body: e.target.value })}
              label={t('commandMessage')}
            />
            <FormControl>
              <FormLabel>{t('sharedSchedule')}</FormLabel>
              <RadioGroup
                row
                value={scheduleMode}
                onChange={(e) => setScheduleMode(e.target.value)}
              >
                <FormControlLabel value="now" control={<Radio />} label={t('sharedSendNow')} />
                <FormControlLabel
                  value="later"
                  control={<Radio />}
                  label={t('sharedScheduleLater')}
                />
              </RadioGroup>
            </FormControl>
            {scheduleMode === 'later' && (
              <TextField
                label={t('sharedScheduleTime')}
                type="datetime-local"
                value={sendAt}
                onChange={(e) => setSendAt(e.target.value)}
              />
            )}
          </AccordionDetails>
        </Accordion>
        <div className={classes.buttons}>
          <Button type="button" color="primary" variant="outlined" onClick={() => navigate(-1)}>
            {t('sharedCancel')}
          </Button>
          <Button
            type="button"
            color="primary"
            variant="contained"
            onClick={handleSend}
            disabled={
              !notificator ||
              !message.subject ||
              !message.body ||
              (scheduleMode === 'later' && (!sendAt || isPastTime(sendAt)))
            }
          >
            {t(scheduleMode === 'later' ? 'sharedSchedule' : 'commandSend')}
          </Button>
        </div>
        {scheduled.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t('sharedScheduledAnnouncements')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense disablePadding>
                {scheduled.map((item) => (
                  <ListItem
                    key={item.id}
                    disableGutters
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label={t('sharedRemove')}
                        onClick={() => handleDelete(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={item.message?.subject}
                      secondary={`${formatTime(item.sendAt, 'minutes')} · ${t(prefixString('notificator', item.notificator))}${
                        item.attempts ? ` · ${t('sharedScheduleAttempts')}: ${item.attempts}` : ''
                      }`}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}
      </Container>
    </PageLayout>
  );
};

export default AnnouncementPage;
