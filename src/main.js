import 'maplibre-gl/dist/maplibre-gl.css';
import './style.css';
import { createMap } from './map.js';
import { showDetails } from './details.js';
import { setupGeocoder } from './geocoder.js';

const status = document.getElementById('map-status');
const error = document.getElementById('map-error');
function setMessage(element, message) {
  if (element.textContent === message) return;
  element.textContent = message;
  element.hidden = !message;
}

try {
  const map = await createMap({
    onSelect: (properties) => showDetails(document.getElementById('details'), properties),
    onStatus: (message) => setMessage(status, message),
    onError: (message) => {
      // Keep a data/startup failure visible if tile errors arrive afterwards.
      if (!error.textContent) setMessage(error, message);
    },
  });
  setupGeocoder(map);
} catch (cause) {
  setMessage(status, '');
  setMessage(error, cause.message);
}
