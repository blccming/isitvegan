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

// T6/A2: Formular ohne Reload absenden
const formular = document.querySelector("form");
const status = document.querySelector("#status");
const ergebnisse = document.querySelector("#ergebnisse");

const zeigeStatus = (text, istFehler = false) => {
  status.textContent = text;
  status.classList.toggle("border-l-akzent", !istFehler);
  status.classList.toggle("border-l-akzent-warm-dunkel", istFehler);
  status.classList.toggle("bg-akzent/10", !istFehler);
  status.classList.toggle("bg-akzent-warm/20", istFehler);
};

formular.addEventListener("submit", (event) => {
  event.preventDefault();

  const ean = formular.elements.ean.value.trim();
  const produktname = formular.elements.produktname.value.trim();

  ergebnisse.replaceChildren();

  if (!/^[0-9]{8,14}$/.test(ean)) {
    zeigeStatus("Bitte gib eine EAN mit 8 bis 14 Ziffern ein.", true);
    return;
  }

  if (produktname === "") {
    zeigeStatus("Bitte gib einen Produktnamen ein.", true);
    return;
  }

  zeigeStatus("Eingabe geprüft.");
  for (const [bezeichnung, wert] of [["Produkt", produktname], ["EAN", ean]]) {
    const begriff = document.createElement("dt");
    begriff.className = "font-bold text-text-footer";
    begriff.textContent = bezeichnung;
    const definition = document.createElement("dd");
    definition.className = "font-semibold [overflow-wrap:anywhere]";
    definition.textContent = wert;
    ergebnisse.append(begriff, definition);
  }
});