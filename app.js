// Ab Termin 6 wird das hier interessant.
// Bis dahin reicht ein Lebenszeichen, damit ihr seht, dass die Datei geladen wird.

const jahr = document.querySelector("#jahr");
if (jahr) jahr.textContent = new Date().getFullYear();

const kopfzeile = document.querySelector("header");
const aktualisiereNavigation = () => {
  kopfzeile?.classList.toggle("ist-gescrollt", window.scrollY > 8);
};

aktualisiereNavigation();
window.addEventListener("scroll", aktualisiereNavigation, { passive: true });

console.log("app.js läuft");

// T6/A3: Ein Zustandsobjekt bestimmt die gesamte Anzeige
const formular = document.querySelector("form");
const status = document.querySelector("#status");
const verlaufListe = document.querySelector("#verlauf");
const anzahl = document.querySelector("#anzahl");
const filterFeld = document.querySelector("#verlauf-filter");

// Teil B (Bonus): Verlauf über den Reload hinweg in localStorage merken
const SPEICHER_SCHLUESSEL = "isitvegan.verlauf";
const SPEICHER_VERSION = 2;

const neueId = () =>
  crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

const hatGueltigeFelder = (eintrag) =>
  eintrag !== null &&
  typeof eintrag === "object" &&
  typeof eintrag.produktname === "string" &&
  eintrag.produktname.trim() !== "" &&
  eintrag.produktname.length <= 100 &&
  typeof eintrag.ean === "string" &&
  /^[0-9]{8,14}$/.test(eintrag.ean) &&
  typeof eintrag.vegan === "boolean";

const istGueltigerEintrag = (eintrag) =>
  hatGueltigeFelder(eintrag) && typeof eintrag.id === "string" && eintrag.id !== "";

// Gespeicherte Daten können von einer älteren Version stammen, von Hand
// verändert oder beschädigt sein. Dann lieber leer starten, als mit
// unpassenden Einträgen weiterzuarbeiten oder die App abstürzen zu lassen.
const ladeVerlauf = () => {
  try {
    const roh = localStorage.getItem(SPEICHER_SCHLUESSEL);
    if (roh === null) return [];

    const daten = JSON.parse(roh);
    if (!Array.isArray(daten?.eintraege)) return [];

    if (daten.version === 1) {
      // Einträge aus Version 1 kennen noch keine id: übernehmen und ergänzen.
      return daten.eintraege
        .filter(hatGueltigeFelder)
        .map((eintrag) => ({ ...eintrag, id: neueId() }));
    }

    if (daten.version !== SPEICHER_VERSION) return [];
    return daten.eintraege.filter(istGueltigerEintrag);
  } catch {
    return [];
  }
};

const speichereVerlauf = (verlauf) => {
  try {
    const daten = { version: SPEICHER_VERSION, eintraege: verlauf };
    localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(daten));
  } catch {
    // Kein localStorage (z. B. privater Modus oder voller Speicher):
    // Die App läuft weiter, nur ohne Erinnerung über den Reload hinweg.
  }
};

const zustand = {
  meldung: { text: "", istFehler: false },
  verlauf: ladeVerlauf(),
  filter: "",
};

// TODO(API): Demo-Platzhalter - solange Open Food Facts noch nicht angebunden
// ist, wechselt der vegane Status bei jeder Eingabe zwischen vegan und nicht vegan.
// Sobald die API-Abfrage eingebaut ist, stattdessen den echten Wert aus der
// API-Antwort in `vegan` schreiben (Open Food Facts liefert dafür u. a.
// `ingredients_analysis_tags` mit `en:vegan` bzw. `en:non-vegan`).
// Diese Variable und das Umschalten beim Absenden dann entfernen.
let demoVegan = true;

const eintraegeWort = (anzahlEintraege) =>
  anzahlEintraege === 1 ? "1 Eintrag" : `${anzahlEintraege} Einträge`;

