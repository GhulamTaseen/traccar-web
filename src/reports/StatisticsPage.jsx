import { useState } from 'react';
import {
  Button,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { saveAs } from 'file-saver';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import ReportFilter from './components/ReportFilter';
import usePersistedState from '../common/util/usePersistedState';
import ColumnSelect from './components/ColumnSelect';
import { useCatchCallback } from '../reactHelper';
import useReportStyles from './common/useReportStyles';
import TableShimmer from '../common/components/TableShimmer';
import fetchOrThrow from '../common/util/fetchOrThrow';

const columnsArray = [
  ['captureTime', 'statisticsCaptureTime'],
  ['activeUsers', 'statisticsActiveUsers'],
  ['activeDevices', 'statisticsActiveDevices'],
  ['requests', 'statisticsRequests'],
  ['messagesReceived', 'statisticsMessagesReceived'],
  ['messagesStored', 'statisticsMessagesStored'],
  ['mailSent', 'notificatorMail'],
  ['smsSent', 'notificatorSms'],
  ['geocoderRequests', 'statisticsGeocoder'],
  ['geolocationRequests', 'statisticsGeolocation'],
];
const columnsMap = new Map(columnsArray);

export const StatisticsTypeSelect = () => {
  const { classes } = useReportStyles();
  const t = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className={classes.filterItem}>
      <TextField
        select
        fullWidth
        label={t('sharedType')}
        value={location.pathname}
        onChange={(event) => navigate({ pathname: event.target.value, search: location.search })}
      >
        <MenuItem value="/reports/statistics">{t('settingsServer')}</MenuItem>
        <MenuItem value="/reports/device-statistics">{t('deviceTitle')}</MenuItem>
      </TextField>
    </div>
  );
};

const StatisticsPage = () => {
  const { classes } = useReportStyles();
  const t = useTranslation();

  const [columns, setColumns] = usePersistedState('statisticsColumns', [
    'captureTime',
    'activeUsers',
    'activeDevices',
    'messagesStored',
  ]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const onShow = useCatchCallback(async ({ from, to }) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ from, to });
      const response = await fetchOrThrow(`/api/statistics?${query.toString()}`);
      setItems(await response.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const escapeCsv = (value) => {
    const text = value === null || value === undefined ? '' : String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const downloadCsv = () => {
    const header = columns.map((key) => escapeCsv(t(columnsMap.get(key))));
    const rows = items.map((item) =>
      columns.map((key) =>
        escapeCsv(key === 'captureTime' ? formatTime(item[key], 'date') : item[key]),
      ),
    );
    const content = [header, ...rows].map((row) => row.join(',')).join('\r\n');
    saveAs(new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' }), 'statistics.csv');
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'statisticsTitle']}>
      <div className={classes.header}>
        <ReportFilter onShow={onShow} deviceType="none" loading={loading}>
          <StatisticsTypeSelect />
          <ColumnSelect columns={columns} setColumns={setColumns} columnsArray={columnsArray} />
          <div className={classes.filterItem}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              disabled={loading || items.length === 0}
              onClick={downloadCsv}
            >
              <Typography variant="button" noWrap>
                {t('statisticsDownloadCsv')}
              </Typography>
            </Button>
          </div>
        </ReportFilter>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((key) => (
              <TableCell key={key}>{t(columnsMap.get(key))}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? (
            items.map((item) => (
              <TableRow key={item.id}>
                {columns.map((key) => (
                  <TableCell key={key}>
                    {key === 'captureTime' ? formatTime(item[key], 'date') : item[key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableShimmer columns={columns.length} />
          )}
        </TableBody>
      </Table>
    </PageLayout>
  );
};

export default StatisticsPage;
