# Nordlicht Outdoor

## Projekt
Demo-Shop „Nordlicht Outdoor“, Onlineshop für Wanderausrüstung für Tageswanderer. Alle Produkte, Preise und Daten sind erfunden. Keine echten personenbezogenen Daten verwenden.

## Arbeitsweise
- Knapp, sachlich, auf Deutsch.
- Bei Unklarheiten zuerst nachfragen, nicht raten.
- Gestaltungsentscheidungen in einem Satz begründen.

## Stil
Klar, natürlich, ruhig.

## Farben
- Nachtblau `#1B3A5C` für Logo, Kopfbereich und Überschriften.
- Tannengrün `#1F6F5C` nur für Buttons und Links.
- Hellgrau `#F7F7F5` als Hintergrund.
- `#222222` für Text.

## Schrift
Genau eine Schriftart, lokal aus `website/fonts/`. Nichts von fremden Servern laden.

## Pflicht
- Kontrast nach WCAG AA.
- Preise immer mit dem Hinweis „inkl. MwSt., zzgl. Versand“.
- Oben auf jeder Seite der Hinweis „Demo-Shop: keine echten Bestellungen“.

## Shop-Texte
Kurz und freundlich, Kunden mit „du“ ansprechen.

## Struktur
- HTML: `website/index.html`
- CSS: `website/css/style.css`
- JavaScript: `website/js/app.js`
- Schriften: `website/fonts/`
- Produktseiten: `website/produkte/`

## Mehrere Seiten
- Dateinamen klein, mit Bindestrich, Umlaute ausgeschrieben (ä → ae, ö → oe, ü → ue, ß → ss), keine Sonderzeichen. Beispiel: `trekkingstoecke-skarv.html`.
- Alle Seiten nutzen dieselbe `css/style.css` und `js/app.js`. Unterseiten verweisen mit relativen Pfaden (`../`).
- Demo-Hinweis, Kopf, Menü und Fuß sind auf allen Seiten gleich. Wer sie ändert, ändert sie auf allen Seiten.
- Jede Seite hat einen eigenen `<title>`, eine eigene `meta description` und genau eine `<h1>`.
- Produktdaten stehen fest im HTML, keine Datendatei. Name, Preis und `data-*`-Attribute auf Karte und Produktseite müssen übereinstimmen.
- Jede Unterseite hat einen sichtbaren Weg zurück zur Übersicht.
- Neue Seiten werden von der Startseite aus verlinkt.

## Sicherheit
API-Schlüssel, Passwörter und Zugangsdaten nie in den Code, sondern nur in eine `.env`-Datei, die in `.gitignore` steht.

## Git
Nur nach ausdrücklicher Absprache einrichten oder committen.
