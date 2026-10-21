import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  ListItemText,
  Box,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import CloseIcon from '@mui/icons-material/Close';
import RouteIcon from '@mui/icons-material/Route';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import LinkIcon from '@mui/icons-material/Link';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceIcon from '@mui/icons-material/Place';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';

import { useTranslation } from './LocalizationProvider';
import RemoveDialog from './RemoveDialog';
import AddressValue from './AddressValue';
import Gauge, { GAUGE_TICKS, tickAngle } from './Gauge';

import { useDeviceReadonly, useRestriction } from '../util/permissions';
import { devicesActions } from '../../store';
import { useCatch, useCatchCallback } from '../../reactHelper';
import { useAttributePreference } from '../util/preferences';
import fetchOrThrow from '../util/fetchOrThrow';

import { formatNotificationTitle, formatStatus, formatTime } from '../util/formatter';

import {
  distanceFromMeters,
  distanceUnitString,
  speedFromKnots,
  volumeFromLiters,
  volumeUnitString,
} from '../util/converter';
import EngineIcon from '../../resources/images/data/engine.svg?react';

const statusColors = {
  online: 'success',
  offline: 'error',
};

const useStyles = makeStyles()((theme, { desktopPadding = 0 }) => ({
  root: {
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 5,
    left: '50%',
    [theme.breakpoints.up('md')]: {
      left: `calc(50% + ${desktopPadding} / 2)`,
      bottom: theme.spacing(3),
    },
    [theme.breakpoints.down('md')]: {
      left: '50%',
      bottom: `calc(${theme.spacing(3)} + ${theme.dimensions.bottomBarHeight}px)`,
    },
    transform: 'translateX(-50%)',
    width: 'min(calc(100vw - 24px), 1080px)',
    [theme.breakpoints.down('sm')]: {
      width: 'calc(100vw - 16px)',
    },
  },

  card: {
    pointerEvents: 'auto',
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    maxHeight: 'calc(100dvh - 100px)',
    overflowY: 'auto',
    [theme.breakpoints.down('sm')]: {
      maxHeight: 'calc(100dvh - 24px)',
    },
  },

  header: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    cursor: 'grab',
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: 'max-content minmax(0, 1fr)',
      columnGap: theme.spacing(0.5),
      rowGap: theme.spacing(0.5),
      padding: theme.spacing(1, 1.5),
    },
  },

  identity: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    minWidth: 150,
    gridColumn: '1',
    [theme.breakpoints.down('sm')]: {
      minWidth: 0,
      gridColumn: '1 / -1',
    },
  },

  vehicleImage: {
    width: 46,
    height: 36,
    objectFit: 'contain',
    [theme.breakpoints.down('sm')]: {
      width: 36,
      height: 32,
    },
  },

  indicators: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gridColumn: '2',
    justifySelf: 'center',
    flexWrap: 'nowrap',
    gap: theme.spacing(1.5),
    minWidth: 0,
    '& svg': {
      fontSize: 24,
    },
    [theme.breakpoints.down('sm')]: {
      gridColumn: '1',
      gridRow: '2',
      gap: theme.spacing(0.75),
      '& svg': {
        fontSize: 21,
      },
    },
  },

  indicator: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    color: theme.palette.text.disabled,
    '&.active': {
      color: theme.palette.success.main,
    },
    [theme.breakpoints.down('sm')]: {
      width: 24,
      height: 28,
    },
  },

  ignitionOn: {
    color: theme.palette.success.main,
  },

  ignitionOff: {
    color: theme.palette.text.secondary,
  },

  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gridColumn: '3',
    justifySelf: 'end',
    padding: 0,
    gap: theme.spacing(0.5),
    '& .MuiIconButton-root': {
      width: 40,
      height: 40,
      padding: theme.spacing(1),
    },
    [theme.breakpoints.down('sm')]: {
      gridColumn: '2',
      gridRow: '2',
      width: 'auto',
      minWidth: 0,
      flexWrap: 'nowrap',
      gap: 0,
      '& .MuiIconButton-root': {
        width: 26,
        height: 28,
        padding: theme.spacing(0.5),
        flex: '0 0 auto',
      },
      '& .MuiSvgIcon-root': {
        fontSize: 18,
      },
    },
  },

  extraButton: {
    backgroundColor: theme.palette.action.hover,
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  },

  body: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1fr)',
    gap: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr',
    },
  },

  information: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    minWidth: 0,
  },

  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    minHeight: 42,
    padding: theme.spacing(1, 1.5),
    minWidth: 0,
    '& + &': {
      borderTop: `1px solid ${theme.palette.divider}`,
    },
  },

  infoIcon: {
    flex: '0 0 20px',
    color: theme.palette.text.secondary,
  },

  gauges: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.3fr) minmax(0, 1fr)',
    alignItems: 'center',
    gap: theme.spacing(1),
    minWidth: 0,
    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(0.5),
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    },
  },

  sidePanel: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    overflowWrap: 'anywhere',
  },

  muted: {
    color: theme.palette.text.secondary,
  },

  success: {
    color: theme.palette.success.main,
  },

  error: {
    color: theme.palette.error.main,
  },
}));

