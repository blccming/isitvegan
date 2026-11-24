// Ab Termin 6 wird das hier interessant.
// Bis dahin reicht ein Lebenszeichen, damit ihr seht, dass die Datei geladen wird.
import { BrowserMultiFormatOneDReader } from "@zxing/browser";

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
const barcodeBild = formular.elements.barcodebild;
const absendeKnopf = formular.querySelector('button[type="submit"]');
const barcodeLeser = new BrowserMultiFormatOneDReader();

// Teil B (Bonus): Verlauf über den Reload hinweg in localStorage merken
const SPEICHER_SCHLUESSEL = "isitvegan.verlauf";
const SPEICHER_VERSION = 4;

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

const hatGueltigeFelderV3 = (eintrag) =>
  eintrag !== null &&
  typeof eintrag === "object" &&
  typeof eintrag.produktname === "string" &&
  eintrag.produktname.trim() !== "" &&
  eintrag.produktname.length <= 100 &&
  typeof eintrag.ean === "string" &&
  /^[0-9]{8,14}$/.test(eintrag.ean) &&
  ["vegan", "nicht-vegan", "unklar"].includes(eintrag.veganStatus);

const hatGueltigeFelderV4 = (eintrag) =>
  hatGueltigeFelderV3(eintrag) && typeof eintrag.apiProduktname === "string";

const istGueltigerEintragV3 = (eintrag) =>
  hatGueltigeFelderV3(eintrag) && typeof eintrag.id === "string" && eintrag.id !== "";

const istGueltigerEintragV4 = (eintrag) =>
  hatGueltigeFelderV4(eintrag) && typeof eintrag.id === "string" && eintrag.id !== "";

