import { makeStyles } from 'tss-react/mui';

const GAUGE_START_ANGLE = 135;
const GAUGE_SWEEP = 270;
const GAUGE_TICKS = 9;

const useStyles = makeStyles()((theme) => ({
  gauge: {
    minWidth: 0,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  gaugeSvg: {
    display: 'block',
    width: '100%',
    maxWidth: 120,
    margin: '0 auto',
  },
  gaugePrimary: {
    maxWidth: 168,
    [theme.breakpoints.down('sm')]: {
      maxWidth: 144,
    },
  },
}));

const formatValue = (value) => (value == null ? '--' : String(Number(value.toFixed(2))));

const polarPoint = (angle, radius) => {
  const radians = (angle * Math.PI) / 180;
  return { x: 60 + radius * Math.cos(radians), y: 60 + radius * Math.sin(radians) };
};

const arcPath = (start, end, radius) => {
  const first = polarPoint(start, radius);
  const last = polarPoint(end, radius);
  const largeArc = end - start > 180 ? 1 : 0;
  return `M ${first.x} ${first.y} A ${radius} ${radius} 0 ${largeArc} 1 ${last.x} ${last.y}`;
};

const tickAngle = (index) => GAUGE_START_ANGLE + (index * GAUGE_SWEEP) / (GAUGE_TICKS - 1);

const Gauge = ({
  label,
  value,
  min = 0,
  max = 100,
  marks = [],
  displayValue,
  displayUnit,
  unit,
  primary = false,
}) => {
  const { classes } = useStyles();

  const fraction = value == null ? null : Math.max(0, Math.min(1, (value - min) / (max - min)));
  const gaugeValue = formatValue(value);
  const centerValue = displayValue ?? gaugeValue;
  const hasCenterUnit = displayUnit != null;
  const ariaLabel = `${label}: ${gaugeValue} ${unit || ''}${
    displayValue != null ? `; ${displayValue} ${displayUnit || ''}` : ''
  }`;

  return (
    <div className={classes.gauge} role="img" aria-label={ariaLabel}>
      <svg
        className={`${classes.gaugeSvg}${primary ? ` ${classes.gaugePrimary}` : ''}`}
        viewBox="0 0 120 120"
        aria-hidden="true"
      >
        <circle cx="60" cy="60" r="54" fill="#111820" stroke="#34434e" strokeWidth="2" />
        <circle cx="60" cy="60" r="46" fill="#071017" stroke="#52616b" strokeWidth="1.5" />

        <path d={arcPath(135, 171, 43)} fill="none" stroke="#d34b4b" strokeWidth="7" />
        <path d={arcPath(174, 209, 43)} fill="none" stroke="#e4b43b" strokeWidth="7" />
        <path d={arcPath(212, 405, 43)} fill="none" stroke="#42b77a" strokeWidth="7" />

        {Array.from({ length: GAUGE_TICKS }, (_, index) => {
          const inner = polarPoint(tickAngle(index), 35);
          const outer = polarPoint(tickAngle(index), 43);
          return (
            <line
              key={index}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#e0e6eb"
              strokeWidth={index % 2 === 0 ? 2.5 : 1.5}
            />
          );
        })}

        {marks.map(({ label: mark, angle }) => {
          const point = polarPoint(angle, 29);
          return (
            <text
              key={`${mark}-${angle}`}
              x={point.x}
              y={point.y}
              fill="#e0e6eb"
              fontSize={primary ? 7 : 6}
              fontWeight="600"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {mark}
            </text>
          );
        })}

        {fraction != null && (
          <line
            x1="60"
            y1="60"
            x2="60"
            y2="23"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            transform={`rotate(${GAUGE_START_ANGLE + 90 + fraction * GAUGE_SWEEP} 60 60)`}
          />
        )}

        <circle cx="60" cy="60" r="5" fill="#ffffff" />
        <rect x="32" y="75" width="56" height="19" rx="2" fill="#17232b" stroke="#52616b" />

        <text
          x="60"
          y="88"
          fill="#ffffff"
          fontSize={hasCenterUnit ? 14 : primary ? 16 : 14}
          fontWeight="600"
          textAnchor="middle"
        >
          {centerValue}
        </text>

        {hasCenterUnit && (
          <text x="60" y="99" fill="#b7c2ca" fontSize="8" fontWeight="700" textAnchor="middle">
            {displayUnit}
          </text>
        )}

        {unit && (
          <text
            x="60"
            y={hasCenterUnit ? 108 : 103}
            fill="#b7c2ca"
            fontSize="9"
            fontWeight="700"
            textAnchor="middle"
          >
            {unit}
          </text>
        )}
      </svg>
    </div>
  );
};

export { GAUGE_TICKS, tickAngle };
export default Gauge;
