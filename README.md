# Is it vegan?

Eine App, die dir hilft, herauszufinden, ob ein Produkt vegan ist. Scanne einfach den Barcode und die App zeigt dir an, ob das Produkt für deine Ernährungsform geeignet ist.

**Live:** [blccming.github.io/isitvegan/](https://blccming.github.io/isitvegan/)
**Team:** Oliver Kühn

Die Website ist als Single-Page aufgebaut. Die Navigation springt über Anker direkt zu den Bereichen `#start` und `#ueber`.

## Screenshot

![Screenshot der Website](Screenshot.png)

## Was die App kann

- Produkte über einen Barcode mit der Kamera scannen.
- Eine EAN-Nummer manuell eingeben und suchen.
- Produktdaten über die Open-Food-Facts-API abrufen.
- Anzeigen, ob ein Produkt vegan ist, und die dazugehörigen Produktinformationen darstellen.
- Eine verständliche Rückmeldung anzeigen, wenn ein Produkt nicht gefunden werden kann.
- Die zuletzt geprüften Produkte über einen Reload hinweg behalten (`localStorage`).

## Alternative Appideen
Zu Übungsblatt 1, Bonusaufgabe B: Ich ließ durch KI 5 Appideen generieren. 
Prompt: "Generiere mir 5 Projektideen für eine Webapp, die den Alltag erleichtern."

| Idee                                          | Beschreibung                                                                                      | Ablehnungsgrund                                                                                                                                                                         |
|-----------------------------------------------|---------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| SmartPlaner für den Haushalt                  | Einkaufslisten, Putzpläne, Mülltermine und wiederkehrende Aufgaben zentral verwalten.             | Besser durch bestehende Kalenderapp bzw. TODOs-App lösbar; für mich kein Mehrwehrt                                                                                                      |
| Alltags- und Terminassistent                  | Termine und Erledigungen priorisieren und daraus eine passende Tagesplanung erstellen.            | Ebenfalls durch bestehende Kalender- bzw. TODOs-App lösbar bzw. sind diese besser geeignet                                                                                              |
| Meal- und Einkaufsplaner                      | Gerichte nach Budget, Ernährungsform und vorhandenen Zutaten planen und Einkaufslisten erstellen. | Coole Idee, aber besser als native Smartphoneapp machbar                                                                                                                                |
| Gemeinschaftsorganisator für WGs und Familien | Gemeinsame Ausgaben, Aufgaben, Termine und Abstimmungen organisieren.                             | Würde Accountsystem benötigen, das ich im Rahmen des Projekts nicht implementieren möchte. Alternativ: externe Authentifikation; möchte ich aber ebenfalls nicht für diese Projekt tun. |
| Lokal-Helfer für den Alltag                   | Relevante lokale Informationen wie Öffnungszeiten, Abholtermine und Verkehr gebündelt anzeigen.   | Bereits bestehende Lösungen wie Google Maps, die das Problem hinreichend lösen.                                                                                                         |

Ich habe mich schließlich vom Meal- und Einkaufsplaner inspirieren lassen. 
Ein Problem, das mir häufiger beim Einkaufen begegnet ist, ist, dass Produkte mit tierischen Inhaltsstoffen nicht immer klar gekennzeichnet sind bzw. nur mit Mehraufwand (Zutatenliste lesen) von veganen Produkten zu unterscheiden sind. 
Ich möchte eine App bauen, die mir beim Einkaufen hilft, indem sie Produkte scannt und mir anzeigt, ob sie für meine Ernährungsform geeignet sind.

## Datenquelle

- **API:** https://world.openfoodfacts.org
- **Dokumentation:** https://openfoodfacts.github.io/openfoodfacts-server/api/
- Für die Anfragen ist kein API-Key erforderlich.
- Der CORS-Test war erfolgreich: Die API antwortete mit Status `200` und `ok: true`.

## Lokal starten

Abhängigkeiten installieren und den Vite-Entwicklungsserver starten:

```bash
npm install
npm run dev
```

## Technik

Womit gebaut und warum. Eine Zeile pro Entscheidung reicht, aber es soll eine Entscheidung sein, keine Aufzählung von Buzzwords.

## Produktions-Build

Der Vite-Build erzeugt unter `dist/assets/` die CSS-Datei `index-BWa8LM3T.css`. Sie ist aktuell 10,4 KiB groß.

Die Datei bleibt trotz der vielen Tailwind-Klassen klein, weil Tailwind im Produktions-Build nur die Klassen aus dem Projekt übernimmt,
die tatsächlich im HTML und in den Styles verwendet werden. Nicht verwendete Klassen werden nicht übernommen. Zudem wird die Datei komprimiert (Entfernen von Leerzeichen etc.).

## Lokal und live vergleichen

Lokal und live waren gleich, weil dieselben HTML-, CSS- und JavaScript-Dateien verwendet und durch den Produktions-Build einheitlich verarbeitet werden.
Die Falle unterschiedlicher Pfade wurde vermieden, indem alle internen Verweise relativ zur bereitgestellten Website funktionieren.
Die deployte Website wurde während der Entwicklung regelmäßig geprüft, um sicherzustellen, dass alles korrekt dargestellt wird.

## Wiederverwendete Komponenten

Die drei wiederverwendbaren Tailwind-Komponenten sind in `style.css` innerhalb von `@layer components` definiert:

- **`.component-card`:** Produkt-Check-Karte in `#start`.
- **`.button`:** Absende-Button „Los“ im Produktformular.
- **`.produkt-badge`:** „Produkt-Check“-Badge auf der Produktkarte.

## CSS-Kollisionen
Am Beispiel: 
```html
      <h1 id="start-titel">Is it vegan?</h1>
```
`font-size` ist laut body 1rem. Da das Element aber zu h1 gehört (und h1 spezifischer als body ist), wird es von der h1-Definition überschrieben und ist somit 2em groß.

## Rich Results Test / JSON-LD

Der JSON-LD-Block im `<head>` wurde mit dem Google Rich Results Test geprüft:

![Ergebnis des Google Rich Results Tests für den JSON-LD-Block](richresultstest.png)

## Sicherheit

Checkliste aus Termin 6, geprüft am 19.11.2026:

- [X] **Keine Geheimnisse:** Arbeitsbaum und komplette Git-Historie nach Schlüsseln, Passwörtern und `VITE_`-Variablen durchsucht – keine Treffer. Es gibt keine `.env`-Datei im Repo, und `.env` steht in `.gitignore`.
- [X] **Fremde Daten als Text:** Im Projekt wird kein `innerHTML`, `insertAdjacentHTML` oder `outerHTML` verwendet; Nutzereingaben laufen nur über `textContent` und `createElement`. Praxistest: `<img src=x onerror=alert(1)>` in EAN-, Produktnamen- und Filterfeld eingegeben – kein Dialog, der Text wurde nur als Text angezeigt.
- [X] **Eingaben prüfen:** Die EAN wird per `pattern`/`maxlength` und JS-Regex auf 8–14 Ziffern geprüft, der Produktname auf leer und höchstens 100 Zeichen (HTML `maxlength` plus JS-Prüfung), jeweils mit verständlicher Meldung; das Dateifeld akzeptiert nur `image/*`.
- [X] **HTTPS live:** `https://blccming.github.io/isitvegan/` antwortet über HTTPS, ein Aufruf über HTTP wird per 301 auf HTTPS umgeleitet; alle externen Verweise (Google Fonts, Open Food Facts) nutzen `https://`.
- [X] **GitHub gehärtet:** Die Zwei-Faktor-Authentifizierung ist im GitHub-Account aktiv. Dependabot-Alerts und Secret Scanning sind in den Repo-Einstellungen unter „Code security and analysis“ aktiviert; die Dependabot-Updates steuert `.github/dependabot.yml` (npm und GitHub Actions, wöchentlich).
- [X] **Saubere Fehler:** Die Meldungen sind kurze deutsche Sätze (z. B. „Bitte gib eine EAN mit 8 bis 14 Ziffern ein.“); es werden keine Stacktraces oder internen Details an Nutzer ausgegeben.

## KI-Log

Ehrlich ausfüllen, das zählt zur Bewertung.

| Werkzeug | Wofür benutzt |
|----------|----------------|
| Copilot  | Generierung und Bewertung von fünf Ideen für eine Webapp im Rahmen von Übungsblatt 1, Bonusaufgabe B. |
| Copilot  | Unterstützung bei der Umstellung von einer separaten `ueber.html` auf eine Single-Page mit Ankern. |
| Copilot  | Unterstützung bei kurzen Texten für die Meta-Description und die Projektbeschreibung. |
| Copilot  | Unterstützung bei der Planung und Validierung des EAN-Formulars, insbesondere bei der Behandlung der EAN als Text, damit führende Nullen erhalten bleiben. |
| Copilot  | Erstellung und Prüfung von `robots.txt`, `sitemap.xml` und `llms.txt` für Suchmaschinen und KI-Systeme. |
| Copilot  | Erstellung des JSON-LD-Blocks nach Schema.org und Ergänzung der Angaben zu Beschreibung, Lizenz und Creator. |
| Copilot  | Unterstützung bei der responsiven Umsetzung mit Flexbox, Grid und Tailwind. |
| Copilot  | Unterstützung bei der Vite- und Tailwind-Toolchain sowie der README-Dokumentation. |
| Claude Code | Formular ohne Reload (`submit`/`preventDefault`), Zustandsobjekt mit einer `zeichne()`-Funktion, Verlaufsliste mit Filter und Trefferzähler sowie vegan-Platzhalter-Badge. |

**Ein Fall, in dem KI geholfen hat:** Die KI ist unfassbar schnell in Frontend-Design und hat es mir erlaubt, durch reines Beschreiben meiner Designidee die Umsetzung in Tailwind zu erhalten. Das ging deutlich schneller und einfacher, als es selbst zu schreiben und erlaubte mir, das Ergebnis meiner Designidee direkt zu sehen und zu bewerten.

**Ein Fall, in dem KI falsch lag:** Die KI hat die neue Ergebnisanzeige (Verlauf) zuerst mit eigenem CSS umgesetzt, obwohl das Projekt durchgehend Tailwind nutzt. Das musste ich daraufhin korrigieren.
