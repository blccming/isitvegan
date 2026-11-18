Fehler 1: 
- Die Eingabe im Formular bewirkt nichts.
- "sumbit" in Zeile 11 müsste "submit" heißen.
- Schreibfehler korrigieren.

Fehler 2:
- Wert von eingabe ist null.
- Die ID des Eingabefeldes ist "halt", nicht "eingabe".
- ID vereinheitlichen, entweder "eingabe" oder "halt" für beides verwenden.

Fehler 3:
- liste.appendChild(li) funktioniert nicht.
- Die ID in der HTML ist "liste", nicht "Liste", so wie in der app.js.
- Schreibweise vereinheitlichen.

Fehler 4:
- "undefined" Haltestellen / Zähler funktioniert nicht.
- Typo "haltestellen.lenght"
- Korrektur: "haltestellen.length"

Fehler 5:
- Zeile 16: if-Abfrage weist falsches Verhalten auf.
- = anstatt == genutzt
- Korrektur: if (name.length == 0) { ... }