// Gespeicherte Daten können von einer älteren Version stammen, von Hand
// verändert oder beschädigt sein. Dann lieber leer starten, als mit
// unpassenden Einträgen weiterzuarbeiten oder die App abstürzen zu lassen.
const ladeVerlauf = () => {
  try {
    const roh = localStorage.getItem(SPEICHER_SCHLUESSEL);
    if (roh === null) return [];

    const daten = JSON.parse(roh);
    if (!Array.isArray(daten?.eintraege)) return [];

    if (daten.version === 1 || daten.version === 2) {
      // Alte Einträge enthalten noch einen booleschen vegan-Wert.
      return daten.eintraege
        .filter(hatGueltigeFelder)
        .map((eintrag) => ({
          produktname: eintrag.produktname,
          apiProduktname: eintrag.produktname,
          ean: eintrag.ean,
          veganStatus: eintrag.vegan ? "vegan" : "nicht-vegan",
          id: daten.version === 1 ? neueId() : eintrag.id,
        }))
        .filter(istGueltigerEintragV4);
    }

    if (daten.version === 3) {
      return daten.eintraege
        .filter(istGueltigerEintragV3)
        .map((eintrag) => ({ ...eintrag, apiProduktname: eintrag.produktname }));
    }

    if (daten.version !== SPEICHER_VERSION) return [];
    return daten.eintraege.filter(istGueltigerEintragV4);
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

const holeProdukt = async (ean) => {
  const url = new URL(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(ean)}`);
  url.searchParams.set("fields", "product_name,ingredients_analysis_tags");

  const res = await fetch(url);
  let daten;
  try {
    daten = await res.json();
  } catch (error) {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    throw error;
  }

  if (!res.ok && !(res.status === 404 && daten.status === 0 && daten.code === ean)) {
    throw new Error(`HTTP ${res.status}`);
  }
  if (daten.status === 0 && daten.code === null) {
    throw new Error("Die Open-Food-Facts-URL ist ungültig. Bitte prüfe den API-Pfad.");
  }
  if (daten.status === 0 && daten.code === ean) {
    throw new Error("Für diese EAN wurde kein Produkt gefunden.");
  }
  if (daten.status !== 1 || !daten.product) {
    throw new Error("Für diese EAN wurde kein Produkt gefunden.");
  }

  const tags = daten.product.ingredients_analysis_tags;
  const veganStatus = Array.isArray(tags) && tags.includes("en:vegan")
    ? "vegan"
    : Array.isArray(tags) && tags.includes("en:non-vegan")
      ? "nicht-vegan"
      : "unklar";

  return { produktname: daten.product.product_name, veganStatus };
};

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
        `${eintrag.produktname} ${eintrag.apiProduktname} ${eintrag.ean}`.toLowerCase().includes(filter)
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
    name.className = "text-lg font-bold [overflow-wrap:anywhere]";
    name.textContent = eintrag.produktname;
    const ean = document.createElement("p");
    ean.className = "text-sm text-text-footer [overflow-wrap:anywhere]";
    ean.textContent = `EAN ${eintrag.ean}${
      eintrag.apiProduktname && eintrag.apiProduktname !== eintrag.produktname
        ? ` · Open Food Facts: ${eintrag.apiProduktname}`
        : ""
    }`;
    text.append(name, ean);

    const vegan = eintrag.veganStatus === "vegan";
    const nichtVegan = eintrag.veganStatus === "nicht-vegan";
    const veganStatus = document.createElement("span");
    veganStatus.className = `rounded-full px-2.5 py-0.5 text-xs font-bold ${
      vegan
        ? "bg-akzent/15 text-akzent"
        : nichtVegan
          ? "bg-akzent-warm/20 text-akzent-warm-dunkel"
          : "bg-bg text-text-footer"
    }`;
    veganStatus.textContent = vegan ? "Vegan" : nichtVegan ? "Nicht vegan" : "Unklar";

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

const pruefeEan = async (ean, eingegebenerProduktname) => {
  if (!/^[0-9]{8,14}$/.test(ean)) {
    zustand.meldung = { text: "Bitte gib eine EAN mit 8 bis 14 Ziffern ein.", istFehler: true };
    zeichne();
    return false;
  }

  if (!eingegebenerProduktname) {
    zustand.meldung = { text: "Bitte gib einen Produktnamen ein.", istFehler: true };
    zeichne();
    return false;
  }

  if (eingegebenerProduktname.length > 100) {
    zustand.meldung = {
      text: "Der Produktname darf höchstens 100 Zeichen lang sein.",
      istFehler: true,
    };
    zeichne();
    return false;
  }

  absendeKnopf.disabled = true;
  zustand.meldung = { text: "Lade Produktdaten …", istFehler: false };
  zeichne();

  try {
    const produkt = await holeProdukt(ean);
    const apiProduktname = produkt.produktname?.trim() ?? "";

    // Jede Eingabe bleibt als eigener Eintrag erhalten.
    const eanBekannt = zustand.verlauf.some((eintrag) => eintrag.ean === ean);
    zustand.verlauf = [
      {
        id: neueId(),
        produktname: eingegebenerProduktname,
        apiProduktname,
        ean,
        veganStatus: produkt.veganStatus,
      },
      ...zustand.verlauf,
    ];
    speichereVerlauf(zustand.verlauf);
    zustand.filter = "";
    filterFeld.value = "";

    const statusText = produkt.veganStatus === "vegan"
      ? "vegan"
      : produkt.veganStatus === "nicht-vegan"
        ? "nicht vegan"
        : "nicht eindeutig bestimmbar";
    zustand.meldung = {
      text: `„${eingegebenerProduktname}“ ist laut Open Food Facts ${statusText}.${eanBekannt ? " Die EAN ist bereits im Verlauf." : ""}`,
      istFehler: false,
    };
  } catch (error) {
    const text = error instanceof Error && error.message.startsWith("HTTP ")
      ? `Open Food Facts antwortet mit ${error.message}. Bitte versuche es später erneut.`
      : error instanceof Error
        ? error.message
        : "Die Produktdaten konnten nicht abgerufen werden. Bitte prüfe deine Verbindung.";
    zustand.meldung = { text, istFehler: true };
  } finally {
    absendeKnopf.disabled = false;
    zeichne();
  }
  return true;
};

formular.addEventListener("submit", async (event) => {
  event.preventDefault();
  await pruefeEan(
    formular.elements.ean.value.trim(),
    formular.elements.produktname.value.trim()
  );
});

barcodeBild.addEventListener("change", async () => {
  const datei = barcodeBild.files?.[0];
  if (!datei) return;

  if (!datei.type.startsWith("image/")) {
    zustand.meldung = { text: "Bitte wähle eine Bilddatei aus.", istFehler: true };
    zeichne();
    barcodeBild.value = "";
    return;
  }

  if (!formular.elements.produktname.value.trim()) {
    zustand.meldung = {
      text: "Bitte gib einen Produktnamen ein, bevor du ein Barcode-Foto auswählst.",
      istFehler: true,
    };
    zeichne();
    formular.elements.produktname.focus();
    barcodeBild.value = "";
    return;
  }

  let bildUrl;
  barcodeBild.disabled = true;
  absendeKnopf.disabled = true;
  zustand.meldung = { text: "Lese Barcode aus dem Bild …", istFehler: false };
  zeichne();

  try {
    bildUrl = URL.createObjectURL(datei);
    const ergebnis = await barcodeLeser.decodeFromImageUrl(bildUrl);
    const ean = ergebnis.getText().trim();
    formular.elements.ean.value = ean;
    await pruefeEan(ean, formular.elements.produktname.value.trim());
  } catch {
    zustand.meldung = {
      text: "Im Bild wurde kein Barcode erkannt. Bitte lade ein scharfes Foto mit sichtbarem EAN-Barcode hoch.",
      istFehler: true,
    };
    zeichne();
  } finally {
    if (bildUrl) URL.revokeObjectURL(bildUrl);
    barcodeBild.disabled = false;
    barcodeBild.value = "";
    absendeKnopf.disabled = false;
  }
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
