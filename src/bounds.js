// Traverse the original coordinates, not MapLibre's clipped rendered features.
export function getBounds(geojson) {
  const bounds = [[Infinity, Infinity], [-Infinity, -Infinity]];
  const invalid = () => { throw new Error('Die GeoJSON-Datei enthält ungültige Flächendaten.'); };

  function polygon(rings) {
    if (!Array.isArray(rings) || rings.length === 0) invalid();
    for (const ring of rings) {
      if (!Array.isArray(ring) || ring.length < 4) invalid();
      for (const position of ring) {
        if (!Array.isArray(position) || position.length < 2) invalid();
        const [lng, lat] = position;
        if (!Number.isFinite(lng) || !Number.isFinite(lat)
          || Math.abs(lng) > 180 || Math.abs(lat) > 90) invalid();
        bounds[0][0] = Math.min(bounds[0][0], lng);
        bounds[0][1] = Math.min(bounds[0][1], lat);
        bounds[1][0] = Math.max(bounds[1][0], lng);
        bounds[1][1] = Math.max(bounds[1][1], lat);
      }
      if (ring[0][0] !== ring.at(-1)[0] || ring[0][1] !== ring.at(-1)[1]) invalid();
    }
  }

  function visit(object) {
    if (!object) invalid();
    switch (object.type) {
      case 'FeatureCollection':
        if (!Array.isArray(object.features) || object.features.length === 0) invalid();
        for (const feature of object.features) {
          if (feature?.type !== 'Feature') invalid();
          visit(feature);
        }
        break;
      case 'Feature':
        visit(object.geometry);
        break;
      case 'Polygon':
        polygon(object.coordinates);
        break;
      case 'MultiPolygon':
        if (!Array.isArray(object.coordinates) || object.coordinates.length === 0) invalid();
        for (const rings of object.coordinates) polygon(rings);
        break;
      default:
        invalid();
    }
  }

  visit(geojson);
  return bounds;
}
