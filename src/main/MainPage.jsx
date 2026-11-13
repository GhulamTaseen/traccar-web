import { lazy, Suspense, useState, useEffect } from 'react';
import { Paper, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useDispatch, useSelector } from 'react-redux';
import { useOutletContext } from 'react-router-dom';
import DeviceList from './DeviceList';
import StatusCard from '../common/components/StatusCard';
import { devicesActions } from '../store';
import usePersistedState from '../common/util/usePersistedState';
import useFilter from './useFilter';
import MainToolbar from './MainToolbar';
import { useTranslation } from '../common/components/LocalizationProvider';

const MainMap = lazy(() => import('./MainMap'));

const useStyles = makeStyles()((theme) => ({
  root: { height: '100%', position: 'relative', overflow: 'hidden' },
  panel: {
    position: 'absolute',
    insetInlineStart: 24,
    top: 28,
    bottom: 24,
    width: theme.dimensions.drawerWidthDesktop,
    maxWidth: 'calc(100% - 32px)',
    zIndex: 4,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: `1px solid ${theme.palette.surface.outline}`,
    backgroundColor: theme.palette.surface.glass,
    backdropFilter: 'blur(20px)',
    [theme.breakpoints.down('sm')]: { insetInlineStart: 12, top: 12, bottom: 12 },
  },
  list: { flex: 1, minHeight: 0 },
}));

const MainPage = () => {
  const { classes } = useStyles();
  const t = useTranslation();
  const dispatch = useDispatch();
  const { devicesOpen, setDevicesOpen, onEventsClick } = useOutletContext();
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const positions = useSelector((state) => state.session.positions);
  const selectedPosition = positions[selectedDeviceId];
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = usePersistedState('deviceFilter', {
    statuses: [],
    groups: [],
    geofences: [],
  });
  const [filterSort, setFilterSort] = usePersistedState('filterSort', '');
  const [filterMap, setFilterMap] = usePersistedState('filterMap', false);

  useEffect(() => {
    if (selectedDeviceId) setDevicesOpen(false);
  }, [selectedDeviceId, setDevicesOpen]);

  useFilter(
    keyword,
    filter,
    filterSort,
    filterMap,
    positions,
    setFilteredDevices,
    setFilteredPositions,
  );

  return (
    <div className={classes.root}>
      <Suspense fallback={null}>
        <MainMap
          filteredPositions={filteredPositions}
          selectedPosition={selectedPosition}
          onEventsClick={onEventsClick}
          panelOpen={devicesOpen || !!selectedDeviceId}
        />
      </Suspense>
      {devicesOpen && (
        <Paper className={classes.panel} elevation={4}>
          <MainToolbar
            filteredDevices={filteredDevices}
            devicesOpen={devicesOpen}
            setDevicesOpen={setDevicesOpen}
            keyword={keyword}
            setKeyword={setKeyword}
            filter={filter}
            setFilter={setFilter}
            filterSort={filterSort}
            setFilterSort={setFilterSort}
            filterMap={filterMap}
            setFilterMap={setFilterMap}
          />
          <div className={classes.list}>
            <DeviceList devices={filteredDevices} />
          </div>
          {!filteredDevices.length && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
              {t('sharedNoData')}
            </Typography>
          )}
        </Paper>
      )}
      {selectedDeviceId && (
        <StatusCard
          deviceId={selectedDeviceId}
          position={selectedPosition}
          onClose={() => dispatch(devicesActions.selectId(null))}
          dashboard
        />
      )}
    </div>
  );
};

export default MainPage;
