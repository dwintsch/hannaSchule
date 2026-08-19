/* ============================================
   Befehl 2: anmelden
   Name und Passwort prüfen, Ausweis ausstellen.
   ============================================ */

const g = require("../gemeinsam");

/* Wie viele Anmeldeversuche pro Minute und Konto.

   WARUM DAS SEIN MUSS:
   Ein Passwort darf 4 Zeichen kurz sein. Ohne Bremse könnte
   ein Programm alle 10000 vierstelligen Zahlen in wenigen
   Sekunden durchprobieren - und dann in einem FREMDEN Konto
   sitzen. Das wäre schlimmer als jedes Schummeln: da ginge es
   nicht um eigene Punkte, sondern um Hannas Konto.

   Mit 10 Versuchen pro Minute dauern 10000 Möglichkeiten rund
   17 Stunden - und in der Zeit fällt es auf.

   Wer sich richtig anmeldet, bekommt den Zähler zurückgesetzt.
   Wer sich dreimal vertippt und dann richtig liegt, wird also
   nicht später dafür bestraft. */

const VERSUCHE_PRO_MINUTE = 10;

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

  /* Erst die Bremse, dann das Passwort. Sonst könnte man
     beliebig oft raten - genau das soll sie ja verhindern. */

  const stand = g.bremsePruefen(zeile, VERSUCHE_PRO_MINUTE, "anmeldeFenster");

  if (stand === null) {
    context.res = g.fehlerAntwort(429,
      "Zu viele Versuche. Warte eine Minute.");
    return;
  }

  const stimmt = g.passwortStimmt(inhalt.passwort, zeile.salz, zeile.fingerabdruck);

  if (stimmt === true) {

    // Richtig angemeldet: der Zähler fängt wieder bei null an.
    zeile.anmeldeFensterStart = 0;
    zeile.anmeldeFensterZaehler = 0;

  } else {
    Object.assign(zeile, stand);
  }

  /* Den Zählerstand festhalten. Klappt das Schreiben nicht
     (weil ein anderes Gerät schneller war), ist das kein
     Grund, das Anmelden scheitern zu lassen - dann zählt
     dieser eine Versuch halt nicht mit. */

  try {
    await g.tabelleHolen().updateEntity(zeile, "Merge", { etag: zeile.etag });
  } catch (fehler) {
    context.log.error(fehler);
  }

  if (stimmt === false) {
    abweisen();
    return;
  }

  context.res = g.antwort(200,
    g.kontoAntwort(zeile, g.tokenBauen(zeile.rowKey)));
};
