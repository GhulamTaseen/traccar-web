import { useMemo } from 'react';
import { createTheme } from '@mui/material/styles';
import palette from './palette';
import dimensions from './dimensions';
import components from './components';

const buildShadows = (darkMode) => {
  const rgb = darkMode ? '0, 0, 0' : '16, 24, 40';
  const base = darkMode ? 0.22 : 0.04;
  const step = darkMode ? 0.016 : 0.008;

  return [
    'none',
    ...Array.from({ length: 24 }, (_, index) => {
      const elevation = index + 1;
      const offsetY = Math.round(1 + elevation * 1.4);
      const blur = Math.round(3 + elevation * 3);
      const opacity = Math.min(base + elevation * step, darkMode ? 0.7 : 0.3);
      return `0px ${offsetY}px ${blur}px -2px rgba(${rgb}, ${opacity.toFixed(3)})`;
    }),
  ];
};

export default (server, darkMode, direction) =>
  useMemo(
    () =>
      createTheme({
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily: "'Inter', 'Roboto', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
          fontWeightLight: 300,
          fontWeightRegular: 400,
          fontWeightMedium: 500,
          fontWeightBold: 700,
          h1: { fontWeight: 700, letterSpacing: '-0.025em' },
          h2: { fontWeight: 700, letterSpacing: '-0.02em' },
          h3: { fontWeight: 700, letterSpacing: '-0.02em' },
          h4: { fontWeight: 600, letterSpacing: '-0.015em' },
          h5: { fontWeight: 600, letterSpacing: '-0.01em' },
          h6: { fontWeight: 600, letterSpacing: '-0.01em' },
          subtitle1: { fontWeight: 500, letterSpacing: '-0.005em' },
          subtitle2: { fontWeight: 600, letterSpacing: '0' },
          body1: { fontWeight: 400 },
          body2: { fontWeight: 400 },
          button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
          overline: { fontWeight: 600, letterSpacing: '0.08em' },
          caption: { letterSpacing: '0.01em' },
        },
        palette: palette(server, darkMode),
        shadows: buildShadows(darkMode),
        direction,
        dimensions,
        components,
      }),
    [server, darkMode, direction],
  );
