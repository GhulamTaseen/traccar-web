import { alpha } from '@mui/material/styles';

const stylePairs = [
  ['locationIqStreets', 'locationIqDark'],
  ['mapboxStreets', 'mapboxStreetsDark'],
];

export const themedMapStyle = (styles, selectedId, dark) => {
  const selected = styles.find((style) => style.id === selectedId) || styles[0];
  const pair = stylePairs.find((ids) => ids.includes(selected.id));
  const style = styles.find((candidate) => candidate.id === pair?.[dark ? 1 : 0]) || selected;
  const nativeDark = stylePairs.some((ids) => ids[1] === style.id);
  return {
    style,
    filter:
      dark === nativeDark
        ? 'none'
        : `invert(1) hue-rotate(180deg)${dark ? ' brightness(0.85) saturate(0.8)' : ''}`,
  };
};

export const mapThemeStyles = (theme) => ({
  backgroundColor: theme.palette.background.default,
  '& .maplibregl-map': { backgroundColor: theme.palette.background.default },
  '& .maplibregl-ctrl-group, & .maplibregl-ctrl-attrib, & .maplibregl-ctrl-scale': {
    color: theme.palette.text.primary,
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
  },
  '& .maplibregl-ctrl-group': {
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[2],
  },
  '& .maplibregl-ctrl-group button': {
    color: theme.palette.text.primary,
    '& + button': { borderTopColor: theme.palette.divider },
    '&:hover': { backgroundColor: theme.palette.action.hover },
  },
  '& span.maplibregl-ctrl-icon, & .maplibregl-ctrl-attrib-button': {
    filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
  },
  '& .maplibregl-ctrl-group button.maplibregl-ctrl-icon': { filter: 'none' },
  '& .maplibregl-ctrl-attrib a': { color: 'inherit' },
});
