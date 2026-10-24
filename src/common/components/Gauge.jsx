import { useId } from 'react';
import { makeStyles } from 'tss-react/mui';

const GAUGE_START_ANGLE = 135;
const GAUGE_SWEEP = 270;
const GAUGE_TICKS = 9;

const COLORS = {
  green: '#2dcc70',
  amber: '#efad4f',
  orange: '#e67e49',
  red: '#d94140',
  fuelRed: '#e15556',
  fuelAmber: '#f0a83c',
  fuelGreen: '#3eaf6f',
  battDarkRed: '#983526',
  battOrange: '#b8681f',
  battGreen: '#269158',
  battRed: '#b94540',
  yellow: '#f2bd45',
  text: '#e3edf7',
  muted: '#8fb0ca',
  needleRed: '#c0353f',
};

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const PRESETS = {
  speed: {
    startAngle: 150,
    sweep: 240,
    tickCount: 11,
    minorTicks: 0,
    tickRange: [43, 47],
    tickColor: '#5f88ad',
    tickWidth: 0.7,
    endTick: {
      range: [32.5, 47.5],
      width: 1.4,
      color: '#4f7396',
    },
    labelPlacement: 'outside',
    labelRadius: 51,
    labelFontSize: 6.7,
    labelWeight: 600,
    labelColor: '#b5cfe5',
    arcRadius: 38.6,
    arcThickness: 9,
    bands: [
      [0, 0.3, COLORS.green],
      [0.3, 0.55, COLORS.amber],
      [0.55, 0.8, COLORS.orange],
      [0.8, 1, COLORS.red],
    ],
    faceColors: ['#294360', '#0b1b2d'],
    box: {
      w: 52,
      h: 13.1,
      y: 89.8,
      rx: 1.4,
      fill: '#13243a',
      stroke: '#2f5174',
      sw: 0.8,
    },
    valueFontSize: 10.2,
    valueColor: '#e6eff8',
    unitY: 80.5,
    unitFontSize: 10,
    unitColor: '#86a8c6',
    needle: {
      length: 44.3,
      width: 4.4,
      tail: 0,
      back: 0,
      color: '#c8d3e3',
    },
    hub: {
      r: 4.6,
      stroke: '#4b7096',
      sw: 0.8,
      fill: 'none',
      dot: null,
    },
    badgeStyle: {
      y: 3.5,
      h: 5.8,
      fontSize: 4.4,
      weight: 600,
      color: '#a3c6e2',
      spacing: 2.2,
    },
  },

  fuel: {
    startAngle: 190,
    sweep: 160,
    tickCount: 7,
    minorTicks: 0,
    tickRange: [43.9, 48.5],
    tickColor: '#4a678d',
    tickWidth: 2.6,
    endTick: {
      range: [32.7, 47.3],
      width: 3,
      color: '#4a678d',
    },
    showScaleNumbers: false,
    arcRadius: 39.2,
    arcThickness: 9.2,
    bands: [
      [0, 0.15, COLORS.fuelRed],
      [0.15, 0.3, COLORS.fuelAmber],
      [0.3, 1, COLORS.fuelGreen],
    ],
    faceColors: ['#314a66', '#0f1f31'],
    box: {
      w: 34.9,
      h: 19.5,
      y: 80.4,
      rx: 1.6,
      fill: '#172a40',
      stroke: '#3f6590',
      sw: 1,
    },
    valueFontSize: 11.5,
    valueColor: '#f2f6fb',
    endLabels: [
      { label: 'E', x: 23.4, y: 76.6 },
      { label: 'F', x: 96.5, y: 76.6 },
    ],
    endLabelFontSize: 15,
    endLabelColor: '#8497b3',
    needle: {
      length: 40.5,
      width: 4.8,
      tail: 0,
      back: 0,
      color: '#c5d2e4',
    },
    hub: {
      r: 4.7,
      stroke: '#4a6580',
      sw: 0.8,
      fill: 'none',
      dot: null,
    },
  },

  battery: {
    startAngle: 150,
    sweep: 240,
    tickCount: 5,
    minorTicks: 1,
    tickRange: [41, 45.8],
    tickColor: '#a9c4dc',
    tickWidth: 0.7,
    minorTickRange: [43.5, 45.5],
    minorTickColor: '#35506a',
    minorTickWidth: 0.6,
    labelPlacement: 'inside',
    labelRadius: 33.5,
    labelFontSize: 11.3,
    labelWeight: 700,
    labelColor: '#9cbbd6',
    arcRadius: 47.2,
    arcThickness: 3.8,
    bands: [
      [0, 0.125, COLORS.battDarkRed],
      [0.125, 0.3125, COLORS.battOrange],
      [0.3125, 0.6875, COLORS.battGreen],
      [0.6875, 1, COLORS.battRed],
    ],
    faceColors: ['#1e3044', '#091620'],
    box: {
      w: 46.3,
      h: 18.8,
      y: 90.1,
      rx: 2.4,
      fill: '#0f1c26',
      stroke: '#2a4258',
      sw: 0.7,
    },
    digital: true,
    valueFontSize: 14,
    valueColor: '#33bb69',
    unitY: 81.9,
    unitFontSize: 8.6,
    unitColor: COLORS.yellow,
    unitLetterSpacing: 1,
    unitPill: {
      w: 39.3,
      h: 11.2,
      y: 77.1,
      fill: '#101c27',
      stroke: '#2a4560',
    },
    innerLabel: {
      text: 'V',
      y: 45.1,
      size: 13,
      color: '#a8d8f0',
    },
    needle: {
      length: 40,
      width: 3.4,
      tail: 7.6,
      back: 0,
      color: '#dc2f35',
    },
    hub: {
      r: 3.8,
      stroke: '#4c6f95',
      sw: 1.1,
      fill: 'none',
      dot: '#e04048',
      dotR: 1.4,
    },
  },
};

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
    overflow: 'visible',
  },
  gaugePrimary: {
    maxWidth: 180,
    [theme.breakpoints.down('sm')]: {
      maxWidth: 150,
    },
  },
}));

