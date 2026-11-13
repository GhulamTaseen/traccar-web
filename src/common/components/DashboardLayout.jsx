import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Autocomplete,
  Avatar,
  Badge,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import { useThemeMode } from '../../AppThemeProvider';
import { devicesActions, sessionActions } from '../../store';
import { useTranslation } from './LocalizationProvider';
import { nativePostMessage } from './NativeInterface';
import { useAdministrator, useRestriction } from '../util/permissions';
import useFeatures from '../util/useFeatures';
import { deviceSearchText, fleetStatistics } from '../util/vehicle';
import { useCatch } from '../../reactHelper';
import EventsDrawer from '../../main/EventsDrawer';
import Logo from '../../resources/images/logo.svg?react';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'grid',
    gridTemplateColumns: `${theme.dimensions.dashboardSidebarWidth}px minmax(0, 1fr)`,
    gridTemplateRows: `${theme.dimensions.dashboardHeaderHeight}px minmax(0, 1fr)`,
    flex: 1,
    minHeight: 0,
    background: theme.palette.background.default,
    [theme.breakpoints.down('md')]: { gridTemplateColumns: 'minmax(0, 1fr)' },
    '@media print': { display: 'block', height: 'auto' },
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5),
    minWidth: 0,
    flexShrink: 0,
    gap: theme.spacing(1),
    color: theme.palette.text.primary,
    '& svg': { width: '100%', maxHeight: 30 },
    '& img': { maxWidth: '100%', maxHeight: 34, objectFit: 'contain' },
  },
  sidebar: {
    gridColumn: 1,
    gridRow: '1 / -1',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    background: theme.palette.surface.glass,
    borderInlineEnd: `1px solid ${theme.palette.divider}`,
    zIndex: 7,
    '@media print': { display: 'none' },
  },
  navigationScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none', width: 0 },
  },
  navigationBottom: {
    flexShrink: 0,
    marginTop: 'auto',
    borderTop: `1px solid ${theme.palette.divider}`,
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  navigation: {
    padding: theme.spacing(0.5, 0),
    '&& .MuiListItemButton-root': {
      minHeight: 38,
      margin: theme.spacing(0.25, 0.5),
      padding: theme.spacing(0.5, 1),
      borderInlineStart: '2px solid transparent',
      '&.Mui-selected': {
        borderInlineStartColor: theme.palette.geometry.main,
        background: alpha(theme.palette.geometry.main, 0.09),
        '&::before': { display: 'none' },
      },
      '& .MuiListItemIcon-root': { minWidth: 24, color: theme.palette.text.secondary },
    },
    '& .MuiSvgIcon-root': { fontSize: 16 },
    '& .MuiListItemText-root': { minWidth: 0 },
    '& .MuiListItemText-primary': {
      fontSize: 11,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  header: {
    gridColumn: 2,
    gridRow: 1,
    minWidth: 0,
    zIndex: 6,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(0.75, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    background: theme.palette.surface.glass,
    backdropFilter: 'blur(20px)',
    [theme.breakpoints.down('md')]: { gridColumn: 1, gap: 8, paddingInline: 8 },
    '@media print': { display: 'none' },
  },
  search: {
    width: 300,
    maxWidth: '40%',
    '& .MuiOutlinedInput-root': {
      fontSize: 12,
      background: alpha(theme.palette.surface.sunken, 0.7),
    },
    [theme.breakpoints.down('sm')]: { flex: 1, width: 'auto', maxWidth: 'none' },
  },
  statistics: {
    marginInlineStart: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    [theme.breakpoints.down('sm')]: { gap: 8, marginInlineStart: 0 },
  },
  statistic: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 3,
    '& .MuiTypography-root': { fontSize: 9, lineHeight: 1.1 },
  },
  count: {
    width: 27,
    height: 27,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    fontSize: 12,
    border: '1px solid',
    background: theme.palette.surface.main,
    boxShadow: `0 0 0 3px ${alpha(theme.palette.text.primary, 0.025)}`,
    [theme.breakpoints.down('sm')]: { width: 23, height: 23, fontSize: 11 },
  },
  content: {
    gridColumn: 2,
    gridRow: 2,
    minWidth: 0,
    minHeight: 0,
    position: 'relative',
    overflow: 'auto',
    [theme.breakpoints.down('md')]: { gridColumn: 1 },
    '@media print': { overflow: 'visible' },
  },
}));

