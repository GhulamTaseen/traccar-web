const MAX_SCAN_DIMENSION = 1024;
const MAX_OUTPUT_DIMENSION = 512;
const ALPHA_THRESHOLD = 12;
const BORDER_COLOR_TOLERANCE = 28;
const BORDER_MATCH_RATIO = 0.94;
const MIN_CROP_RATIO = 0.02;
const MIN_CROP_AREA = 0.08;

const median = (values) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

const pixelMatches = (data, offset, color) => {
  if (data[offset + 3] < ALPHA_THRESHOLD) return true;
  if (!color) return false;
  return (
    Math.abs(data[offset] - color.r) <= BORDER_COLOR_TOLERANCE &&
    Math.abs(data[offset + 1] - color.g) <= BORDER_COLOR_TOLERANCE &&
    Math.abs(data[offset + 2] - color.b) <= BORDER_COLOR_TOLERANCE
  );
};

export const sampleBorderColor = (data, width, height) => {
  const red = [];
  const green = [];
  const blue = [];
  for (let x = 0; x < width; x += 1) {
    for (const y of [0, height - 1]) {
      const offset = (y * width + x) * 4;
      if (data[offset + 3] >= ALPHA_THRESHOLD) {
        red.push(data[offset]);
        green.push(data[offset + 1]);
        blue.push(data[offset + 2]);
      }
    }
  }
  for (let y = 1; y < height - 1; y += 1) {
    for (const x of [0, width - 1]) {
      const offset = (y * width + x) * 4;
      if (data[offset + 3] >= ALPHA_THRESHOLD) {
        red.push(data[offset]);
        green.push(data[offset + 1]);
        blue.push(data[offset + 2]);
      }
    }
  }
  if (red.length < (width + height) * 0.5) {
    return null;
  }
  return { r: median(red), g: median(green), b: median(blue) };
};

const rowMatches = (data, width, y, color) => {
  let matches = 0;
  for (let x = 0; x < width; x += 1) {
    if (pixelMatches(data, (y * width + x) * 4, color)) matches += 1;
  }
  return matches / width >= BORDER_MATCH_RATIO;
};

const columnMatches = (data, width, x, top, bottom, color) => {
  let matches = 0;
  const rows = bottom - top + 1;
  for (let y = top; y <= bottom; y += 1) {
    if (pixelMatches(data, (y * width + x) * 4, color)) matches += 1;
  }
  return matches / rows >= BORDER_MATCH_RATIO;
};

export const uniformBorderBounds = (data, width, height, color) => {
  let top = 0;
  let bottom = height - 1;
  let left = 0;
  let right = width - 1;
  while (top <= bottom && rowMatches(data, width, top, color)) top += 1;
  while (bottom >= top && rowMatches(data, width, bottom, color)) bottom -= 1;
  while (left <= right && columnMatches(data, width, left, top, bottom, color)) left += 1;
  while (right >= left && columnMatches(data, width, right, top, bottom, color)) right -= 1;
  if (right < left || bottom < top) return null;
  return {
    x: left,
    y: top,
    width: right - left + 1,
    height: bottom - top + 1,
  };
};

export const isUsefulCrop = (bounds, width, height) => {
  if (!bounds) return false;
  if (bounds.width <= 0 || bounds.height <= 0) return false;
  if (bounds.width * bounds.height < width * height * MIN_CROP_AREA) return false;
  return (
    bounds.width / width < 1 - MIN_CROP_RATIO ||
    bounds.height / height < 1 - MIN_CROP_RATIO ||
    bounds.x > width * MIN_CROP_RATIO ||
    bounds.y > height * MIN_CROP_RATIO
  );
};

export const prepareVehicleImage = async (src) => {
  if (!src || typeof document === 'undefined') return null;
  const response = await fetch(src, { credentials: 'same-origin' });
  if (!response.ok) return null;
  const blob = await response.blob();
  if (!blob.type.startsWith('image/')) return null;
  const bitmap = await createImageBitmap(blob);
  try {
    const scale = Math.min(1, MAX_SCAN_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(bitmap, 0, 0, width, height);
    const data = context.getImageData(0, 0, width, height).data;
    const color = sampleBorderColor(data, width, height);
    const bounds = uniformBorderBounds(data, width, height, color);
    const crop = isUsefulCrop(bounds, width, height) ? bounds : { x: 0, y: 0, width, height };

    const padding = Math.max(1, Math.round(Math.min(crop.width, crop.height) * 0.02));
    const sourceX = Math.max(0, crop.x - padding);
    const sourceY = Math.max(0, crop.y - padding);
    const sourceWidth = Math.min(width - sourceX, crop.width + padding * 2);
    const sourceHeight = Math.min(height - sourceY, crop.height + padding * 2);

    const outputScale = Math.min(1, MAX_OUTPUT_DIMENSION / Math.max(sourceWidth, sourceHeight));
    const output = document.createElement('canvas');
    output.width = Math.max(1, Math.round(sourceWidth * outputScale));
    output.height = Math.max(1, Math.round(sourceHeight * outputScale));
    const outputContext = output.getContext('2d');
    outputContext.drawImage(
      canvas,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      output.width,
      output.height,
    );
    return output.toDataURL('image/png');
  } finally {
    bitmap.close();
  }
};
