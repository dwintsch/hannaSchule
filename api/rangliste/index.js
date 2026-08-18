/* ============================================
   Befehl 5: rangliste
   Wer hat am meisten Punkte?

   WICHTIG: Hier wird mit «select» genau aufgezählt,
   welche Spalten überhaupt geholt werden dürfen.
   Salz und Fingerabdruck vom Passwort bleiben so
   gar nicht erst im Spiel - sie verlassen die
   Tabelle nie.
   ============================================ */

const g = require("../gemeinsam");

/* Wie viele Plätze angezeigt werden. */
const PLAETZE = 10;

/* Notbremse: falls einmal sehr viele Konten da sind,
   hören wir nach so vielen Zeilen auf zu lesen. */
const HOECHSTENS = 500;

module.exports = async function (context, req) {

  if (req.method === "OPTIONS") {
    context.res = g.antwort(204, {});
    return;
  }

  // Der Ausweis ist freiwillig. Ist einer dabei, markieren
  // wir die eigene Zeile - anmelden muss man sich dafür nicht.
  const ichBin = g.tokenPruefen(g.inhaltLesen(req).token);

  const alle = [];

  try {
    const zeilen = g.tabelleHolen().listEntities({
      queryOptions: {
        filter: "PartitionKey eq '" + g.FACH + "'",
        select: ["RowKey", "anzeigeName", "punkte", "muenzen"]
      }
    });

    for await (const zeile of zeilen) {
      alle.push({
        name: zeile.anzeigeName || zeile.rowKey,
        punkte: zeile.punkte || 0,
        muenzen: zeile.muenzen || 0,
        ich: zeile.rowKey === ichBin
      });

      if (alle.length >= HOECHSTENS) {
        break;
      }
    }
  } catch (fehler) {
    context.log.error(fehler);
    context.res = g.fehlerAntwort(500, "Der Server hat gerade ein Problem.");
    return;
  }

  /* Sortieren: die meisten Punkte zuoberst.
     b minus a heisst «absteigend» - bei a minus b wäre
     der Kleinste zuoberst. Bei Gleichstand entscheiden
     die Münzen, danach der Name (damit die Reihenfolge
     nicht bei jedem Aufruf anders ist). */

  alle.sort(function (a, b) {
    if (b.punkte !== a.punkte) {
      return b.punkte - a.punkte;
    }
    if (b.muenzen !== a.muenzen) {
      return b.muenzen - a.muenzen;
    }
    return a.name.localeCompare(b.name);
  });

  context.res = g.antwort(200, {
    liste: alle.slice(0, PLAETZE),
    mitspieler: alle.length
  });
};
