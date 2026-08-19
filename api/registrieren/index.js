/* ============================================
   Befehl 1: registrieren
   Ein neues Konto anlegen.

   Der Browser schickt NUR name und passwort.

   WARUM KEINE PUNKTE MEHR:
   Früher durfte der Browser beim Anlegen gleich einen
   Punktestand mitschicken. Gedacht war das, damit Punkte
   nicht verloren gehen, die vor der Anmeldung auf diesem
   Computer gesammelt wurden.

   Am 18.08.2026 hat jemand genau das ausgenutzt: ein Konto
   anlegen und «punkte: 99999» mitschicken - fertig war der
   erste Platz, mit einem einzigen Aufruf und ohne ein
   einziges Spiel.

   Ein neues Konto fängt darum jetzt IMMER bei null an.
   Das ist die Regel: Der Browser darf sagen, was er GETAN
   hat, aber nie, wie viel er HAT.
   ============================================ */

const g = require("../gemeinsam");

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
    // Immer bei null anfangen - siehe oben.
    punkte: 0,
    muenzen: 0,
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