const DashboardLayout = () => {
  const { classes } = useStyles();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const t = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const admin = useAdministrator();
  const readonly = useRestriction('readonly');
  const disableReports = useRestriction('disableReports');
  const features = useFeatures();
  const { darkMode, setMode, enforced } = useThemeMode();
  const user = useSelector((state) => state.session.user);
  const server = useSelector((state) => state.session.server);
  const devices = useSelector((state) => state.devices.items);
  const positions = useSelector((state) => state.session.positions);
  const selectedId = useSelector((state) => state.devices.selectedId);
  const socket = useSelector((state) => state.session.socket);
  const counts = useMemo(() => fleetStatistics(devices, positions), [devices, positions]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [devicesOpen, setDevicesOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [accountAnchor, setAccountAnchor] = useState(null);

  const go = (path) => {
    setMobileOpen(false);
    setEventsOpen(false);
    setDevicesOpen(false);
    navigate(path);
  };

  const handleLogout = useCatch(async () => {
    setAccountAnchor(null);
    const notificationToken = window.localStorage.getItem('notificationToken');
    if (notificationToken && !user.readonly) {
      window.localStorage.removeItem('notificationToken');
      const tokens = user.attributes.notificationTokens?.split(',') || [];
      if (tokens.includes(notificationToken)) {
        await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...user,
            attributes: {
              ...user.attributes,
              notificationTokens:
                tokens.length > 1
                  ? tokens.filter((token) => token !== notificationToken).join(',')
                  : undefined,
            },
          }),
        });
      }
    }
    await fetch('/api/session', { method: 'DELETE' });
    nativePostMessage('logout');
    navigate('/login');
    dispatch(sessionActions.updateUser(null));
  });

  const reportsPath = selectedId ? `/reports/combined?deviceId=${selectedId}` : '/reports/combined';
  const navItems = [
    {
      label: t('dashboardTrackerMap'),
      icon: <HomeOutlinedIcon />,
      selected: location.pathname === '/' && !selectedId && !devicesOpen,
      action: () => {
        dispatch(devicesActions.selectId(null));
        go('/');
      },
    },
    {
      label: t('dashboardVehicles'),
      icon: <DirectionsCarOutlinedIcon />,
      selected: location.pathname === '/' && (!!selectedId || devicesOpen),
      action: () => {
        setDevicesOpen(location.pathname !== '/' || !devicesOpen);
        setMobileOpen(false);
        navigate('/');
      },
      expandable: true,
    },
    ...(!disableReports
      ? [
          {
            label: t('reportTitle'),
            icon: <DescriptionOutlinedIcon />,
            selected: location.pathname.startsWith('/reports'),
            action: () => go(reportsPath),
          },
        ]
      : []),
    ...(!readonly
      ? [
          {
            label: t('dashboardManageVehicles'),
            icon: <DirectionsCarOutlinedIcon />,
            selected:
              location.pathname.startsWith('/settings/device') &&
              !location.pathname.endsWith('/command'),
            action: () => go('/settings/devices'),
          },
        ]
      : []),
    ...(!features.disableSavedCommands || selectedId
      ? [
          {
            label: t('commandTitle'),
            icon: <SendOutlinedIcon />,
            selected:
              location.pathname.startsWith('/settings/command') ||
              location.pathname.endsWith('/command'),
            disabled: !selectedId && readonly,
            action: () =>
              go(selectedId ? `/settings/device/${selectedId}/command` : '/settings/commands'),
          },
        ]
      : []),
    ...(!readonly && !features.disableGroups
      ? [
          {
            label: t('settingsGroups'),
            icon: <AccountTreeOutlinedIcon />,
            selected: location.pathname.startsWith('/settings/group'),
            action: () => go('/settings/groups'),
          },
        ]
      : []),
    ...(!readonly
      ? [
          {
            label: t('sharedNotifications'),
            icon: <NotificationsNoneOutlinedIcon />,
            selected: location.pathname.startsWith('/settings/notification'),
            action: () => go('/settings/notifications'),
          },
        ]
      : []),
  ];

  const navigation = (
    <>
      <Button
        className={classes.brand}
        onClick={() => go('/')}
        aria-label={t('mapTitle')}
        sx={{ height: theme.dimensions.dashboardHeaderHeight, borderRadius: 0 }}
      >
        {server.attributes.logo ? (
          <img
            src={
              darkMode && server.attributes.logoInverted
                ? server.attributes.logoInverted
                : server.attributes.logo
            }
            alt=""
          />
        ) : (
          <Logo />
        )}
      </Button>
      <div className={classes.navigationScroll}>
        <List className={classes.navigation} component="nav" aria-label={t('dashboardNavigation')}>
          {navItems.map((item) => (
            <ListItemButton
              key={item.label}
              selected={item.selected}
              disabled={item.disabled}
              onClick={item.action}
              title={item.label}
              aria-expanded={item.expandable ? devicesOpen : undefined}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
              {item.expandable && (
                <ExpandMoreIcon sx={{ transform: devicesOpen ? 'rotate(180deg)' : undefined }} />
              )}
            </ListItemButton>
          ))}
        </List>
      </div>
      <div className={classes.navigationBottom}>
        <List className={classes.navigation}>
          <ListItemButton
            onClick={() => go('/settings/preferences?menu=true')}
            selected={location.pathname === '/settings/preferences'}
          >
            <ListItemIcon>
              <SettingsOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary={t('settingsTitle')} />
          </ListItemButton>
          <ListItemButton
            onClick={(event) => setAccountAnchor(event.currentTarget)}
            title={user.name || t('settingsUser')}
          >
            <ListItemIcon>
              <Avatar sx={{ width: 20, height: 20, fontSize: 10 }}>
                {user.name?.slice(0, 1).toUpperCase()}
              </Avatar>
            </ListItemIcon>
            <ListItemText primary={user.name || t('settingsUser')} />
          </ListItemButton>
        </List>
      </div>
    </>
  );

  return (
    <div className={classes.root}>
      {desktop ? (
        <aside className={classes.sidebar}>{navigation}</aside>
      ) : (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          slotProps={{
            paper: {
              sx: { width: 200, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
            },
          }}
        >
          {navigation}
        </Drawer>
      )}
      <header className={classes.header}>
        {!desktop && (
          <IconButton aria-label={t('dashboardNavigation')} onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>
        )}
        <Autocomplete
          className={classes.search}
          size="small"
          options={Object.values(devices)}
          getOptionLabel={(device) => device.name}
          getOptionDisabled={(device) => !admin && device.disabled}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          filterOptions={(options, { inputValue }) =>
            options.filter((device) =>
              deviceSearchText(device).includes(inputValue.trim().toLocaleLowerCase()),
            )
          }
          value={devices[selectedId] || null}
          onChange={(_, device) => {
            dispatch(devicesActions.selectId(device?.id ?? null));
            go('/');
          }}
          renderOption={({ key, ...props }, device) => (
            <li key={key} {...props}>
              <Box>
                <Typography variant="body2">{device.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {device.uniqueId}
                  {device.attributes?.nickname ? ` · ${device.attributes.nickname}` : ''}
                </Typography>
              </Box>
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={t('sharedSearchDevices')}
              slotProps={{
                ...params.slotProps,
                input: {
                  ...params.slotProps.input,
                  startAdornment: (
                    <SearchIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                  ),
                },
                htmlInput: {
                  ...params.slotProps.htmlInput,
                  'aria-label': t('sharedSearchDevices'),
                },
              }}
            />
          )}
        />
        <Box className={classes.statistics} aria-label={t('dashboardFleetStatistics')}>
          {[
            ['online', t('deviceStatusOnline'), theme.palette.success.main],
            ['idle', t('dashboardIdle'), theme.palette.geometry.main],
            ['unknown', t('deviceStatusUnknown'), theme.palette.warning.main],
            ['offline', t('deviceStatusOffline'), theme.palette.text.secondary],
          ].map(([key, label, color]) => (
            <Tooltip
              key={key}
              title={key === 'idle' ? `${label} · ${t('deviceStatusOnline')}` : label}
            >
              <Box className={classes.statistic} aria-label={`${label}: ${counts[key]}`}>
                <span className={classes.count} style={{ borderColor: alpha(color, 0.55) }}>
                  {counts[key]}
                </span>
                <Typography color="text.secondary">{label}</Typography>
              </Box>
            </Tooltip>
          ))}
        </Box>
        <Tooltip title={t(darkMode ? 'dashboardLightMode' : 'dashboardDarkMode')}>
          <span>
            <IconButton
              size="small"
              disabled={enforced}
              aria-label={t(darkMode ? 'dashboardLightMode' : 'dashboardDarkMode')}
              onClick={() => setMode(darkMode ? 'light' : 'dark')}
              sx={{ color: 'geometry.main', bgcolor: 'action.hover' }}
            >
              <Badge color="error" variant="dot" invisible={socket !== false}>
                {darkMode ? (
                  <LightModeOutlinedIcon fontSize="small" />
                ) : (
                  <DarkModeOutlinedIcon fontSize="small" />
                )}
              </Badge>
            </IconButton>
          </span>
        </Tooltip>
      </header>
      <main className={classes.content}>
        <Outlet
          context={{ devicesOpen, setDevicesOpen, onEventsClick: () => setEventsOpen(true) }}
        />
      </main>
      <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />
      <Menu anchorEl={accountAnchor} open={!!accountAnchor} onClose={() => setAccountAnchor(null)}>
        {!readonly && (
          <MenuItem
            onClick={() => {
              setAccountAnchor(null);
              go(`/settings/user/${user.id}`);
            }}
          >
            {t('settingsUser')}
          </MenuItem>
        )}
        <MenuItem onClick={handleLogout}>{t('loginLogout')}</MenuItem>
      </Menu>
    </div>
  );
};

export default DashboardLayout;
