import * as maplibregl from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { getBounds } from './bounds.js';

// MapLibre 6's module worker must also pass through Vite's bundler.
maplibregl.setWorkerUrl(workerUrl);

const selected = ['boolean', ['feature-state', 'selected'], false];

export function fitBounds(map, bounds, padding = 0) {
  const container = map.getContainer();
  map.fitBounds(bounds, {
    padding: Math.min(padding, container.clientWidth / 4, container.clientHeight / 4),
    maxZoom: 13,
    // Padding applies to this movement only, not subsequent map navigation.
    retainPadding: false,
  });
}

async function loadSurface() {
  let response;
  try {
    response = await fetch(`${import.meta.env.BASE_URL}data/gem31122019flaechen.geojson`, {
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error();
  } catch {
    throw new Error('Die Flächendaten konnten nicht geladen werden. Bitte laden Sie die Seite erneut.');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Die Flächendaten sind kein gültiges GeoJSON.');
  }
  const bounds = getBounds(data);
  if (data.type !== 'FeatureCollection' || data.features.some(({ properties }) =>
    !properties || typeof properties.f !== 'string'
    || ['a', 'b', 'c', 'd', 'e'].some((key) =>
      !['number', 'string'].includes(typeof properties[key])))) {
    throw new Error('Die GeoJSON-Datei enthält ungültige Gemeindedaten.');
  }
  return { data, bounds };
}

function addInteractions(map, data, onSelect) {
  let selectedId = null;
  let hoveredId = null;
  const label = document.createElement('span');
  const popup = new maplibregl.Popup({
    closeButton: false, closeOnClick: false, offset: 10,
    className: 'municipality-tooltip',
  }).setDOMContent(label);

  const clearHover = () => {
    map.getCanvas().style.cursor = '';
    hoveredId = null;
    popup.remove();
  };

  map.on('mousemove', 'surface-fill', (event) => {
    const feature = event.features[0];
    if (!feature) return;
    map.getCanvas().style.cursor = 'pointer';
    if (hoveredId !== feature.id) {
      label.textContent = data.features[feature.id].properties.f;
      hoveredId = feature.id;
    }
    popup.setLngLat(event.lngLat);
    if (!popup.isOpen()) popup.addTo(map);
  });
  map.on('mouseleave', 'surface-fill', clearHover);
  map.on('movestart', clearHover);

  map.on('click', 'surface-fill', (event) => {
    const id = event.features[0]?.id;
    if (id === undefined) return;
    if (selectedId !== id) {
      if (selectedId !== null) {
        map.setFeatureState({ source: 'surface', id: selectedId }, { selected: false });
      }
      map.setFeatureState({ source: 'surface', id }, { selected: true });
      selectedId = id;
      onSelect(data.features[id].properties);
    }
    clearHover();
    fitBounds(map, getBounds(data.features[id]), 200);
  });
}

export async function createMap({ onSelect, onStatus, onError }) {
  let map;
  try {
    map = new maplibregl.Map({
      container: 'map', center: [9.4321, 54.7836], zoom: 13, maxZoom: 13,
      dragRotate: false, pitchWithRotate: false, touchPitch: false,
      attributionControl: false,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256, maxzoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
    });
  } catch {
    throw new Error('Die Karte konnte nicht gestartet werden. Bitte verwenden Sie einen Browser mit WebGL-Unterstützung.');
  }

  map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
  map.addControl(new maplibregl.AttributionControl({ compact: false }));
  map.getCanvas().setAttribute('aria-label', 'Karte der Flächenstatistik 2019');
  map.on('error', (event) => {
    onError(event.sourceId === 'osm'
      ? 'Die OSM-Hintergrundkarte konnte nicht vollständig geladen werden. Bitte prüfen Sie Ihre Internetverbindung.'
      : 'Die Karte konnte nicht vollständig dargestellt werden. Bitte laden Sie die Seite erneut.');
  });
  map.on('webglcontextlost', () => onError('Die Kartendarstellung wurde unterbrochen. Bitte laden Sie die Seite erneut.'));

  // Fetch once; pass the same object to MapLibre and retain it for complete click bounds.
  onStatus('Flächendaten werden geladen …');
  const [, { data, bounds }] = await Promise.all([map.once('load'), loadSurface()]);
  const sourceTimeout = setTimeout(() => {
    onStatus('');
    onError('Die Flächendaten konnten nicht dargestellt werden. Bitte laden Sie die Seite erneut.');
  }, 30000);
  map.on('sourcedata', (event) => {
    if (event.sourceId === 'surface' && event.isSourceLoaded) {
      clearTimeout(sourceTimeout);
      onStatus('');
    }
  });
  map.addSource('surface', { type: 'geojson', data, generateId: true });
  map.addLayer({
    id: 'surface-fill', type: 'fill', source: 'surface',
    paint: {
      'fill-color': '#002db4',
      'fill-opacity': ['case', selected, 0.4, 0.7],
    },
  });
  map.addLayer({
    id: 'surface-border', type: 'line', source: 'surface',
    paint: {
      'line-color': '#fff',
      'line-opacity': ['case', selected, 0.8, 0.6],
      'line-width': ['case', selected, 4, 1],
    },
  });
  addInteractions(map, data, onSelect);
  fitBounds(map, bounds);
  return map;
}
