import { useMediaQuery, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import LogoImage from './LogoImage';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    height: '100%',
    backgroundColor: theme.palette.background.default,
    backgroundImage: `radial-gradient(1100px 520px at 50% -18%, ${alpha(
      theme.palette.primary.main,
      theme.palette.mode === 'dark' ? 0.22 : 0.12,
    )} 0%, ${alpha(theme.palette.primary.main, 0)} 70%)`,
  },
  sidebar: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    background: `linear-gradient(155deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 60%, ${theme.palette.secondary.dark} 120%)`,
    paddingBottom: theme.spacing(5),
    width: theme.dimensions.sidebarWidth,
    [theme.breakpoints.down('lg')]: {
      width: theme.dimensions.sidebarWidthTablet,
    },
    [theme.breakpoints.down('sm')]: {
      width: '0px',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -120,
      insetInlineStart: -80,
      width: 420,
      height: 420,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${alpha('#ffffff', 0.24)} 0%, ${alpha('#ffffff', 0)} 65%)`,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -160,
      insetInlineEnd: -120,
      width: 480,
      height: 480,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${alpha('#000000', 0.22)} 0%, ${alpha('#000000', 0)} 65%)`,
    },
    '& > *': {
      position: 'relative',
      zIndex: 1,
    },
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
    backgroundImage: 'none',
    borderRadius: 0,
    boxShadow: 'none',
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  form: {
    position: 'relative',
    isolation: 'isolate',
    width: '100%',
    maxWidth: 400,
    padding: theme.spacing(4.5, 4),
    borderRadius: 20,
    border: `1px solid ${theme.palette.surface.outline}`,
    backgroundColor: alpha(
      theme.palette.background.paper,
      theme.palette.mode === 'dark' ? 0.82 : 0.9,
    ),
    backgroundImage: 'none',
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 30px 70px -30px rgba(0, 0, 0, 0.9)'
        : '0 1px 0 rgba(255, 255, 255, 0.8) inset, 0 30px 70px -34px rgba(16, 24, 40, 0.32)',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      zIndex: -1,
      borderRadius: 'inherit',
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3, 2.5),
      borderRadius: 16,
    },
  },
}));

const LoginLayout = ({ children }) => {
  const { classes } = useStyles();
  const theme = useTheme();

  return (
    <main className={classes.root}>
      <div className={classes.sidebar}>
        {!useMediaQuery(theme.breakpoints.down('lg')) && (
          <LogoImage color={theme.palette.secondary.contrastText} />
        )}
      </div>
      <Paper className={classes.paper}>
        <form className={classes.form}>{children}</form>
      </Paper>
    </main>
  );
};

export default LoginLayout;
