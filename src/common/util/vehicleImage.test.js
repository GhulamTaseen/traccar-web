import test from 'node:test';
import assert from 'node:assert/strict';
import { isUsefulCrop, sampleBorderColor, uniformBorderBounds } from './vehicleImage.js';

const createImage = (width, height, background, subject) => {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const inSubject =
        subject &&
        x >= subject.x &&
        x < subject.x + subject.width &&
        y >= subject.y &&
        y < subject.y + subject.height;
      const [r, g, b, a] = inSubject ? subject.color : background;
      data[offset] = r;
      data[offset + 1] = g;
      data[offset + 2] = b;
      data[offset + 3] = a;
    }
  }
  return data;
};

test('samples the dominant border color', () => {
  const data = createImage(12, 12, [255, 255, 255, 255], {
    x: 4,
    y: 4,
    width: 4,
    height: 4,
    color: [180, 30, 40, 255],
  });
  assert.deepEqual(sampleBorderColor(data, 12, 12), { r: 255, g: 255, b: 255 });
});

test('trims a uniform border down to the subject', () => {
  const data = createImage(12, 12, [255, 255, 255, 255], {
    x: 4,
    y: 4,
    width: 4,
    height: 4,
    color: [180, 30, 40, 255],
  });
  const color = sampleBorderColor(data, 12, 12);
  const bounds = uniformBorderBounds(data, 12, 12, color);
  assert.deepEqual(bounds, { x: 4, y: 4, width: 4, height: 4 });
  assert.equal(isUsefulCrop(bounds, 12, 12), true);
});

test('does not crop an image that fills the frame', () => {
  const data = createImage(8, 8, [20, 40, 60, 255], {
    x: 0,
    y: 0,
    width: 8,
    height: 8,
    color: [20, 40, 60, 255],
  });
  const color = sampleBorderColor(data, 8, 8);
  const bounds = uniformBorderBounds(data, 8, 8, color);
  assert.equal(bounds, null);
  assert.equal(isUsefulCrop(bounds, 8, 8), false);
});

test('crops transparent padding', () => {
  const data = createImage(10, 10, [0, 0, 0, 0], {
    x: 2,
    y: 2,
    width: 6,
    height: 6,
    color: [30, 120, 200, 255],
  });
  const color = sampleBorderColor(data, 10, 10);
  assert.equal(color, null);
  const bounds = uniformBorderBounds(data, 10, 10, color);
  assert.deepEqual(bounds, { x: 2, y: 2, width: 6, height: 6 });
  assert.equal(isUsefulCrop(bounds, 10, 10), true);
});

test('rejects a crop smaller than the safe area threshold', () => {
  const bounds = { x: 0, y: 0, width: 2, height: 2 };
  assert.equal(isUsefulCrop(bounds, 100, 100), false);
});
