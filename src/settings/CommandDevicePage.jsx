import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from '../common/components/LocalizationProvider';
import BaseCommandView from './components/BaseCommandView';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import { useCatch } from '../reactHelper';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { useRestriction } from '../common/util/permissions';
import { canImmobilize } from '../common/util/vehicle';
import { messagesActions } from '../store';

const CommandDevicePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { classes } = useSettingsStyles();
  const t = useTranslation();
  const readonly = useRestriction('readonly');
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') === 'engineStop' ? 'engineStop' : null;
  const [savedId, setSavedId] = useState(0);
  const [savedType, setSavedType] = useState(null);
  const [item, setItem] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);
  const isEngineStop = (savedId ? savedType : item.type) === 'engineStop';

  const handleSend = useCatch(async () => {
    if (sendingRef.current || readonly) return;
    sendingRef.current = true;
    setSending(true);
    try {
      const command = savedId
        ? await (await fetchOrThrow(`/api/commands/${savedId}`)).json()
        : { ...item, attributes: { ...item.attributes } };
      command.deviceId = Number(id);
      if (command.type === 'engineStop') {
        const [devicesResponse, positionsResponse] = await Promise.all([
          fetchOrThrow('/api/devices'),
          fetchOrThrow('/api/positions'),
        ]);
        const devices = await devicesResponse.json();
        const positions = await positionsResponse.json();
        if (
          !canImmobilize(
            devices.find((device) => device.id === Number(id)),
            positions.find((position) => position.deviceId === Number(id)),
          )
        ) {
          throw new Error(t('dashboardImmobilizeSafety'));
        }
        command.textChannel = false;
        command.attributes = { ...command.attributes, noQueue: true };
      }
      const response = await fetchOrThrow('/api/commands/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      });
      dispatch(
        messagesActions.push({
          message: t(response.status === 202 ? 'commandQueued' : 'commandSent'),
          severity: 'success',
        }),
      );
      navigate(-1);
    } finally {
      sendingRef.current = false;
      setSending(false);
      setConfirmOpen(false);
    }
  });

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'deviceCommand']}>
      <Container maxWidth="xs" className={classes.container}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">{t('sharedRequired')}</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <BaseCommandView
              key={`${id}-${initialType}`}
              deviceId={id}
              item={item}
              setItem={setItem}
              includeSaved
              savedId={savedId}
              setSavedId={setSavedId}
              initialType={initialType}
              onSavedTypeChange={setSavedType}
            />
            {isEngineStop && <Alert severity="warning">{t('dashboardImmobilizeSafety')}</Alert>}
          </AccordionDetails>
        </Accordion>
        <div className={classes.buttons}>
          <Button type="button" variant="outlined" onClick={() => navigate(-1)} disabled={sending}>
            {t('sharedCancel')}
          </Button>
          <Button
            type="button"
            variant="contained"
            disabled={readonly || sending || !(savedId || item.type)}
            onClick={() => {
              if (isEngineStop) setConfirmOpen(true);
              else handleSend();
            }}
          >
            {t('commandSend')}
          </Button>
        </div>
      </Container>
      <Dialog
        open={confirmOpen}
        onClose={() => {
          if (!sending) setConfirmOpen(false);
        }}
      >
        <DialogTitle>{t('dashboardImmobilize')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('dashboardImmobilizeConfirm')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={sending} onClick={() => setConfirmOpen(false)}>
            {t('sharedCancel')}
          </Button>
          <Button color="error" disabled={sending || readonly} onClick={handleSend}>
            {t('commandSend')}
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default CommandDevicePage;
