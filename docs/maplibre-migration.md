# MapLibre-/Vite-Migration

## Umfang und bisherige Funktionen

Die Anwendung bleibt statisch und frameworkfrei. Die Raster-Basemap, Flächenfarben, Auswahl, Tooltip, Ortssuche und Detailanzeige werden übernommen. Es gibt keine Backend-, SQL-, Daten- oder Vector-Tile-Migration.

| Bisherige Funktion | Umsetzung |
| --- | --- |
| `L.map()` | `new maplibregl.Map()`, Zentrum `[9.4321, 54.7836]`, maximaler Zoom 13 |
| `L.tileLayer()` | OSM-Raster-Source und Raster-Layer, Tilegröße 256, sichtbare verlinkte Attribution |
| `L.geoJson()` | Einmaliger Fetch, GeoJSON-Source `surface`, Layer `surface-fill` und `surface-border` |
| `layer.bindTooltip()` | Ein wiederverwendetes Popup mit sicherem DOM-Text; `mousemove`/`mouseleave` |
| `layer.on('click')` | Layer-Click-Handler, vollständige Originalgeometrie für Bounds und Details |
| `layer.setStyle()` | `feature-state.selected` und Paint-Ausdrücke; vorherige Auswahl zurücksetzen |
| `map.fitBounds()` | MapLibre `fitBounds()` mit eigener Polygon-/MultiPolygon-Bounds-Berechnung |
| Geocoder-Control | Kleines Suchformular, Nominatim-Fetch, Ergebnisbuttons mit Tastaturbedienung |
| Detailanzeige mit HTML-Strings | DOM-Elemente mit `textContent` und `replaceChildren()` |

Die anfänglichen Bounds umfassen den gesamten Datensatz. Bei Auswahl und Suchergebnissen wird die bisherige Polsterung von 200 Pixeln auf kleinen Karten begrenzt, damit ein sichtbarer Kartenausschnitt bleibt. Wiederholtes Anklicken derselben Gemeinde behält die Auswahl bei. Rotationsgesten sind deaktiviert.

## Daten und IDs

Das GeoJSON enthält **10.984 MultiPolygon-Features**, keine Feature-IDs und keinen AGS in den Properties. Die 10.779 unterschiedlichen Gemeindenamen sind nicht eindeutig. Deshalb wird `generateId: true` verwendet: MapLibre vergibt IDs anhand der unveränderten Feature-Reihenfolge. Diese Zuordnung gilt für die Lebensdauer der einmalig geladenen Source; es gibt weder Sortierung noch `setData()` noch dynamische Datenupdates. Bei einer späteren Aktualisierung der Source muss die Auswahl zurückgesetzt oder auf stabile fachliche IDs migriert werden.

Klicks verwenden `data.features[id]` statt der möglicherweise an internen Kachelgrenzen gekürzten Render-Geometrie. Die Datei wird weder für IDs umgeschrieben noch als zweite große Struktur kopiert.

`data/gem31122019flaechen.geojson` wurde bytegleich nach `public/data/gem31122019flaechen.geojson` verschoben. SHA-256:

```text
b2dec7754ccafcffa5573205cc9c16f1eb1e6c2f678fd9a9ac6853722556dc82
```

Die bisherige Anzeige-Zuordnung wird ausdrücklich unverändert übernommen:

| Property | Bisherige und neue Anzeige | Einheit |
| --- | --- | --- |
| `a` | Waldfläche | % |
| `b` | Landwirtschaftsfläche | % |
| `c` | Verkehrsfläche | % |
| `d` | Siedlungs- und Verkehrsfläche¹ | % |
| `e` | Siedlungs- und Verkehrsfläche¹ pro Einwohner | m²/Kopf |
| `f` | Gemeindename | – |

¹ Ohne Bergbaubetrieb sowie Tagebau, Grube, Steinbruch.

Die historischen CSV-/SQL-Dateien haben andere Feldnamen und eine andere Spaltenreihenfolge. Dieser PR interpretiert die Kurzschlüssel nicht neu und korrigiert keine möglichen fachlichen Inkonsistenzen des Prototyps.

## Aufbau

- `src/main.js`: CSS-Imports, Start und sichtbare Status-/Fehlermeldungen.
- `src/map.js`: Karte, Datenladen, Layer, Auswahl, Tooltip und Kamera.
- `src/bounds.js`: Bounds und Geometrievalidierung ohne zusätzliche Library.
- `src/details.js`: unveränderte Detailwerte als sichere DOM-Elemente.
- `src/geocoder.js`: Suche, Cache, Anfragelimit, Fehler- und Ergebnisanzeige.
- `src/style.css`: kompiliertes Tailwind und kleine ergänzende Styles. Die bisher verwendeten Farben sind explizit erhalten.
- `public/config.json`: zur Laufzeit gelesener Nominatim-Endpunkt.

Impressum, Datenschutz und Lizenztexte bleiben inhaltlich erhalten. Auch diese Seiten verwenden kompiliertes CSS. Nicht verwendete Tabellen- und bisherige Kartenbibliotheks-Styles wurden entfernt. Die bisherige halbe Seitenbreite zwischen 640 und 767 Pixeln wurde an das tatsächliche Layout angepasst: unterhalb des Desktop-Breakpoints nutzen Karte und Seitenbereich die volle Breite.

