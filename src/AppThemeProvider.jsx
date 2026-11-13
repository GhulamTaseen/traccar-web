import { createContext, use } from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider, useMediaQuery } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import theme from './common/theme';
import { useLocalization } from './common/components/LocalizationProvider';
import usePersistedState from './common/util/usePersistedState';

const ThemeModeContext = createContext(null);
export const useThemeMode = () => use(ThemeModeContext);

const cache = {
  ltr: createCache({
    key: 'muiltr',
    stylisPlugins: [prefixer],
  }),
  rtl: createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
  }),
};

const AppThemeProvider = ({ children }) => {
  const server = useSelector((state) => state.session.server);
  const { direction } = useLocalization();

  const serverDarkMode = server?.attributes?.darkMode;
  const preferDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = usePersistedState('themeMode', null);
  const enforced = server?.forceSettings && serverDarkMode !== undefined;
  const darkMode = enforced
    ? serverDarkMode
    : mode
      ? mode === 'dark'
      : (serverDarkMode ?? preferDarkMode);

  const themeInstance = theme(server, darkMode, direction);

  return (
    <CacheProvider value={cache[direction]}>
      <ThemeModeContext value={{ darkMode, setMode, enforced }}>
        <ThemeProvider theme={themeInstance}>{children}</ThemeProvider>
      </ThemeModeContext>
    </CacheProvider>
  );
};

export default AppThemeProvider;
