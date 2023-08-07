# Flächenstatistik


![Flächenstatistik Deutschland 2019](https://raw.githubusercontent.com/oklabflensburg/open-surface-map/main/screenshot_surface_map.png)

_Haftungsausschluss: Dieses Repository und die zugehörige Datenbank befinden sich derzeit in einer Beta-Version. Einige Aspekte des Codes und der Daten können noch Fehler enthalten. Bitte kontaktieren Sie uns per E-Mail oder erstellen Sie ein Issue auf GitHub, wenn Sie einen Fehler entdecken._


## Datenquelle

Die Daten Flächenstatistik der Bodenfläche nach Art der tatsächlichen Nutzung in Deutschland 2019 werden über die Statistischen Ämter des Bundes unter folgendem Link zum [Download](https://service.destatis.de/DE/karten/flaechenatlas2019daten.xlsx) angeboten. Die Daten der Verwaltungsgebiete (VG5000) vom Bundesamt für Kartographie und Geodäsie (BKG) werden unter folgendem Link zum [Download](https://daten.gdz.bkg.bund.de/produkte/vg/vg5000_1231/2019/vg5000_12-31.utm32s.shape.kompakt.zip) angeboten.


## Interaktive Karte

Diese interaktive webbasierte Karte zeigt die Verteilung der verschiedenen Flächennutzungsarten beim klick auf die entsprechende Gemeinde an. So lässt sich in Kürze herausfinden in welchen Regionen der Waldflächenanteil besonders hoch ist. Dies ist ein erster Prototyp, welcher mit mehr Filter Möglichkeiten ausgebaut werden soll. Zudem wollen wir auch die Daten der Kreisfreien Städte und Stadtstaaten mit aufnehmen.


## Technische Umsetzung

Nach einhergehender Analyse der bereitgestellten Daten der statistischen Ämter des Bundes haben wir diese Daten extrahiert und in eine Postgres Datenbank importiert. 

Unser Ziel ist es in Vorbereitung auf die Filter Möglichkeiten und die Umkreissuche Postgis zu nutzen und die MultiPolygonen im WKB Format zu
hinerlegen und zu indexieren. Für die initiale Anwendung konnten wir nach dem Import der Daten der Verwaltungsgebiete in der Variante VG5000 vom Bundesamt für Kartographie und Geodäsie (BKG) die Durch Abfragen über die ÜBereinstimmung des Amtlichen Gemeinde Schlüssels zu den Daten die entsprechenden MultiPolygonen ausgeben. Diese Ausgabe haben wir nach der Spezifikation [RFC 7946](https://geojson.org) ins GeoJSON Format umgewandelt und in die Abfrage einebunden. Wir nutzen die grafische Darstellung nutzen wir [OpenSteetMap](https://www.openstreetmap.de) Tiles welche wir über die Biblothek [Leaflet](https://leafletjs.com) abrufen und die GeoJson Ergenisse darstellen und anklickbar machen.
