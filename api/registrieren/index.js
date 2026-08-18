/* ============================================
   Befehl 1: registrieren
   Ein neues Konto anlegen.

   Der Browser schickt: name, passwort und - falls
   auf diesem Computer schon Punkte herumliegen -
   auch die, damit nichts verloren geht.
   ============================================ */

const g = require("../gemeinsam");

/* Damit niemand mit einer erfundenen Riesenzahl ankommt. */
function zahlOrdnen(wert) {
  const zahl = Math.floor(Number(wert));

  if (isNaN(zahl) || zahl < 0) {
    return 0;
  }
  // So hoch wie der Deckel in «aendern» - sonst gingen die
  // Punkte aus dem Code-Feld beim Registrieren verloren.
  if (zahl > 1000000) {
    return 1000000;
  }
  return zahl;
}

module.exports = async function (context, req) {

  if (req.method === "OPTIONS") {
    context.res = g.antwort(204, {});
    return;
  }

  const inhalt = g.inhaltLesen(req);
  const name = g.nameOrdnen(inhalt.name);

  if (name === null) {
    context.res = g.fehlerAntwort(400,
      "Der Name braucht 2 bis 20 Zeichen: Buchstaben, Zahlen, Leerschlag, - oder _");
    return;
  }

  if (typeof inhalt.passwort !== "string" || inhalt.passwort.length < 4) {
    context.res = g.fehlerAntwort(400,
      "Das Passwort braucht mindestens 4 Zeichen.");
    return;
  }

  const schluessel = g.schluesselVon(name);
  const salz = g.salzZiehen();

  const zeile = {
    partitionKey: g.FACH,
    rowKey: schluessel,
    anzeigeName: name,
    salz: salz,
    fingerabdruck: g.fingerabdruck(inhalt.passwort, salz),
    punkte: zahlOrdnen(inhalt.punkte),
    muenzen: zahlOrdnen(inhalt.muenzen),
    rekorde: "{}"
  };

  try {
    // createEntity meckert von selber, wenn es die Zeile schon gibt.
    // Darum braucht es kein Nachschauen vorher - zwischen Nachschauen
    // und Anlegen könnte sonst jemand dazwischenfunken.
    await g.tabelleHolen().createEntity(zeile);
  } catch (fehler) {
    if (fehler.statusCode === 409) {
      context.res = g.fehlerAntwort(409,
        "Diesen Namen gibt es schon. Nimm einen anderen - oder melde dich an.");
      return;
    }
    context.log.error(fehler);
    context.res = g.fehlerAntwort(500, "Der Server hat gerade ein Problem.");
    return;
  }

  context.res = g.antwort(200, g.kontoAntwort(zeile, g.tokenBauen(schluessel)));
};
