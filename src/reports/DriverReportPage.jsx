import { useSelector } from 'react-redux';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from '@mui/material';

import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import { useTranslation } from '../common/components/LocalizationProvider';
import { formatBoolean } from '../common/util/formatter';

const getScoreColor = (score) => {
  if (score >= 85) return '#2e7d32';
  if (score >= 70) return '#ed6c02';
  if (score >= 50) return '#d32f2f';
  return '#b02727';
};

const DriverReportPage = () => {
  const t = useTranslation();

  const devices = useSelector((state) => state.devices.items);
  const positions = useSelector((state) => state.session.positions);

  const rows = Object.values(positions).reduce((acc, position) => {
    const attr = position.attributes || {};

    const hasData =
      attr.harshAcceleration ||
      attr.harshBraking ||
      attr.harshCornering ||
      attr.drivingScore !== undefined ||
      attr.lastTripEvents !== undefined ||
      attr.lastTripScore !== undefined;

    if (!hasData) return acc;

    const existing = acc[position.deviceId];
    if (!existing || new Date(position.fixTime) > new Date(existing.fixTime)) {
      acc[position.deviceId] = position;
    }

    return acc;
  }, {});

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportDriverBehavior']}>
      <Paper>
        <Table size="small" sx={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('sharedDevice')}</TableCell>
              <TableCell align="center">{t('positionHarshAcceleration')}</TableCell>
              <TableCell align="center">{t('positionHarshBraking')}</TableCell>
              <TableCell align="center">{t('positionHarshCornering')}</TableCell>
              <TableCell align="center">{t('positionDrivingScore')}</TableCell>
              <TableCell align="center">{t('positionLastTripEvents')}</TableCell>
              <TableCell align="center">{t('positionLastTripScore')}</TableCell>
              <TableCell align="center">{t('positionTripFinished')}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Object.values(rows).length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body1" color="textSecondary">
                    {t('sharedNoData')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              Object.values(rows).map((position) => {
                const device = devices[position.deviceId];
                const attr = position.attributes || {};
                const score = attr.drivingScore;

                return (
                  <TableRow key={position.deviceId} hover>
                    <TableCell>
                      <Box fontWeight="medium">{device?.name || position.deviceId}</Box>
                    </TableCell>
                    <TableCell align="center">
                      {attr.harshAcceleration !== undefined
                        ? formatBoolean(attr.harshAcceleration, t)
                        : '—'}
                    </TableCell>
                    <TableCell align="center">
                      {attr.harshBraking !== undefined ? formatBoolean(attr.harshBraking, t) : '—'}
                    </TableCell>
                    <TableCell align="center">
                      {attr.harshCornering !== undefined
                        ? formatBoolean(attr.harshCornering, t)
                        : '—'}
                    </TableCell>
                    <TableCell align="center">
                      {score !== undefined ? (
                        <Box
                          component="span"
                          sx={{
                            fontWeight: 'bold',
                            color: getScoreColor(score),
                            fontSize: '1.1rem',
                          }}
                        >
                          {score}
                        </Box>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell align="center">{attr.lastTripEvents ?? '—'}</TableCell>
                    <TableCell align="center">{attr.lastTripScore ?? '—'}</TableCell>
                    <TableCell align="center">
                      {attr.tripFinished ? (
                        <Box color="success.main" fontWeight="medium">
                          {formatBoolean(true, t)}
                        </Box>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>
    </PageLayout>
  );
};

export default DriverReportPage;