const formatValue = (value) =>
  value == null || !Number.isFinite(Number(value))
    ? '--'
    : String(Number(Number(value).toFixed(2)));

const polarPoint = (angle, radius) => {
  const radians = (angle * Math.PI) / 180;

  return {
    x: 60 + radius * Math.cos(radians),
    y: 60 + radius * Math.sin(radians),
  };
};

const arcPath = (start, end, radius) => {
  const first = polarPoint(start, radius);
  const last = polarPoint(end, radius);
  const largeArc = end - start > 180 ? 1 : 0;

  return `M ${first.x} ${first.y} A ${radius} ${radius} 0 ${largeArc} 1 ${last.x} ${last.y}`;
};

const tickAngle = (index, count = GAUGE_TICKS, start = GAUGE_START_ANGLE, sweep = GAUGE_SWEEP) =>
  start + (index * sweep) / (count - 1);

const Gauge = ({ variant = 'speed', label, value, ...overrides }) => {
  const { classes } = useStyles();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const preset = PRESETS[variant] ?? PRESETS.speed;

  const cfg = {
    ...preset,
    ...Object.fromEntries(Object.entries(overrides).filter(([, item]) => item !== undefined)),
  };

  const {
    min = 0,
    max = 100,
    startAngle,
    sweep,
    tickCount,
    minorTicks = 0,
    tickRange,
    tickColor,
    tickWidth,
    minorTickRange,
    minorTickColor,
    minorTickWidth,
    endTick,
    accentTick,
    accentTickValue,
    showScaleNumbers = true,
    labelFormat,
    labelPlacement = 'outside',
    labelRadius,
    labelFontSize,
    labelWeight = 600,
    labelColor,
    arcRadius,
    arcThickness,
    bands,
    colorRanges,
    faceColors,
    box,
    digital = false,
    valueFontSize,
    valueColor,
    displayValue,
    unit,
    unitY,
    unitFontSize,
    unitColor,
    unitLetterSpacing = 0,
    unitPill,
    badge,
    badgeStyle,
    endLabels = [],
    endLabelFontSize,
    endLabelColor,
    innerLabel,
    needle,
    hub,
    ariaUnit,
  } = cfg;

  const range = max - min;
  const safeValue = Number(value);
  const hasValue = value != null && Number.isFinite(safeValue);

  const fraction =
    hasValue && range > 0 ? Math.max(0, Math.min(1, (safeValue - min) / range)) : null;

  const toAngle = (currentValue) =>
    startAngle + Math.max(0, Math.min(1, (currentValue - min) / range)) * sweep;

  const outside = labelPlacement === 'outside';

  const arcBands = colorRanges
    ? colorRanges.map(({ from, to, color }) => ({
        from: toAngle(from),
        to: toAngle(to),
        color,
      }))
    : bands.map(([from, to, color]) => ({
        from: startAngle + from * sweep,
        to: startAngle + to * sweep,
        color,
      }));

  const majorCount = Math.max(2, Math.floor(Number(tickCount) || GAUGE_TICKS));

  const minorCount = Math.max(0, Math.floor(Number(minorTicks) || 0));

  const totalTicks = (majorCount - 1) * (minorCount + 1) + 1;

  const ticks = Array.from({ length: totalTicks }, (_, index) => {
    const isMajor = index % (minorCount + 1) === 0;
    const tickValue = min + (range * index) / (totalTicks - 1);

    return {
      index,
      isMajor,
      isEnd: index === 0 || index === totalTicks - 1,
      value: Number(tickValue.toFixed(2)),
      angle: tickAngle(index, totalTicks, startAngle, sweep),
    };
  });

  const drawTick = (tick, [innerRadius, outerRadius], color, width) => {
    const start = polarPoint(tick.angle, innerRadius);
    const end = polarPoint(tick.angle, outerRadius);

    return (
      <line
        key={`tick-${tick.index}-${innerRadius}`}
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke={color}
        strokeWidth={width}
      />
    );
  };

  const needleAngle = startAngle + (fraction ?? 0) * sweep;
  const tip = polarPoint(needleAngle, needle.length);
  const left = polarPoint(needleAngle + 90, needle.width / 2);
  const right = polarPoint(needleAngle - 90, needle.width / 2);
  const tail = polarPoint(needleAngle + 180, needle.tail || needle.back || 0);

  const tailOffset = {
    x: tail.x - 60,
    y: tail.y - 60,
  };

  const needlePoints =
    needle.tail > 0
      ? [tip, left, tail, right]
      : [
          tip,
          {
            x: left.x + tailOffset.x,
            y: left.y + tailOffset.y,
          },
          {
            x: right.x + tailOffset.x,
            y: right.y + tailOffset.y,
          },
        ];

  const needlePointsAttr = needlePoints.map(({ x, y }) => `${x},${y}`).join(' ');

  const gaugeValue = formatValue(value);
  const centerValue = displayValue ?? gaugeValue;
  const boxCenterY = box.y + box.h / 2;
  const digitalSpacing = digital ? 1.6 : 0;

  const ariaLabel = `${label}: ${gaugeValue} ${ariaUnit ?? unit ?? ''}${
    displayValue != null ? `; ${displayValue}` : ''
  }`;

  return (
    <div className={classes.gauge} role="img" aria-label={ariaLabel}>
      <svg
        className={`${classes.gaugeSvg}${variant === 'speed' ? ` ${classes.gaugePrimary}` : ''}`}
        viewBox="0 0 120 120"
        textRendering="geometricPrecision"
        shapeRendering="geometricPrecision"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`face-${uid}`}>
            <stop offset="0%" stopColor={faceColors[0]} />
            <stop offset="100%" stopColor={faceColors[1]} />
          </radialGradient>

          <filter id={`glow-${uid}`} x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="0.55" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx="60"
          cy="60"
          r="57.7"
          fill={`url(#face-${uid})`}
          stroke="#35577d"
          strokeWidth="2.6"
        />

        <circle cx="60" cy="60" r="55" fill="none" stroke="#223c58" strokeWidth="0.5" />

        {endTick &&
          ticks
            .filter(({ isEnd }) => isEnd)
            .map((tick) => drawTick(tick, endTick.range, endTick.color, endTick.width))}

        {arcBands.map(({ from, to, color }, index) => (
          <path
            key={`band-${index}`}
            d={arcPath(from, to, arcRadius)}
            fill="none"
            stroke={color}
            strokeWidth={arcThickness}
            strokeLinecap="butt"
          />
        ))}

        {ticks.map((tick) => {
          if (endTick && tick.isEnd) return null;

          if (accentTick && tick.value === accentTickValue) {
            return null;
          }

          if (tick.isMajor) {
            return drawTick(tick, tickRange, tickColor, tickWidth);
          }

          return minorTickRange
            ? drawTick(tick, minorTickRange, minorTickColor, minorTickWidth)
            : null;
        })}

        {showScaleNumbers &&
          ticks
            .filter(({ isMajor }) => isMajor)
            .map((tick) => {
              const position = polarPoint(tick.angle, labelRadius);
              const text = labelFormat ? labelFormat(tick.value) : tick.value;

              return (
                <text
                  key={`number-${tick.index}`}
                  x={position.x}
                  y={position.y}
                  fill={labelColor}
                  fontFamily={FONT}
                  fontSize={labelFontSize}
                  fontWeight={labelWeight}
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={
                    outside ? `rotate(${tick.angle + 90} ${position.x} ${position.y})` : undefined
                  }
                >
                  {text}
                </text>
              );
            })}

        {endLabels.map(({ label: endLabel, x, y }) => (
          <text
            key={endLabel}
            x={x}
            y={y}
            fill={endLabelColor}
            fontFamily={FONT}
            fontSize={endLabelFontSize}
            fontWeight="700"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {endLabel}
          </text>
        ))}

        {unit && unitPill && (
          <rect
            x={60 - unitPill.w / 2}
            y={unitPill.y}
            width={unitPill.w}
            height={unitPill.h}
            rx={unitPill.h / 2}
            fill={unitPill.fill}
            stroke={unitPill.stroke}
            strokeWidth="0.5"
          />
        )}

        {unit && (
          <text
            x={60 + unitLetterSpacing / 2}
            y={unitY}
            fill={unitColor}
            fontFamily={FONT}
            fontSize={unitFontSize}
            fontWeight="700"
            letterSpacing={unitLetterSpacing || undefined}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {unit}
          </text>
        )}

        <rect
          x={60 - box.w / 2}
          y={box.y}
          width={box.w}
          height={box.h}
          rx={box.rx}
          fill={box.fill}
          stroke={box.stroke}
          strokeWidth={box.sw}
        />

        <text
          x={60 + digitalSpacing / 2}
          y={boxCenterY + (digital ? -0.9 : 0.3)}
          fill={valueColor}
          fontFamily={digital ? "'Courier New', Courier, monospace" : FONT}
          fontSize={valueFontSize}
          fontWeight="700"
          filter={digital ? `url(#glow-${uid})` : undefined}
          letterSpacing={digital ? digitalSpacing : undefined}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {centerValue}
        </text>

        {badge && badgeStyle && (
          <g>
            <rect
              x="50.5"
              y={box.y + box.h + badgeStyle.y}
              width="19"
              height={badgeStyle.h}
              rx={badgeStyle.h / 2}
              fill="#0f2234"
              stroke="#2c5073"
              strokeWidth="0.5"
            />

            <text
              x={60 + badgeStyle.spacing / 2}
              y={box.y + box.h + badgeStyle.y + badgeStyle.h / 2 + 0.2}
              fill={badgeStyle.color}
              fontFamily={FONT}
              fontSize={badgeStyle.fontSize}
              fontWeight={badgeStyle.weight}
              letterSpacing={badgeStyle.spacing}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {badge}
            </text>
          </g>
        )}

        <circle
          cx="60"
          cy="60"
          r={hub.r}
          fill={hub.fill}
          stroke={hub.stroke}
          strokeWidth={hub.sw}
        />

        {accentTick &&
          ticks
            .filter((tick) => tick.value === accentTickValue)
            .map((tick) => drawTick(tick, accentTick.range, accentTick.color, accentTick.width))}

        {fraction != null && (
          <polygon points={needlePointsAttr} fill={needle.color} strokeLinejoin="miter" />
        )}

        {innerLabel && (
          <text
            x="60"
            y={innerLabel.y}
            fill={innerLabel.color}
            fontFamily={FONT}
            fontSize={innerLabel.size}
            fontWeight="700"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {innerLabel.text}
          </text>
        )}

        {hub.dot && <circle cx="60" cy="60" r={hub.dotR ?? 0.9} fill={hub.dot} />}
      </svg>
    </div>
  );
};

export { GAUGE_TICKS, COLORS, tickAngle, formatValue };
export default Gauge;
