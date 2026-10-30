import { alpha } from '@mui/material/styles';

const isDark = (theme) => theme.palette.mode === 'dark';

const ambientShadow = (theme, { y = 12, blur = 32, opacity = 0.16 } = {}) =>
  isDark(theme)
    ? `0 1px 1px rgba(0, 0, 0, 0.4), 0 ${y}px ${blur}px -16px rgba(0, 0, 0, 0.65)`
    : `0 1px 2px rgba(16, 24, 40, 0.04), 0 ${y}px ${blur}px -16px rgba(16, 24, 40, ${opacity})`;

export default {
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      html: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: `${alpha(theme.palette.text.primary, 0.24)} transparent`,
      },
      '*::-webkit-scrollbar': {
        width: 10,
        height: 10,
      },
      '*::-webkit-scrollbar-track': {
        backgroundColor: 'transparent',
      },
      '*::-webkit-scrollbar-thumb': {
        backgroundColor: alpha(theme.palette.text.primary, 0.18),
        backgroundClip: 'content-box',
        border: '2px solid transparent',
        borderRadius: 999,
      },
      '*::-webkit-scrollbar-thumb:hover': {
        backgroundColor: alpha(theme.palette.text.primary, 0.32),
      },
      '*::-webkit-scrollbar-corner': {
        backgroundColor: 'transparent',
      },
      '::selection': {
        backgroundColor: alpha(theme.palette.primary.main, 0.22),
      },
    }),
  },
  MuiUseMediaQuery: {
    defaultProps: {
      noSsr: true,
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderColor: theme.palette.divider,
      }),
      rounded: {
        borderRadius: 14,
      },
    },
  },
  MuiCard: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 14,
        border: `1px solid ${theme.palette.surface.outline}`,
        backgroundColor: theme.palette.surface.raised,
        backgroundImage: 'none',
        boxShadow: ambientShadow(theme),
      }),
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        backgroundImage: 'none',
        backgroundColor: alpha(theme.palette.background.paper, isDark(theme) ? 0.78 : 0.82),
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        borderInlineEnd: `1px solid ${theme.palette.divider}`,
      }),
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 10,
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: '0.01em',
        paddingInline: theme.spacing(2.25),
        transition: theme.transitions.create(['background-color', 'box-shadow', 'transform'], {
          duration: theme.transitions.duration.short,
        }),
      }),
      sizeMedium: {
        height: 40,
      },
      sizeLarge: {
        height: 46,
      },
      containedPrimary: ({ theme }) => ({
        boxShadow: `0 6px 18px -8px ${alpha(theme.palette.primary.main, 0.65)}`,
        '&:hover': {
          boxShadow: `0 10px 24px -8px ${alpha(theme.palette.primary.main, 0.7)}`,
        },
      }),
      containedSecondary: ({ theme }) => ({
        boxShadow: `0 6px 18px -8px ${alpha(theme.palette.secondary.main, 0.65)}`,
        '&:hover': {
          boxShadow: `0 10px 24px -8px ${alpha(theme.palette.secondary.main, 0.7)}`,
        },
      }),
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 10,
        transition: theme.transitions.create(['background-color', 'color'], {
          duration: theme.transitions.duration.short,
        }),
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, isDark(theme) ? 0.12 : 0.07),
        },
      }),
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        position: 'relative',
        marginInline: theme.spacing(1),
        marginBlock: 2,
        borderRadius: 10,
        minHeight: 42,
        transition: theme.transitions.create(['background-color', 'color', 'box-shadow'], {
          duration: theme.transitions.duration.short,
        }),
        '& .MuiListItemIcon-root': {
          minWidth: 40,
          color: 'inherit',
        },
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, isDark(theme) ? 0.1 : 0.06),
        },
        '&.Mui-selected': {
          color: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, isDark(theme) ? 0.18 : 0.1),
          backgroundImage: `linear-gradient(${theme.direction === 'rtl' ? '270deg' : '90deg'}, ${alpha(
            theme.palette.primary.main,
            isDark(theme) ? 0.22 : 0.14,
          )} 0%, ${alpha(theme.palette.primary.main, 0)} 100%)`,
          boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.16)}`,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, isDark(theme) ? 0.22 : 0.14),
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            insetInlineStart: 4,
            top: '50%',
            width: 3,
            height: '55%',
            borderRadius: 3,
            backgroundColor: theme.palette.primary.main,
            transform: 'translateY(-50%)',
          },
        },
      }),
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 10,
        backgroundColor: isDark(theme) ? alpha('#ffffff', 0.04) : theme.palette.background.default,
        transition: theme.transitions.create(['background-color', 'box-shadow'], {
          duration: theme.transitions.duration.short,
        }),
        '&:hover': {
          backgroundColor: isDark(theme) ? alpha('#ffffff', 0.06) : '#ffffff',
        },
        '&.Mui-focused': {
          backgroundColor: isDark(theme) ? alpha('#ffffff', 0.08) : '#ffffff',
        },
      }),
    },
  },
  MuiFormControl: {
    defaultProps: {
      size: 'small',
    },
  },
  MuiSnackbar: {
    defaultProps: {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center',
      },
    },
  },
  MuiTooltip: {
    defaultProps: {
      enterDelay: 500,
      enterNextDelay: 500,
    },
    styleOverrides: {
      tooltip: {
        borderRadius: 8,
        fontWeight: 500,
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        '@media print': {
          color: theme.palette.alwaysDark.main,
        },
      }),
    },
  },
};
