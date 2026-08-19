/* ============================================
   Befehl 6: code
   Das Code-Feld unten in der Ecke der Startseite.

   WARUM DAS HIER LIEGT UND NICHT IM BROWSER:

   Vorher stand der PIN als `const PIN = "..."` in
   js/punkte.js. Diese Datei kann jeder öffnen - es genügt
   ein Rechtsklick auf die Seite. Wer hineinschaute, hatte
   den Code und damit eine Million Punkte.

   Jetzt kennt der Browser den Code gar nicht mehr. Er
   schickt nur, was jemand eingetippt hat, und der Server
   sagt ja oder nein. Der richtige Code steht als
   Einstellung CODE_PIN bei der Static Web App - also
   nirgends im Repository und nirgends im Browser.

   Dazu eine Bremse: höchstens ein paar Versuche pro Minute.
   Sonst könnte ein Programm einfach alle vierstelligen
   Zahlen durchprobieren - das wären nur 10000 Stück und
   ginge in Sekunden.
   ============================================ */

const g = require("../gemeinsam");

/* Wie viele Punkte der Code gibt. */
const PUNKTE_PRO_CODE = 1000000;

/* Wie viele Versuche pro Minute und Konto.
   Bei 5 pro Minute bräuchte man für 10000 Möglichkeiten
   rund 33 Stunden - und das fällt auf. */
const VERSUCHE_PRO_MINUTE = 5;

module.exports = async function (context, req) {

  if (req.method === "OPTIONS") {
    context.res = g.antwort(204, {});
    return;
  }

  const inhalt = g.inhaltLesen(req);
  const schluessel = g.tokenPruefen(inhalt.token);

  if (schluessel === null) {
    context.res = g.fehlerAntwort(401, "Bitte neu anmelden.");
    return;
  }

  /* Ist gar kein Code eingerichtet, gibt es auch keine Punkte.
     Wichtig: NICHT einfach durchwinken, wenn die Einstellung
     fehlt - sonst wäre eine vergessene Einstellung ein
     offenes Scheunentor. Im Zweifel also zu, nicht auf. */

  const geheim = process.env.CODE_PIN;

  if (typeof geheim !== "string" || geheim.length === 0) {
    context.res = g.fehlerAntwort(503, "Das Code-Feld ist gerade abgeschaltet.");
    return;
  }

  const eingabe = String(inhalt.code || "").trim().toLowerCase();

  /* Dieselbe Schleife wie in «aendern»: lesen, rechnen,
     schreiben - und nochmal, falls ein anderes Gerät
     schneller war (etag). */

  let versuch = 0;

  while (versuch < 4) {
    versuch = versuch + 1;

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

    /* Die Bremse gilt für JEDEN Versuch, auch für die falschen.
       Sonst könnte man beliebig oft raten - genau das soll sie
       ja verhindern. */

    const stand = g.bremsePruefen(zeile, VERSUCHE_PRO_MINUTE, "codeFenster");

    if (stand === null) {
      context.res = g.fehlerAntwort(429,
        "Zu viele Versuche. Warte eine Minute.");
      return;
    }

    Object.assign(zeile, stand);

    const stimmt = (eingabe === geheim.trim().toLowerCase());

    if (stimmt === true) {
      zeile.punkte = (zeile.punkte || 0) + PUNKTE_PRO_CODE;
    }

    try {
      // Auch beim falschen Code schreiben - sonst wäre der
      // Zähler der Bremse gleich wieder vergessen.
      await g.tabelleHolen().updateEntity(zeile, "Merge", { etag: zeile.etag });
    } catch (fehler) {

      // 412 heisst: jemand war schneller. Nochmal von vorne.
      if (fehler.statusCode === 412) {
        continue;
      }

      context.log.error(fehler);
      context.res = g.fehlerAntwort(500, "Der Server hat gerade ein Problem.");
      return;
    }

    if (stimmt === false) {
      context.res = g.fehlerAntwort(401, "Falscher Code.");
      return;
    }

    context.res = g.antwort(200, g.kontoAntwort(zeile, null));
    return;
  }

  context.res = g.fehlerAntwort(409, "Zu viel auf einmal - bitte nochmal.");
};
