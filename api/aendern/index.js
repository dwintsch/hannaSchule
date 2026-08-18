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

   Der Deckel lag zuerst bei 500. Seit das Code-Feld eine
   Million Punkte auf einmal vergibt, muss er so hoch sein -
   sonst käme beim Server nur 500 an, und die Million wäre
   beim nächsten Seitenaufruf wieder weg.

   Ehrlich dazu: Das ist keine Sicherung gegen Schummeln. Wer
   will, kann dem Server sowieso schicken was er mag - der
   Browser gehört ja ihm. Es ist nur eine Notbremse gegen
   kaputte Zahlen. */

const HOECHSTE_VERAENDERUNG = 1000000;

function veraenderungOrdnen(wert) {
  const zahl = Math.floor(Number(wert));

  if (isNaN(zahl)) {
    return 0;
  }
  if (zahl > HOECHSTE_VERAENDERUNG) {
    return HOECHSTE_VERAENDERUNG;
  }
  if (zahl < -HOECHSTE_VERAENDERUNG) {
    return -HOECHSTE_VERAENDERUNG;
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

  const punkteDazu = veraenderungOrdnen(inhalt.punkte);
  const muenzenDazu = veraenderungOrdnen(inhalt.muenzen);

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

    for (const spiel in neueRekorde) {
      const wert = Math.floor(Number(neueRekorde[spiel]));

      if (isNaN(wert) === false && wert > (rekorde[spiel] || 0)) {
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
