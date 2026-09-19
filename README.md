# Flächenstatistik


![Flächenstatistik Deutschland 2019](https://raw.githubusercontent.com/oklabflensburg/open-surface-map/main/screenshot_surface_map.jpg)

_Haftungsausschluss: Dieses Repository und die zugehörige Datenbank befinden sich derzeit in einer Beta-Version. Einige Aspekte des Codes und der Daten können noch Fehler enthalten. Bitte kontaktieren Sie uns per E-Mail oder erstellen Sie ein Issue auf GitHub, wenn Sie einen Fehler entdecken._


## Datenquelle

Die Daten Flächenstatistik der Bodenfläche nach Art der tatsächlichen Nutzung in Deutschland 2019 werden über die Statistischen Ämter des Bundes unter folgendem Link zum [Download](https://service.destatis.de/DE/karten/flaechenatlas2019daten.xlsx) angeboten. Die Daten der Verwaltungsgebiete (VG5000) vom Bundesamt für Kartographie und Geodäsie (BKG) werden unter folgendem Link zum [Download](https://daten.gdz.bkg.bund.de/produkte/vg/vg5000_1231/2019/vg5000_12-31.utm32s.shape.kompakt.zip) angeboten.


## Interaktive Karte

Diese interaktive webbasierte Karte zeigt die Verteilung der verschiedenen Flächennutzungsarten beim klick auf die entsprechende Gemeinde an. So lässt sich in Kürze herausfinden in welchen Regionen der Waldflächenanteil besonders hoch ist. Dies ist ein erster Prototyp, welcher mit mehr Filter Möglichkeiten ausgebaut werden soll. Zudem wollen wir auch die Daten der Kreisfreien Städte und Stadtstaaten mit aufnehmen.


## Technische Umsetzung

Das Frontend verwendet [MapLibre GL JS](https://maplibre.org/) statt Leaflet, modernes JavaScript ohne Framework und einen [Vite](https://vite.dev/)-Build. [Tailwind CSS](https://tailwindcss.com/docs/installation/using-vite) wird beim Build kompiliert; JavaScript und CSS werden lokal ausgeliefert.

Die Daten wurden ursprünglich aus den statistischen Daten und den Verwaltungsgebieten zusammengeführt. Die Anwendung lädt weiterhin einmalig das **unveränderte statische GeoJSON** `public/data/gem31122019flaechen.geojson` unter `/data/gem31122019flaechen.geojson`. Die übrigen Dateien unter `data/` bleiben historische Daten- und Abfrageartefakte; für den Betrieb wird keine Datenbank benötigt. OpenStreetMap liefert weiterhin die Raster-Hintergrundkarte.

PBF/MVT und eine mögliche spätere Anbindung an PostGIS und Martin sind ausdrücklich ein separater Schritt. Dieser Stand enthält weder neue Backend-Endpunkte noch Daten- oder Schemaänderungen.

## Voraussetzungen

- Node.js **22.12 oder neuer** (empfohlen: eine unterstützte LTS-Version; geprüft mit 22.22.3)
- npm (geprüft mit 12.0.2)
- Ein moderner Browser mit WebGL-Unterstützung

## Development

```bash
npm install
npm run dev
```

Vite zeigt die lokale URL an (standardmäßig `http://localhost:5173`). Die Lockdatei wird mitversioniert; für reproduzierbare Installationen steht auch `npm ci` zur Verfügung.

## Production Build

```bash
npm run build
```

Den Inhalt von `dist/` auf einem statischen Webserver veröffentlichen. `index.html`, `impressum.html` (einschließlich Datenschutzanker) und `lizenz.html` werden gemeinsam gebaut. `public/` wird unverändert nach `dist/` kopiert. Der Standard-Build wird am Domain-Root ausgeliefert. Für ein Unterverzeichnis kann Vites `base` eingestellt werden; Daten- und Konfigurationspfade berücksichtigen diese Einstellung.

## Preview

```bash
npm run preview
```

Die Vorschau dient der lokalen Prüfung des fertigen Builds, nicht als Produktionsserver.

## Ortssuche und externe Dienste

Die Suche nutzt weiterhin Nominatim und wird ausschließlich mit Enter oder „Suchen“ ausgelöst. Der Endpunkt steht in `public/config.json` und nach dem Build in `dist/config.json`. Betreiber können die ausgelieferte Konfiguration ohne JavaScript-Neubuild auf eine andere Nominatim-kompatible HTTPS-Instanz umstellen.

**Die [Nominatim-Nutzungsbedingungen](https://operations.osmfoundation.org/policies/nominatim/) gelten für die gesamte Anwendung: höchstens eine Anfrage pro Sekunde über alle Nutzer hinweg, moderate Nutzung, kein Autocomplete, sichtbare OSM-Attribution und ein identifizierender HTTP-Referer.** Der Client verhindert parallele Anfragen, begrenzt sie pro geöffneter Seite, speichert Suchergebnisse während der Sitzung und behandelt Überlastung. Eine globale Begrenzung über mehrere Besucher kann ein statisches Frontend nicht gewährleisten. Bei höherer Nutzung muss der Betreiber auf einen geeigneten Dienst wechseln. Keine vertraulichen Angaben suchen; Suchbegriffe werden an den konfigurierten Dienst übertragen. Auf dem Host darf der Referer für OSM-Dienste nicht unterdrückt werden.

Für die Rasterkarte gelten die [OSM Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/) und die dortigen Vorgaben zu Attribution und HTTP-Caching. Es werden nur sichtbare Kartenausschnitte angefragt, keine Offline-Downloads oder systematischen Abrufe.

## Prüfungen

```bash
npm test
npm run build
npm run preview
```

`npm test` verwendet den integrierten Node-Test-Runner für die Bounds-Berechnung und ungültige Geometrien. Die [Migrationsnotizen](docs/maplibre-migration.md) dokumentieren die Property-Zuordnung, Feature-IDs, Browser-Smoke-Checks und bekannte Grenzen.


---


## How to Contribute

Contributions are welcome! Please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on how to get involved.


---


## License

This repository is licensed under [CC0-1.0](LICENSE).
