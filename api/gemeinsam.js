/* ============================================
   Gemeinsame Helfer für den Server-Teil (fünf Befehle)

   Diese Datei ist für den Server das, was punkte.js
   für die Seiten ist: Sachen, die alle fünf Befehle
   brauchen, stehen nur hier - nicht fünfmal.

   Ein «Befehl des Servers» heisst bei Azure eine
   «Function». Jeder Ordner hier drin ist einer:
   registrieren, anmelden, konto, aendern, rangliste.
   ============================================ */

const crypto = require("crypto");
const { TableClient } = require("@azure/data-tables");

/* Die Tabelle ist wie ein Adressbuch: eine Zeile pro Spielerin.
   PartitionKey/RowKey sind die zwei Teile der «Hausnummer»,
   die Azure für jede Zeile verlangt. */
const TABELLE = "spieler";
const FACH = "spieler";

/* Wie lange ein Ausweis (Token) gilt: ein Jahr. */
const GUELTIG_MS = 365 * 24 * 60 * 60 * 1000;

let tabelle = null;

function tabelleHolen() {
  if (tabelle === null) {
    tabelle = TableClient.fromConnectionString(
      process.env.SPEICHER_VERBINDUNG, TABELLE);
  }
  return tabelle;
}

/* --- Der Name ---
   Gross/klein soll egal sein: «Hanna» und «hanna» sind
   dieselbe Person. Darum wird für die Hausnummer immer
   klein geschrieben, angezeigt aber, wie sie es getippt hat. */

function nameOrdnen(roh) {
  if (typeof roh !== "string") {
    return null;
  }
  const name = roh.trim();

  // Erlaubt sind Buchstaben, Zahlen, Leerschlag, - und _
  if (/^[a-zA-Z0-9äöüÄÖÜßéèàâ _-]{2,20}$/.test(name) === false) {
    return null;
  }
  return name;
}

function schluesselVon(name) {
  return name.toLowerCase();
}

/* --- Das Passwort ---
   Das Passwort wird NIE im Klartext gespeichert. Gespeichert
   wird nur ein «Fingerabdruck» davon (scrypt). Aus dem
   Fingerabdruck kann man das Passwort nicht zurückrechnen.

   Das Salz ist eine Zufallszahl pro Person. Damit haben zwei
   Leute mit demselben Passwort trotzdem verschiedene
   Fingerabdrücke. */

function salzZiehen() {
  return crypto.randomBytes(16).toString("hex");
}

function fingerabdruck(passwort, salz) {
  return crypto.scryptSync(passwort, salz, 32).toString("hex");
}

/* Vergleichen ohne zu verraten, ab welchem Buchstaben es
   nicht mehr stimmt - darum timingSafeEqual und nicht ===. */

function passwortStimmt(passwort, salz, gespeichert) {
  const versuch = Buffer.from(fingerabdruck(passwort, salz), "hex");
  const echt = Buffer.from(gespeichert, "hex");

  if (versuch.length !== echt.length) {
    return false;
  }
  return crypto.timingSafeEqual(versuch, echt);
}

/* --- Der Ausweis (Token) ---
   Nach dem Anmelden bekommt der Browser einen Ausweis.
   Bei jedem weiteren Befehl zeigt er ihn vor, statt das
   Passwort nochmal zu schicken.

   Im Ausweis steht: für wen er ist und bis wann er gilt.
   Dahinter kommt eine Unterschrift, die nur der Server
   machen kann. So kann niemand einen Ausweis fälschen. */

function b64(text) {
  return Buffer.from(text, "utf8").toString("base64url");
}

function unterschrift(inhalt) {
  return crypto.createHmac("sha256", process.env.TOKEN_GEHEIMNIS || "wechsel-mich")
    .update(inhalt).digest("base64url");
}

function tokenBauen(schluessel) {
  const inhalt = schluessel + "|" + (Date.now() + GUELTIG_MS);
  return b64(inhalt) + "." + unterschrift(inhalt);
}

/* Gibt den Schlüssel (den kleingeschriebenen Namen) zurück,
   oder null, wenn der Ausweis nicht stimmt oder abgelaufen ist. */

function tokenPruefen(token) {
  if (typeof token !== "string") {
    return null;
  }

  const teile = token.split(".");
  if (teile.length !== 2) {
    return null;
  }

  let inhalt;
  try {
    inhalt = Buffer.from(teile[0], "base64url").toString("utf8");
  } catch (fehler) {
    return null;
  }

  if (unterschrift(inhalt) !== teile[1]) {
    return null;
  }

  const stueck = inhalt.split("|");
  if (stueck.length !== 2) {
    return null;
  }

  if (Number(stueck[1]) < Date.now()) {
    return null;
  }

  return stueck[0];
}

/* --- Die Antwort ---
   Jede Antwort braucht denselben Kopf. Der Stern bei
   Allow-Origin heisst: die Seite darf auch dann fragen,
   wenn sie lokal per Doppelklick geöffnet wurde. */

function antwort(status, inhalt) {
  return {
    status: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(inhalt)
  };
}

function fehlerAntwort(status, text) {
  return antwort(status, { fehler: text });
}

/* --- Was der Browser geschickt hat ---
   Er schickt reinen Text. JSON.parse macht daraus wieder
   ein Objekt. Ist der Text kaputt, gibt es ein leeres Objekt
   statt eines Absturzes. */

function inhaltLesen(req) {
  if (req.body === null || req.body === undefined) {
    return {};
  }
  if (typeof req.body === "object") {
    return req.body;
  }
  try {
    return JSON.parse(req.body);
  } catch (fehler) {
    return {};
  }
}

/* --- Eine Zeile aus der Tabelle holen ---
   Gibt null zurück, wenn es die Person nicht gibt. */

async function spielerHolen(schluessel) {
  try {
    return await tabelleHolen().getEntity(FACH, schluessel);
  } catch (fehler) {
    if (fehler.statusCode === 404) {
      return null;
    }
    throw fehler;
  }
}

/* --- Was der Browser zurückbekommt ---
   Nur das, was ihn angeht. Salz und Fingerabdruck bleiben
   selbstverständlich auf dem Server. */

function kontoAntwort(zeile, token) {
  const daten = {
    name: zeile.anzeigeName,
    punkte: zeile.punkte || 0,
    muenzen: zeile.muenzen || 0,
    rekorde: {}
  };

  try {
    daten.rekorde = JSON.parse(zeile.rekorde || "{}");
  } catch (fehler) {
    daten.rekorde = {};
  }

  if (token) {
    daten.token = token;
  }
  return daten;
}

module.exports = {
  FACH,
  tabelleHolen,
  nameOrdnen,
  schluesselVon,
  salzZiehen,
  fingerabdruck,
  passwortStimmt,
  tokenBauen,
  tokenPruefen,
  antwort,
  fehlerAntwort,
  inhaltLesen,
  spielerHolen,
  kontoAntwort
};