const zeichne = () => {
  status.textContent = zustand.meldung.text;
  status.classList.toggle("border-l-akzent", !zustand.meldung.istFehler);
  status.classList.toggle("border-l-akzent-warm-dunkel", zustand.meldung.istFehler);
  status.classList.toggle("bg-akzent/10", !zustand.meldung.istFehler);
  status.classList.toggle("bg-akzent-warm/20", zustand.meldung.istFehler);

  const filter = zustand.filter.trim().toLowerCase();
  const sichtbar = filter
    ? zustand.verlauf.filter((eintrag) =>
        `${eintrag.produktname} ${eintrag.ean}`.toLowerCase().includes(filter)
      )
    : zustand.verlauf;

  const gesamt = zustand.verlauf.length;
  anzahl.textContent =
    gesamt === 0
      ? ""
      : filter
        ? `${sichtbar.length} von ${gesamt} sichtbar`
        : eintraegeWort(gesamt);

  verlaufListe.replaceChildren();
  if (sichtbar.length === 0) {
    const leer = document.createElement("li");
    leer.className = "text-text-footer";
    leer.textContent =
      gesamt === 0
        ? "Noch kein Produkt geprüft."
        : `Kein Eintrag passt zu „${zustand.filter.trim()}“.`;
    verlaufListe.append(leer);
    return;
  }

  for (const eintrag of sichtbar) {
    const punkt = document.createElement("li");
    punkt.className =
      "flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-rahmen bg-bg px-4 py-2.5";

    const text = document.createElement("div");
    text.className = "min-w-0";
    const name = document.createElement("p");
    name.className = "font-semibold [overflow-wrap:anywhere]";
    name.textContent = eintrag.produktname;
    const ean = document.createElement("p");
    ean.className = "text-sm text-text-footer";
    ean.textContent = `EAN ${eintrag.ean}`;
    text.append(name, ean);

    // TODO(API): Platzhalter-Badge - zeigt den echten Wert, sobald `eintrag.vegan`
    // aus der API-Antwort statt aus dem Demo-Umschalten stammt.
    const veganStatus = document.createElement("span");
    veganStatus.className = `rounded-full px-2.5 py-0.5 text-xs font-bold ${
      eintrag.vegan
        ? "bg-akzent/15 text-akzent"
        : "bg-akzent-warm/20 text-akzent-warm-dunkel"
    }`;
    veganStatus.textContent = eintrag.vegan ? "Vegan" : "Nicht vegan";

    const entfernen = document.createElement("button");
    entfernen.type = "button";
    entfernen.className =
      "rounded-lg px-2 py-1 text-sm font-semibold text-akzent-warm-dunkel hover:bg-akzent-warm/10";
    entfernen.textContent = "Entfernen";
    entfernen.setAttribute("aria-label", `„${eintrag.produktname}“ aus dem Verlauf entfernen`);
    entfernen.dataset.id = eintrag.id;

    const aktionen = document.createElement("div");
    aktionen.className = "flex items-center gap-3";
    aktionen.append(veganStatus, entfernen);

    punkt.append(text, aktionen);
    verlaufListe.append(punkt);
  }
};

formular.addEventListener("submit", (event) => {
  event.preventDefault();

  const ean = formular.elements.ean.value.trim();
  const produktname = formular.elements.produktname.value.trim();

  if (!/^[0-9]{8,14}$/.test(ean)) {
    zustand.meldung = { text: "Bitte gib eine EAN mit 8 bis 14 Ziffern ein.", istFehler: true };
    zeichne();
    return;
  }

  if (produktname === "") {
    zustand.meldung = { text: "Bitte gib einen Produktnamen ein.", istFehler: true };
    zeichne();
    return;
  }

  if (produktname.length > 100) {
    zustand.meldung = {
      text: "Der Produktname darf höchstens 100 Zeichen lang sein.",
      istFehler: true,
    };
    zeichne();
    return;
  }

  // TODO(API): Demo-Umschalten - hier später das echte Prüfergebnis der API
  // einsetzen (siehe Kommentar bei `demoVegan`).
  const vegan = demoVegan;
  demoVegan = !demoVegan;

  // Jede Eingabe bleibt als eigener Eintrag erhalten. Die id sorgt dafür,
  // dass auch bei gleicher EAN genau die angeklickte Zeile gelöscht wird.
  const eanBekannt = zustand.verlauf.some((eintrag) => eintrag.ean === ean);
  zustand.verlauf = [{ id: neueId(), produktname, ean, vegan }, ...zustand.verlauf];
  speichereVerlauf(zustand.verlauf);
  zustand.filter = "";
  filterFeld.value = "";
  zustand.meldung = {
    text: eanBekannt
      ? `„${produktname}“ wurde hinzugefügt. Hinweis: Die EAN ist bereits im Verlauf.`
      : `„${produktname}“ wurde zum Verlauf hinzugefügt.`,
    istFehler: false,
  };
  zeichne();
});

filterFeld.addEventListener("input", () => {
  zustand.filter = filterFeld.value;
  zeichne();
});

verlaufListe.addEventListener("click", (event) => {
  const knopf = event.target.closest("button[data-id]");
  if (!knopf) return;

  const id = knopf.dataset.id;
  const eintrag = zustand.verlauf.find((e) => e.id === id);
  if (!eintrag) return;

  zustand.verlauf = zustand.verlauf.filter((e) => e.id !== id);
  speichereVerlauf(zustand.verlauf);
  zustand.meldung = { text: `„${eintrag.produktname}“ wurde entfernt.`, istFehler: false };
  zeichne();
});

zeichne();