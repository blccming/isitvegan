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