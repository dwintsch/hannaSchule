/* ============================================
   Befehl 2: anmelden
   Name und Passwort prüfen, Ausweis ausstellen.
   ============================================ */

const g = require("../gemeinsam");

module.exports = async function (context, req) {

  if (req.method === "OPTIONS") {
    context.res = g.antwort(204, {});
    return;
  }

  const inhalt = g.inhaltLesen(req);
  const name = g.nameOrdnen(inhalt.name);

  // Absichtlich immer derselbe Satz, egal ob der Name nicht
  // existiert oder das Passwort falsch ist. Sonst könnte man
  // ausprobieren, welche Namen es überhaupt gibt.
  const abweisen = function () {
    context.res = g.fehlerAntwort(401, "Name oder Passwort stimmt nicht.");
  };

  if (name === null || typeof inhalt.passwort !== "string") {
    abweisen();
    return;
  }

  let zeile;
  try {
    zeile = await g.spielerHolen(g.schluesselVon(name));
  } catch (fehler) {
    context.log.error(fehler);
    context.res = g.fehlerAntwort(500, "Der Server hat gerade ein Problem.");
    return;
  }

  if (zeile === null) {
    abweisen();
    return;
  }

  if (g.passwortStimmt(inhalt.passwort, zeile.salz, zeile.fingerabdruck) === false) {
    abweisen();
    return;
  }

  context.res = g.antwort(200,
    g.kontoAntwort(zeile, g.tokenBauen(zeile.rowKey)));
};
