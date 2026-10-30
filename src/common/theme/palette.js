import { grey, green, indigo } from '@mui/material/colors';

const validatedColor = (color) => (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null);

const neutrals = (darkMode) =>
  darkMode
    ? {
        background: {
          default: '#0b0f16',
          paper: '#141a24',
        },
        divider: 'rgba(255, 255, 255, 0.08)',
        text: {
          primary: '#e7ecf3',
          secondary: '#98a4b7',
          disabled: 'rgba(231, 236, 243, 0.38)',
        },
        surface: {
          main: '#141a24',
          raised: '#1a2130',
          sunken: '#0f141c',
          glass: 'rgba(20, 26, 36, 0.72)',
          outline: 'rgba(255, 255, 255, 0.1)',
        },
      }
    : {
        background: {
          default: '#f4f6fa',
          paper: '#ffffff',
        },
        divider: 'rgba(16, 24, 40, 0.08)',
        text: {
          primary: '#101828',
          secondary: '#667085',
          disabled: 'rgba(16, 24, 40, 0.36)',
        },
        surface: {
          main: '#ffffff',
          raised: '#fbfcfe',
          sunken: '#eef1f7',
          glass: 'rgba(255, 255, 255, 0.78)',
          outline: 'rgba(16, 24, 40, 0.07)',
        },
      };

export default (server, darkMode) => {
  const neutral = neutrals(darkMode);

  return {
    mode: darkMode ? 'dark' : 'light',
    background: neutral.background,
    divider: neutral.divider,
    text: neutral.text,
    surface: neutral.surface,
    primary: {
      main:
        validatedColor(server?.attributes?.colorPrimary) || (darkMode ? indigo[200] : indigo[900]),
    },
    secondary: {
      main:
        validatedColor(server?.attributes?.colorSecondary) || (darkMode ? green[200] : green[800]),
    },
    neutral: {
      main: grey[500],
    },
    geometry: {
      main: '#3bb2d0',
    },
    alwaysDark: {
      main: grey[900],
    },
  };
};