const numberOrNull = (value) => {
  if (value == null || value === '') {
    return null;
  }

  const result = Number(value);

  return Number.isFinite(result) ? result : null;
};

const booleanOrNull = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 1 || value === '1' || value === 'true') {
    return true;
  }

  if (value === 0 || value === '0' || value === 'false') {
    return false;
  }

  return null;
};

const formatValue = (value) => (value == null ? '--' : String(Number(value.toFixed(2))));

const StatusCard = ({ deviceId, position, onClose, disableActions, desktopPadding = 0 }) => {
  const { classes } = useStyles({ desktopPadding });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const readonly = useRestriction('readonly');
  const deviceReadonly = useDeviceReadonly();

  const shareDisabled = useSelector((state) => state.session.server.attributes.disableShare);

  const user = useSelector((state) => state.session.user);

  const device = useSelector((state) => state.devices.items[deviceId]);

  const events = useSelector((state) => state.events.items);

  const distanceUnit = useAttributePreference('distanceUnit');
  const speedUnit = useAttributePreference('speedUnit');
  const volumeUnit = useAttributePreference('volumeUnit');

  const navigationAppLink = useAttributePreference('navigationAppLink');
  const navigationAppTitle = useAttributePreference('navigationAppTitle');

  const [anchorEl, setAnchorEl] = useState(null);
  const [removing, setRemoving] = useState(false);

  const attributes = position?.attributes || {};
  const deviceAttributes = device?.attributes || {};

  const deviceImage = deviceAttributes.deviceImage;

  const deviceEvents = events.filter((event) => event.deviceId === deviceId);

  const ignition = booleanOrNull(attributes.ignition);

  const voltage = numberOrNull(attributes.battery);

  const batteryLevel = numberOrNull(attributes.batteryLevel ?? attributes.battery);

  const batteryValue = voltage ?? batteryLevel;
  const batteryUnit = voltage != null ? 'V' : '%';
  const batteryMax = voltage != null ? 16 : 100;

  const fuelValue = numberOrNull(attributes.fuelLevel ?? attributes.fuel);

  const fuelIsVolume = attributes.fuel != null && attributes.fuelLevel == null;

  const fuelUnit = fuelIsVolume ? volumeUnitString(volumeUnit, t) : '%';

  const fuelMax = fuelIsVolume ? Math.max(100, Math.ceil(fuelValue || 0)) : 100;

  const speedValue = position?.speed != null ? speedFromKnots(position.speed, speedUnit) : null;

  const speedGaugeMax = Math.max(120, Math.ceil((speedValue || 0) / 10) * 10);

  const positionItemsPreference = useAttributePreference(
    'positionItems',
    'fixTime,address,speed,totalDistance',
  );

  const positionItems =
    typeof positionItemsPreference === 'string'
      ? positionItemsPreference.split(',').map((item) => item.trim())
      : ['fixTime', 'address', 'speed', 'totalDistance'];

  // Prefer the latest position attribute; use device attributes as fallback.
  const rawTotalDistance = numberOrNull(
    attributes.totalDistance ??
      deviceAttributes.totalDistance ??
      attributes.odometer ??
      attributes.obdOdometer ??
      deviceAttributes.odometer ??
      deviceAttributes.obdOdometer,
  );

  const showTotalDistance =
    position != null && positionItems.includes('totalDistance') && rawTotalDistance != null;

  const totalDistanceValue = showTotalDistance
    ? distanceFromMeters(rawTotalDistance, distanceUnit)
    : null;

  const totalDistanceUnit = distanceUnitString(distanceUnit, t);

  const eventTime = position ? formatTime(position.fixTime, 'seconds') : null;

  const eventDate = position ? formatTime(position.fixTime, 'date') : null;

  const formatType = (event) =>
    formatNotificationTitle(t, {
      type: event.type,
      attributes: {
        alarms: event.attributes.alarm,
      },
    });

  const indicators = [
    {
      key: 'rssi',
      icon: <SignalCellularAltIcon />,
      active: numberOrNull(attributes.rssi) != null,
      title: `${t('positionRssi')}: ${attributes.rssi ?? t('sharedNoData')}`,
    },
    {
      key: 'gps',
      icon: <SatelliteAltIcon />,
      active: position?.valid === true,
      title: `${t('positionSat')}: ${attributes.sat ?? t('sharedNoData')}`,
    },
    {
      key: 'battery',
      icon: <BatteryFullIcon />,
      active: batteryValue != null && batteryValue > 20,
      title: `${t('positionBatteryLevel')}: ${batteryValue ?? t('sharedNoData')}`,
    },
  ];

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetchOrThrow('/api/devices');

      dispatch(devicesActions.refresh(await response.json()));
    }

    setRemoving(false);
  });

  const handleGeofence = useCatchCallback(async () => {
    if (position?.latitude == null || position?.longitude == null) {
      return;
    }

    const newItem = {
      name: t('sharedGeofence'),
      area: `CIRCLE (${position.latitude} ${position.longitude}, 50)`,
    };

    const response = await fetchOrThrow('/api/geofences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newItem),
    });

    const item = await response.json();

    await fetchOrThrow('/api/permissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceId: position.deviceId,
        geofenceId: item.id,
      }),
    });

    navigate(`/settings/geofence/${item.id}`);
  }, [navigate, position, t]);

  return (
    <>
      <div className={classes.root}>
        {device && (
          <Rnd
            default={{
              x: 0,
              y: 0,
              width: 'auto',
              height: 'auto',
            }}
            enableResizing={false}
            dragHandleClassName="draggable-header"
            style={{ position: 'relative' }}
          >
            <Card elevation={3} className={classes.card}>
              <div className={`${classes.header} draggable-header`}>
                <div className={classes.identity}>
                  {deviceImage && (
                    <img
                      className={classes.vehicleImage}
                      src={`/api/media/${device.uniqueId}/${deviceImage}`}
                      alt=""
                    />
                  )}

                  <div>
                    <Typography variant="body1">{device.name}</Typography>

                    <Typography
                      variant="caption"
                      color={statusColors[device.status] || 'textSecondary'}
                    >
                      {formatStatus(device.status, t)}
                    </Typography>
                  </div>
                </div>

                <Box className={classes.indicators}>
                  {indicators.map((item) => (
                    <Tooltip key={item.key} title={item.title}>
                      <span className={`${classes.indicator}${item.active ? ' active' : ''}`}>
                        {item.icon}
                      </span>
                    </Tooltip>
                  ))}

                  <Tooltip
                    title={`${t('positionIgnition')}: ${
                      ignition == null
                        ? t('sharedNoData')
                        : t(ignition ? 'eventIgnitionOn' : 'eventIgnitionOff')
                    }`}
                  >
                    <span
                      className={`${classes.indicator} ${
                        ignition === true
                          ? classes.ignitionOn
                          : ignition === false
                            ? classes.ignitionOff
                            : ''
                      }`}
                    >
                      <EngineIcon width={22} height={22} />
                    </span>
                  </Tooltip>

                  <Tooltip title={`${t('sharedType')}: ${device.category || t('sharedNoData')}`}>
                    <span className={classes.indicator}>
                      <LocalShippingIcon />
                    </span>
                  </Tooltip>
                </Box>

                <CardActions className={classes.toolbar} disableSpacing>
                  <Tooltip title={t('sharedExtra')}>
                    <IconButton
                      className={classes.extraButton}
                      onClick={(event) => setAnchorEl(event.currentTarget)}
                      disabled={!position}
                    >
                      <MoreHorizIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={t('sharedShare')}>
                    <span>
                      <IconButton
                        onClick={() => navigate(`/settings/device/${deviceId}/share`)}
                        disabled={shareDisabled || user.temporary || readonly}
                      >
                        <LinkIcon />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title={t('reportReplay')}>
                    <span>
                      <IconButton
                        onClick={() => navigate(`/replay?deviceId=${deviceId}`)}
                        disabled={disableActions || !position}
                      >
                        <RouteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title={t('sharedEdit')}>
                    <span>
                      <IconButton
                        onClick={() => navigate(`/settings/device/${deviceId}`)}
                        disabled={disableActions || deviceReadonly}
                      >
                        <EditIcon />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title={t('sharedRemove')}>
                    <span>
                      <IconButton
                        color="error"
                        onClick={() => setRemoving(true)}
                        disabled={disableActions || deviceReadonly}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <IconButton size="small" onClick={onClose} onTouchStart={onClose}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </div>

              {position && (
                <CardContent>
                  <div className={classes.body}>
                    <div className={classes.information}>
                      <div className={classes.infoRow}>
                        <AccessTimeIcon className={classes.infoIcon} fontSize="small" />

                        <div>
                          <Typography variant="body2">{eventTime}</Typography>

                          <Typography variant="caption" color="textSecondary">
                            {eventDate}
                          </Typography>
                        </div>
                      </div>

                      <div className={classes.infoRow}>
                        <PlaceIcon
                          className={`${classes.infoIcon} ${classes.success}`}
                          fontSize="small"
                        />

                        <AddressValue
                          latitude={position.latitude}
                          longitude={position.longitude}
                          originalAddress={position.address}
                        />
                      </div>

                      {showTotalDistance && (
                        <div className={classes.infoRow}>
                          <RouteIcon className={classes.infoIcon} fontSize="small" />

                          <div>
                            <Typography variant="body2">{t('deviceTotalDistance')}</Typography>

                            <Typography variant="body2" color="textSecondary">
                              {formatValue(totalDistanceValue)} {totalDistanceUnit}
                            </Typography>
                          </div>
                        </div>
                      )}

                      <div className={classes.infoRow}>
                        <NotificationsActiveIcon
                          className={`${classes.infoIcon} ${classes.success}`}
                          fontSize="small"
                        />

                        <div>
                          {deviceEvents.length > 0 ? (
                            deviceEvents.map((event) => (
                              <ListItemText
                                key={event.id}
                                primary={formatType(event)}
                                secondary={formatTime(event.eventTime, 'seconds')}
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              {t('sharedNoData')}
                            </Typography>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={classes.gauges}>
                      <Gauge
                        label={t('positionFuel')}
                        value={fuelIsVolume ? volumeFromLiters(fuelValue, volumeUnit) : fuelValue}
                        max={fuelMax}
                        marks={[
                          { label: 'E', angle: 135 },
                          { label: '½', angle: 270 },
                          { label: 'F', angle: 405 },
                        ]}
                        unit={fuelUnit}
                      />

                      <Gauge
                        label={t('positionSpeed')}
                        value={speedValue}
                        max={speedGaugeMax}
                        marks={Array.from({ length: GAUGE_TICKS }, (_, index) => ({
                          label: String(Math.round((speedGaugeMax * index) / (GAUGE_TICKS - 1))),
                          angle: tickAngle(index),
                        }))}
                        primary
                      />

                      <Gauge
                        label={t('positionBattery')}
                        value={batteryValue}
                        min={voltage != null ? 8 : 0}
                        max={batteryMax}
                        marks={
                          voltage != null
                            ? [
                                { label: '8', angle: 135 },
                                { label: '12', angle: 270 },
                                { label: '16', angle: 405 },
                              ]
                            : [
                                { label: '0', angle: 135 },
                                { label: '50', angle: 270 },
                                { label: '100', angle: 405 },
                              ]
                        }
                        unit={batteryUnit}
                      />
                    </div>

                    <div className={classes.sidePanel}>
                      <VideocamOffIcon className={classes.muted} fontSize="large" />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </Rnd>
        )}
      </div>

      {position && (
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem
            onClick={() => navigate(`/settings/device/${deviceId}/command`)}
            disabled={disableActions}
          >
            {t('commandTitle')}
          </MenuItem>

          <MenuItem
            onClick={() => navigate(`/stream?deviceId=${deviceId}`)}
            disabled={position.protocol !== 'jt808'}
          >
            {t('linkLiveVideo')}
          </MenuItem>

          {!readonly && <MenuItem onClick={handleGeofence}>{t('sharedCreateGeofence')}</MenuItem>}

          <MenuItem
            component={RouterLink}
            to={`/position/${position.id}`}
            onClick={() => setAnchorEl(null)}
          >
            {t('sharedShowDetails')}
          </MenuItem>

          <MenuItem
            component="a"
            target="_blank"
            rel="noreferrer"
            href={`https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`}
          >
            {t('linkGoogleMaps')}
          </MenuItem>

          <MenuItem
            component="a"
            target="_blank"
            rel="noreferrer"
            href={`https://maps.apple.com/?ll=${position.latitude},${position.longitude}`}
          >
            {t('linkAppleMaps')}
          </MenuItem>

          <MenuItem
            component="a"
            target="_blank"
            rel="noreferrer"
            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.latitude}%2C${position.longitude}&heading=${position.course}`}
          >
            {t('linkStreetView')}
          </MenuItem>

          {navigationAppTitle && navigationAppLink && (
            <MenuItem
              component="a"
              target="_blank"
              rel="noreferrer"
              href={navigationAppLink
                .replace('{latitude}', position.latitude)
                .replace('{longitude}', position.longitude)}
            >
              {navigationAppTitle}
            </MenuItem>
          )}

          {!shareDisabled && !user.temporary && (
            <MenuItem onClick={() => navigate(`/settings/device/${deviceId}/share`)}>
              <Typography color="secondary">{t('sharedShare')}</Typography>
            </MenuItem>
          )}
        </Menu>
      )}

      <RemoveDialog
        open={removing}
        endpoint="devices"
        itemId={deviceId}
        onResult={(removed) => handleRemove(removed)}
      />
    </>
  );
};

export default StatusCard;
