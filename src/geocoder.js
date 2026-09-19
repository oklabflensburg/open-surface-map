import { fitBounds } from './map.js';

function resultBounds(result) {
  if (!Array.isArray(result.boundingbox) || result.boundingbox.length !== 4) return null;
  const [south, north, west, east] = result.boundingbox.map(Number);
  if (![south, north, west, east].every(Number.isFinite)
    || south > north || west > east || south < -90 || north > 90
    || west < -180 || east > 180) return null;
  return [[west, south], [east, north]];
}

export function setupGeocoder(map) {
  const form = document.getElementById('search');
  const input = document.getElementById('search-query');
  const fieldset = form.querySelector('fieldset');
  const results = document.getElementById('search-results');
  const status = document.getElementById('search-status');
  const cache = new Map();
  let endpoint;
  let busy = false;
  let nextRequestAt = 0;
  fieldset.disabled = false;

  function showResults(places) {
    results.replaceChildren();
    for (const place of places) {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = place.display_name;
      button.addEventListener('click', () => {
        fitBounds(map, resultBounds(place), 200);
        results.replaceChildren();
        status.textContent = '';
        input.focus();
      });
      item.append(button);
      results.append(item);
    }
    status.textContent = places.length
      ? `${places.length} Treffer. Bitte wählen Sie einen Ort aus.`
      : 'Keine Ergebnisse gefunden. Bitte ändern Sie den Suchbegriff.';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy) return;
    const query = input.value.trim();
    if (!query) {
      results.replaceChildren();
      status.textContent = 'Bitte geben Sie eine Adresse oder einen Ort ein.';
      return;
    }
    const key = query.toLocaleLowerCase('de');
    if (cache.has(key)) {
      showResults(cache.get(key));
      return;
    }
    if (Date.now() < nextRequestAt) {
      status.textContent = 'Bitte warten Sie kurz vor der nächsten Suche.';
      return;
    }

    busy = true;
    fieldset.disabled = true;
    results.replaceChildren();
    status.textContent = 'Suche läuft …';
    try {
      // Runtime configuration lets the host switch providers without rebuilding JS.
      if (!endpoint) {
        const response = await fetch(`${import.meta.env.BASE_URL}config.json`, {
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) throw new Error();
        const config = await response.json();
        const url = new URL(config.nominatimUrl);
        if (url.protocol !== 'https:') throw new Error();
        endpoint = url.href;
      }
      const url = new URL(endpoint);
      url.searchParams.set('q', query);
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('limit', '5');
      nextRequestAt = Date.now() + 1100;
      const response = await fetch(url, {
        signal: AbortSignal.timeout(15000),
        referrerPolicy: 'strict-origin-when-cross-origin',
      });
      if (response.status === 429) {
        nextRequestAt = Date.now() + 60000;
        status.textContent = 'Die Suche ist momentan ausgelastet. Bitte versuchen Sie es in einer Minute erneut.';
        return;
      }
      if (!response.ok) throw new Error();
      const places = await response.json();
      if (!Array.isArray(places) || places.some((place) =>
        !place || typeof place.display_name !== 'string' || !resultBounds(place))) throw new Error();
      cache.set(key, places);
      showResults(places);
    } catch {
      status.textContent = 'Die Suche ist derzeit nicht erreichbar. Bitte versuchen Sie es später erneut.';
    } finally {
      busy = false;
      fieldset.disabled = false;
      input.focus();
    }
  });

  form.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      results.replaceChildren();
      status.textContent = '';
      input.focus();
    }
  });
}
