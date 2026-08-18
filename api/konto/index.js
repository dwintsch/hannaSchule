/* ============================================
   Befehl 3: konto
   «Wie steht es um mich?» - wird beim Laden jeder
   Seite gefragt, damit die Leiste oben stimmt.
   ============================================ */

const g = require("../gemeinsam");

module.exports = async function (context, req) {

  if (req.method === "OPTIONS") {
    context.res = g.antwort(204, {});
    return;
  }

  const schluessel = g.tokenPruefen(g.inhaltLesen(req).token);

  if (schluessel === null) {
    context.res = g.fehlerAntwort(401, "Bitte neu anmelden.");
    return;
  }

  let zeile;
  try {
    zeile = await g.spielerHolen(schluessel);
  } catch (fehler) {
    context.log.error(fehler);
    context.res = g.fehlerAntwort(500, "Der Server hat gerade ein Problem.");
    return;
  }

  if (zeile === null) {
    context.res = g.fehlerAntwort(401, "Bitte neu anmelden.");
    return;
  }

  context.res = g.antwort(200, g.kontoAntwort(zeile, null));
};
