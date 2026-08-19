/* ============================================
   Befehl 4: aendern
   Punkte und Münzen dazuzählen oder abziehen,
   Rekorde nachführen.

   WICHTIG: Der Browser schickt nicht «ich habe jetzt
   7 Punkte», sondern «gib mir 1 dazu». Das nennt man
   eine Veränderung (englisch: delta).

   Warum? Wenn du am Laptop spielst und am PC auch,
   würde «ich habe jetzt 7» den anderen Stand
   überschreiben. «Gib 1 dazu» geht immer gut aus.
   ============================================ */

const g = require("../gemeinsam");

/* Eine Veränderung darf nicht beliebig gross sein - sonst
   könnte jemand eine unsinnige Zahl schicken und die Tabelle
   damit unbrauchbar machen.

   Der Deckel stand zwischendurch bei 1000000, weil das
   Code-Feld die Million über diesen Befehl schickte. Seit der
   Code auf dem Server geprüft wird (api/code), braucht der
   Browser das nicht mehr - und der Deckel darf wieder
   dorthin, wo er hingehört.

   Wie hoch ist richtig? Das grösste, was ein einzelnes Spiel
   gibt, sind 2 Punkte. Dazu kann die Warteschlange mehrere
   Runden auf einmal nachreichen, wenn das Internet weg war.
   50 ist also grosszügig und trotzdem 20000-mal kleiner als
   vorher.

   Bei den Münzen darf es mehr sein: der Eintausch schickt
   -100 pro Punkt, und in einer langen Runde sammelt man
   einige.

   Ehrlich dazu: Das ist keine Mauer gegen Schummeln. Wer
   will, kann dem Server schicken was er mag - der Browser
   gehört ja ihm. Aber statt einer Million auf einen Schlag
   gibt es jetzt 50, und die Bremse in gemeinsam.js begrenzt,
   wie oft das geht. */

const HOECHSTE_PUNKTE = 50;
const HOECHSTE_MUENZEN = 1000;

/* Wie viele Punkte-Gutschriften pro Minute und Konto.
   Wer schneller ist, spielt nicht mehr selber. */
const GUTSCHRIFTEN_PRO_MINUTE = 20;

/* Grenzen für die Rekorde. Es gibt acht Spiele - 20 ist also
   grosszügig. Und kein Rekord dieser Welt ist eine Million:
   die längste Schlange hat 225, die weiteste Strecke im
   Rennen ein paar tausend. */
const HOECHSTENS_REKORDE = 20;
const HOECHSTER_REKORD = 1000000;

function veraenderungOrdnen(wert, deckel) {
  const zahl = Math.floor(Number(wert));

  if (isNaN(zahl)) {
    return 0;
  }
  if (zahl > deckel) {
    return deckel;
  }
  if (zahl < -deckel) {
    return -deckel;
  }
  return zahl;
}

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

  const punkteDazu = veraenderungOrdnen(inhalt.punkte, HOECHSTE_PUNKTE);
  const muenzenDazu = veraenderungOrdnen(inhalt.muenzen, HOECHSTE_MUENZEN);

  let neueRekorde = {};
  if (inhalt.rekorde !== null && typeof inhalt.rekorde === "object") {
    neueRekorde = inhalt.rekorde;
  }

  /* Warum eine Schleife?
     Zwischen «Zeile lesen» und «Zeile schreiben» könnte das
     andere Gerät dieselbe Zeile ändern. Azure merkt das am
     etag - einer Art Versionsnummer - und weist uns mit 412
     ab. Dann lesen wir neu und versuchen es nochmal. */

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

    /* Die Bremse gilt, wenn jemand etwas BEKOMMT - Punkte
       oder Münzen. Bezahlen darf man so oft man will, das
       kostet ja. Und Rekorde zählen auch dazu, sonst könnte
       man die Tabelle mit Schreibzugriffen fluten. */

    if (punkteDazu > 0 || muenzenDazu > 0 ||
        Object.keys(neueRekorde).length > 0) {

      const stand = g.bremsePruefen(zeile, GUTSCHRIFTEN_PRO_MINUTE, "punkteFenster");

      if (stand === null) {
        context.res = g.fehlerAntwort(429,
          "Das ging zu schnell. Warte einen Moment.");
        return;
      }

      Object.assign(zeile, stand);
    }

    // Punkte dürfen nie unter null fallen.
    let punkte = (zeile.punkte || 0) + punkteDazu;
    if (punkte < 0) {
      punkte = 0;
    }

    let muenzen = (zeile.muenzen || 0) + muenzenDazu;
    if (muenzen < 0) {
      muenzen = 0;
    }

    // Beim Rekord gilt: nur der bessere zählt.
    let rekorde = {};
    try {
      rekorde = JSON.parse(zeile.rekorde || "{}");
    } catch (fehler) {
      rekorde = {};
    }

    /* Auch hier gilt: der Browser darf schicken was er will.
       Ohne Grenzen könnte jemand tausend erfundene Spielnamen
       hineinschreiben, bis die Zeile in der Tabelle platzt.
       Darum drei Regeln: nicht zu viele, keine langen Namen,
       keine unsinnigen Werte. */

    for (const spiel in neueRekorde) {

      // Nicht mehr Spiele als es geben kann.
      if (rekorde[spiel] === undefined &&
          Object.keys(rekorde).length >= HOECHSTENS_REKORDE) {
        continue;
      }

      // Ein Spielname wie «snake» ist kurz. Alles Längere ist
      // kein Spielname, sondern ein Versuch.
      if (spiel.length > 30) {
        continue;
      }

      const wert = Math.floor(Number(neueRekorde[spiel]));

      if (isNaN(wert) || wert < 0 || wert > HOECHSTER_REKORD) {
        continue;
      }

      if (wert > (rekorde[spiel] || 0)) {
        rekorde[spiel] = wert;
      }
    }

    zeile.punkte = punkte;
    zeile.muenzen = muenzen;
    zeile.rekorde = JSON.stringify(rekorde);

    try {
      await g.tabelleHolen().updateEntity(zeile, "Merge", { etag: zeile.etag });
      context.res = g.antwort(200, g.kontoAntwort(zeile, null));
      return;
    } catch (fehler) {
      // 412 heisst: jemand war schneller. Nochmal von vorne.
      if (fehler.statusCode !== 412) {
        context.log.error(fehler);
        context.res = g.fehlerAntwort(500, "Der Server hat gerade ein Problem.");
        return;
      }
    }
  }

  context.res = g.fehlerAntwort(409, "Zu viel auf einmal - bitte nochmal.");
};
