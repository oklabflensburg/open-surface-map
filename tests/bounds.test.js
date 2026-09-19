import test from 'node:test';
import assert from 'node:assert/strict';
import { getBounds } from '../src/bounds.js';

const west = [[[-10, 45], [-8, 45], [-8, 47], [-10, 45]]];
const east = [[[10, 50], [12, 50], [12, 52], [10, 50]]];

test('Polygon and MultiPolygon bounds include every disconnected part', () => {
  assert.deepEqual(getBounds({ type: 'Polygon', coordinates: west }), [[-10, 45], [-8, 47]]);
  assert.deepEqual(getBounds({ type: 'MultiPolygon', coordinates: [west, east] }), [[-10, 45], [12, 52]]);
});

test('FeatureCollection includes all features without changing the input', () => {
  const data = {
    type: 'FeatureCollection',
    features: [west, east].map((coordinates) => ({
      type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates },
    })),
  };
  const original = JSON.stringify(data);
  assert.deepEqual(getBounds(data), [[-10, 45], [12, 52]]);
  assert.equal(JSON.stringify(data), original);
});

test('Empty, malformed, unsupported and non-finite geometries are rejected', () => {
  for (const data of [
    null, {}, { type: 'FeatureCollection', features: [] },
    { type: 'Feature', geometry: null },
    { type: 'Point', coordinates: [9, 54] },
    { type: 'MultiPolygon', coordinates: [] },
    { type: 'Polygon', coordinates: [[]] },
    { type: 'Polygon', coordinates: [[[0, 0], [1, 1], [2, 2], [3, 3]]] },
    { type: 'Polygon', coordinates: [[[0, 0], [NaN, 1], [2, 2], [0, 0]]] },
    { type: 'Polygon', coordinates: [[[0, 0], [181, 1], [2, 2], [0, 0]]] },
  ]) assert.throws(() => getBounds(data), /ungültige Flächendaten/);
});