MapLibre 6 benötigt neben Namespace-Imports eine explizite Worker-Einbindung für Vite. `maplibre-gl-worker.mjs?worker&url` und `setWorkerUrl()` sorgen dafür, dass der Worker einschließlich seiner Importe lokal gebaut und ausgeliefert wird; siehe [MapLibre-Installation](https://maplibre.org/maplibre-gl-js/docs/).

## Manuelle Smoke-Checks

Nach `npm install`, `npm test`, `npm run build` und `npm run preview`:

1. Startseite öffnen: OSM-Basemap und blaue Polygone erscheinen, Zoom umfasst den Datensatz, Attribution ist lesbar.
2. Über mehrere Gemeinden fahren: genau ein Tooltip zeigt den jeweiligen Namen; Cursor wird zum Zeiger. Karte verlassen: Tooltip verschwindet.
3. Gemeinde anklicken: Füllung wird transparenter, weißer Rand breiter; gesamte Gemeinde wird eingepasst. Alle fünf Detailwerte samt Einheiten und Fußnote mit dem GeoJSON vergleichen.
4. Andere Gemeinde anklicken: alte Auswahl zurückgesetzt, neue Auswahl und Details gesetzt. Dieselbe Gemeinde erneut anklicken: Auswahl bleibt bestehen. Auch mehrteilige Gemeinden prüfen.
5. „Flensburg“ mit Enter suchen, mit Tab einen Treffer wählen und Enter drücken: Karte bewegt sich zum Ergebnis. Wiederholung nutzt den Cache. Während des Tippens wird nicht angefragt; Leerzeichen allein senden keine Anfrage. Escape schließt Ergebnisse.
6. Impressum, Datenschutzanker und Lizenz über den Footer öffnen; Zurück-Link prüfen. Seiten bleiben auch nach direktem Neuladen gestaltet.
7. Bei schmalem Fenster prüfen: Karte, Suchfeld, Ergebnisse und Footer bleiben bedienbar; kein horizontaler Seitenüberlauf.
8. DevTools-Konsole prüfen: keine JavaScript-Fehler bei normaler Nutzung; Network zeigt genau einen GeoJSON-Abruf pro Seitenaufruf und keine Frontend-CDNs.
9. Mit DevTools Request Blocking den GeoJSON-Abruf blockieren: verständliche Fehlermeldung. Mit lokal ersetzter Antwort ungültiges JSON und ungültige Geometrien prüfen.
10. Suchantworten lokal simulieren: leere Ergebnisliste, Netzwerkfehler, HTTP 429 und fehlerhafte Antwort ergeben sichtbare Meldungen. Keine Testserien gegen den öffentlichen Dienst senden.
11. WebGL deaktivieren und Seite neu laden: verständliche Startfehlermeldung statt ausschließlich Konsolenausgabe.

## Durchgeführte Prüfung

Am 19.09.2026 mit Node 22.22.3, npm 12.0.2 und Chromium (headless, Software-WebGL):

- `npm install`, Produktions-Build und die drei Bounds-Tests erfolgreich; zusätzlich `npm ci`, Build und Tests in einer isolierten frischen Kopie erfolgreich (npm meldet keine bekannten Schwachstellen). GeoJSON bytegleich mit dem ursprünglichen Git-Blob.
- Entwicklungs- und Produktionsansicht mit echten OSM-Tiles geprüft; genau ein GeoJSON-Abruf pro Start, keine bisherigen CDN-Abhängigkeiten und keine JavaScript-Fehler bei normaler Nutzung.
- Hover/Verlassen, Auswahlwechsel (Brunsbüttel → Kronprinzenkoog), Details und Gesamt-Bounds geprüft. Alte Auswahl erhält `selected: false`, neue Auswahl `selected: true`.
- Eine echte Nominatim-Suche nach „Flensburg“ liefert drei Ergebnisse; Auswahl bewegt die Karte nach Flensburg.
- Produktions-Worker, alle Footer-Links einschließlich Datenschutzanker, Rücklinks und kompiliertes CSS auf den Rechtstextseiten geprüft.
- Desktop 1440 × 1000 und Mobilansicht 390 × 844 visuell kontrolliert, kein horizontaler Überlauf.
- Mit ausschließlich lokalen Testantworten: HTTP-Fehler beim Datenladen, ungültiges JSON, ungültige Geometrie, leere Suche, keine Treffer, Cache-Wiederholung, Anfragelimit, Such-Netzwerkfehler, ungültige Suchantwort, HTTP 429, Tastaturauswahl und HTML-artiger Ergebnistext. Fehlendes WebGL wurde ebenfalls simuliert.

Die Browserprüfungen wurden mit einer vorhandenen Playwright-Installation außerhalb des Projekts ausgeführt. Es wurde keine Browser-Testabhängigkeit oder umfangreiche Testinfrastruktur eingeführt. Die oben aufgeführten manuellen Schritte dienen der Wiederholung durch Reviewer.

## Grenzen und späterer PR

- MapLibre benötigt WebGL. Der gesamte bestehende Datensatz wird weiterhin beim Start geladen; die Downloadgröße und initiale Verarbeitung bleiben bestehen.
- Das MapLibre-Bundle überschreitet Vites Standard-Warngrenze von 500 kB. Die Warnung bleibt sichtbar; künstliches Aufteilen derselben notwendigen Bibliothek würde den initialen Download nicht reduzieren.
- Die pro Seite begrenzte Suche ersetzt kein globales Nominatim-Anfragelimit. Betriebsbedingungen und Anbieterwechsel: siehe [README](../README.md#ortssuche-und-externe-dienste).
- Die historischen Rechtstexte werden in diesem technischen PR nicht redaktionell überarbeitet.
- Ein separater PR 2 kann PostGIS → `geom_3857` → GiST-Index → Martin → MVT/PBF → Nginx-Cache → MapLibre `VectorTileSource` untersuchen. Dazu gehören stabile IDs, fachlich geprüfte Property-Zuordnung, Zoom-/Geometrievergleiche und Lastmessungen. Davon wird hier nichts implementiert.
