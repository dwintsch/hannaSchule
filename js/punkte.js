/* ============================================
   Anmelden und Punkte sammeln
   Wird von ALLEN Seiten gebraucht - darum eine
   eigene Datei, genau wie konfetti.js.

   NEU: Es gibt jetzt ein richtiges Konto mit Name UND
   Passwort. Die Punkte liegen auf einem Server im
   Internet. Darum sind sie an jedem Computer dieselben -
   zu Hause, in der Schule, auf dem Handy.

   Vorher lagen sie nur im localStorage. Das ist ein
   kleines Notizheft, das der Browser für diese Seite
   führt - und dieses Heft gehört zu EINEM Browser auf
   EINEM Computer. Darum fing man woanders bei null an.

   Das Notizheft gibt es weiterhin, aber es ist jetzt nur
   noch die Abschrift. Der Server ist das Original.

   Warum überhaupt eine Abschrift?
   Weil eine Frage ans Internet immer einen Moment dauert.
   Die Spiele sollen aber sofort weiterlaufen. Also:
   zuerst in die Abschrift schreiben (das geht sofort),
   dann im Hintergrund dem Server Bescheid geben.
   ============================================ */

/* Unter diesen Namen wird in der Abschrift gespeichert. */
const SCHLUESSEL_SPIELER = "lernwelt-spieler";
const SCHLUESSEL_PUNKTE = "lernwelt-punkte-";
const SCHLUESSEL_MUENZEN = "lernwelt-muenzen-";
const SCHLUESSEL_GRATIS = "lernwelt-gratis-rennen";
const SCHLUESSEL_TOKEN = "lernwelt-token";
const SCHLUESSEL_WARTEN = "lernwelt-warteschlange";

/* --- Wo der Server steht ---
   Ist die Seite im Internet geöffnet (https), liegt der
   Server gleich nebenan - dann genügt "/api".
   Ist sie per Doppelklick geöffnet (file:), muss die
   ganze Adresse hin, sonst weiss der Browser nicht wohin. */

const SERVER = (location.protocol === "http:" || location.protocol === "https:")
  ? "/api"
  : "https://witty-water-0c6d8c31e.7.azurestaticapps.net/api";

/* --- Der Code ---
   HIER darfst du den PIN ändern - und nur hier.
   Es dürfen auch Buchstaben sein. Dann bitte klein schreiben:
   die Eingabe wird sowieso in Kleinbuchstaben umgewandelt,
   damit GROSS oder klein keine Rolle spielt. */

const PIN = "8590";

/* Wie viele Gratis-Rennen ein Code freischaltet.
   Hier darfst du drehen: 3, 10 - was du willst. */

const GRATIS_PRO_CODE = 5;

/* Und wie viele Punkte es dazu gibt.

   ACHTUNG beim Ändern: Der Server nimmt höchstens
   HOECHSTE_VERAENDERUNG (= 1000000) auf einmal entgegen.
   Steht hier eine grössere Zahl, kommt beim Server nur der
   Deckel an - im Browser stünde kurz mehr, und beim nächsten
   Seitenaufruf wäre es wieder weg. Siehe api/aendern. */

const PUNKTE_PRO_CODE = 1000000;

/* --- Münzen eintauschen ---
   Sobald so viele Münzen beisammen sind, werden sie
   WEGGENOMMEN und dafür gibt es einen Punkt. Wie am Kiosk:
   Münzen rein, Ware raus.

   Hier darfst du drehen: 50 macht es leichter, 200 schwerer. */

const MUENZEN_PRO_PUNKT = 100;

/* --- Was die Leiste gerade anzeigt ---
   "anmelden"     = du hast schon ein Konto
   "registrieren" = du legst dir gerade eines an

   Das ist ein Merkzettel, genau wie «erledigt» und
   «verpatzt» beim Quiz. Er merkt sich, in welchem
   Zustand die Leiste gerade ist.

   let statt const, weil er sich ändern darf. */

let leistenModus = "anmelden";

/* ============================================
   Mit dem Server reden
   ============================================ */

/* Schickt eine Frage an den Server und wartet auf die Antwort.

   «async» heisst: dieser Befehl braucht vielleicht einen
   Moment. «await» heisst: hier warten wir auf die Antwort.
   Der Rest der Seite läuft solange normal weiter.

   Der Text wird als "text/plain" geschickt. Das klingt
   komisch für JSON, hat aber einen Grund: so fragt der
   Browser nicht vorher noch einmal um Erlaubnis nach.
   Das spart eine Runde und macht weniger Ärger. */

async function serverFragen(befehl, daten) {

  const antwort = await fetch(SERVER + "/" + befehl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: JSON.stringify(daten)
  });

  let inhalt = {};
  try {
    inhalt = await antwort.json();
  } catch (fehler) {
    inhalt = {};
  }

  // ok ist false bei allem ab 400 - also bei jedem Problem.
  if (antwort.ok === false) {
    throw new Error(inhalt.fehler || "Der Server antwortet gerade nicht.");
  }

  return inhalt;
}

/* --- Der Ausweis ---
   Beim Anmelden gibt der Server einen Ausweis (Token) aus.
   Den legen wir ins Notizheft. Bei jeder weiteren Frage
   zeigen wir ihn vor, statt das Passwort nochmal zu schicken. */

function token() {
  return localStorage.getItem(SCHLUESSEL_TOKEN);
}

/* --- Die Antwort des Servers in die Abschrift übertragen --- */

function kontoUebernehmen(daten) {

  localStorage.setItem(SCHLUESSEL_SPIELER, daten.name);
  localStorage.setItem(SCHLUESSEL_PUNKTE + daten.name, daten.punkte);
  localStorage.setItem(SCHLUESSEL_MUENZEN + daten.name, daten.muenzen);

  if (daten.token) {
    localStorage.setItem(SCHLUESSEL_TOKEN, daten.token);
  }

  // Die Rekorde kommen als kleine Liste: Spielname -> Bestwert.
  for (const spiel in daten.rekorde) {
    localStorage.setItem("lernwelt-rekord-" + spiel + "-" + daten.name,
      daten.rekorde[spiel]);
  }
}

/* ============================================
   Die Warteschlange

   Was passiert, wenn das Internet gerade weg ist?
   Dann wäre der Punkt verloren. Darum legen wir jede
   Veränderung zuerst auf einen Stapel. Klappt das
   Schicken, ist der Stapel leer. Klappt es nicht,
   bleibt sie liegen und wird beim nächsten Mal
   nachgereicht.
   ============================================ */

function leererStapel() {
  return { punkte: 0, muenzen: 0, rekorde: {} };
}

function stapelLesen() {
  try {
    const wert = localStorage.getItem(SCHLUESSEL_WARTEN);

    if (wert === null) {
      return leererStapel();
    }
    return JSON.parse(wert);
  } catch (fehler) {
    return leererStapel();
  }
}

function stapelSchreiben(stapel) {
  localStorage.setItem(SCHLUESSEL_WARTEN, JSON.stringify(stapel));
}

/* Etwas auf den Stapel legen. Liegt schon etwas da,
   wird zusammengezählt - aus +1 und +1 wird +2. */

function stapelDazu(mehr) {

  const stapel = stapelLesen();

  stapel.punkte = stapel.punkte + (mehr.punkte || 0);
  stapel.muenzen = stapel.muenzen + (mehr.muenzen || 0);

  const rekorde = mehr.rekorde || {};

  for (const spiel in rekorde) {
    if (rekorde[spiel] > (stapel.rekorde[spiel] || 0)) {
      stapel.rekorde[spiel] = rekorde[spiel];
    }
  }

  stapelSchreiben(stapel);
}

function stapelIstLeer(stapel) {
  return stapel.punkte === 0 &&
    stapel.muenzen === 0 &&
    Object.keys(stapel.rekorde).length === 0;
}

/* Den Stapel abschicken.
   Zuerst nehmen wir ihn weg (der Stapel ist wieder leer),
   dann schicken wir. Geht es schief, legen wir ihn zurück.
   So kann nichts doppelt gezählt werden. */

/* --- Die Rangliste anstupsen ---
   Haben sich Punkte geändert, stimmt die Rangliste links
   nicht mehr. Es gibt sie aber nur, wenn js/rangliste.js
   geladen ist. Darum zuerst nachschauen, ob es den Befehl
   überhaupt gibt - genau wie beim Code-Feld ganz unten.

   So bleiben die zwei Dateien unabhängig: punkte.js
   funktioniert auch ohne Rangliste. */

function ranglisteAuffrischen() {
  if (typeof ranglisteLaden === "function") {
    ranglisteLaden();
  }
}

function stapelSenden() {

  if (token() === null) {
    return;
  }

  const paket = stapelLesen();

  if (stapelIstLeer(paket) === true) {
    return;
  }

  stapelSchreiben(leererStapel());

  serverFragen("aendern", {
    token: token(),
    punkte: paket.punkte,
    muenzen: paket.muenzen,
    rekorde: paket.rekorde
  })
    .then(function (daten) {
      // Der Server hat das letzte Wort: seine Zahlen gelten.
      kontoUebernehmen(daten);
      leisteZeichnen();
      ranglisteAuffrischen();
    })
    .catch(function () {
      // Nicht angekommen - zurück auf den Stapel.
      stapelDazu(paket);
    });
}

/* ============================================
   Lesen aus der Abschrift
   Diese Befehle antworten sofort, ohne Internet.
   ============================================ */

/* --- Wer ist gerade angemeldet? ---
   Gibt den Namen zurück, oder null wenn niemand da ist. */

function angemeldeterSpieler() {

  // Ohne Ausweis gilt man als nicht angemeldet - auch wenn
  // der Name noch im Notizheft steht.
  if (token() === null) {
    return null;
  }
  return localStorage.getItem(SCHLUESSEL_SPIELER);
}

/* --- Wie viele Punkte hat jemand? --- */

function punkteVon(name) {
  const wert = localStorage.getItem(SCHLUESSEL_PUNKTE + name);

  // Noch nie gespielt? Dann steht nichts im Heft.
  if (wert === null) {
    return 0;
  }

  // Im Heft steht Text. Number macht daraus eine Zahl.
  return Number(wert);
}

/* --- Die Münzen ---
   Münzen sind etwas anderes als Punkte!

   Punkte verdient man in den Lernspielen und bezahlt damit die
   Belohnungsspiele. Münzen sammelt man IM Belohnungsspiel ein.
   Sobald 100 beisammen sind, werden sie gegen einen Punkt
   eingetauscht und sind danach weg - siehe
   muenzenEintauschen() und MUENZEN_PRO_PUNKT weiter oben.
   Darum haben sie ihre eigene Schublade im Notizheft. */

function muenzenVon(name) {
  const wert = localStorage.getItem(SCHLUESSEL_MUENZEN + name);

  if (wert === null) {
    return 0;
  }

  return Number(wert);
}

/* ============================================
   Anmelden, Konto erstellen, Abmelden
   ============================================ */

/* Holt Name und Passwort aus der Leiste und schaut sie grob an,
   bevor wir überhaupt den Server fragen. */

function eingabeHolen() {

  const namensfeld = document.getElementById("namensfeld");
  const passwortfeld = document.getElementById("passwortfeld");

  // trim schneidet Leerschläge am Anfang und Ende weg.
  const name = namensfeld.value.trim();
  const passwort = passwortfeld.value;

  if (name === "") {
    meldungZeigen("Bitte gib deinen Namen ein.", "falsch");
    namensfeld.focus();
    return null;
  }

  if (passwort.length < 4) {
    meldungZeigen("Das Passwort braucht mindestens 4 Zeichen.", "falsch");
    passwortfeld.focus();
    return null;
  }

  return { name: name, passwort: passwort };
}

/* --- Zwischen «Anmelden» und «Registrieren» umschalten ---
   Der Knopf «Neu hier?» legt NICHT sofort ein Konto an. Er
   schaltet nur um: aus «Anmelden» wird «Registrieren».
   Erst dieser Knopf legt dann wirklich an.

   Warum so? Weil Anlegen kein Versehen sein soll. Man drückt
   erst um - und sieht dann schwarz auf weiss, was passiert. */

function modusWechseln() {

  if (leistenModus === "anmelden") {
    leistenModus = "registrieren";
  } else {
    leistenModus = "anmelden";
  }

  // Neu zeichnen löscht alles, was schon getippt wurde.
  // Darum vorher merken und nachher zurückschreiben.
  const name = document.getElementById("namensfeld").value;
  const passwort = document.getElementById("passwortfeld").value;

  leisteZeichnen();

  document.getElementById("namensfeld").value = name;
  document.getElementById("passwortfeld").value = passwort;

  if (leistenModus === "registrieren") {
    meldungZeigen("Denk dir ein Passwort aus - mindestens 4 Zeichen. " +
      "Merk es dir gut, es gibt kein Zurücksetzen!", "");
  } else {
    meldungZeigen("", "");
  }
}

/* --- Der grosse Knopf ---
   Je nach Merkzettel meldet er an oder legt an. Auch die
   Enter-Taste ruft ihn - so macht Enter immer dasselbe wie
   der Knopf, der gerade dasteht. */

function hauptknopfDruecken() {

  if (leistenModus === "registrieren") {
    registrieren();
  } else {
    anmelden();
  }
}

/* Während wir auf den Server warten, sollen die Knöpfe
   nicht nochmal gedrückt werden können. */

function knoepfeSperren(gesperrt) {
  const knoepfe = document.querySelectorAll("#spielerleiste .leiste-knopf");

  for (const knopf of knoepfe) {
    knopf.disabled = gesperrt;
  }
}

/* --- Anmelden --- */

async function anmelden() {

  const eingabe = eingabeHolen();

  if (eingabe === null) {
    return;
  }

  meldungZeigen("Einen Moment...", "");
  knoepfeSperren(true);

  try {
    const daten = await serverFragen("anmelden", eingabe);

    kontoUebernehmen(daten);
    leisteZeichnen();

    // Jetzt weiss der Server, wer wir sind - die eigene Zeile
    // in der Rangliste soll darum hervorgehoben werden.
    ranglisteAuffrischen();

    // Lagen vom letzten Mal schon 100 Münzen herum, werden
    // sie gleich hier eingetauscht.
    muenzenEintauschen();

    // Falls noch etwas vom letzten Mal liegen geblieben ist.
    stapelSenden();

  } catch (fehler) {
    knoepfeSperren(false);
    meldungZeigen(fehler.message, "falsch");
  }
}

/* --- Neues Konto erstellen ---
   Hat man auf diesem Computer schon ohne Konto gespielt,
   nehmen wir die Punkte gleich mit ins neue Konto. Sonst
   wäre alles Gesammelte weg. */

async function registrieren() {

  const eingabe = eingabeHolen();

  if (eingabe === null) {
    return;
  }

  meldungZeigen("Einen Moment...", "");
  knoepfeSperren(true);

  try {
    const daten = await serverFragen("registrieren", {
      name: eingabe.name,
      passwort: eingabe.passwort,
      punkte: punkteVon(eingabe.name),
      muenzen: muenzenVon(eingabe.name)
    });

    kontoUebernehmen(daten);

    // Zurück auf «Anmelden», damit beim nächsten Abmelden
    // wieder der normale Knopf dasteht.
    leistenModus = "anmelden";

    leisteZeichnen();
    ranglisteAuffrischen();
    meldungZeigen("Konto angelegt. Merk dir das Passwort gut!", "stimmt");

  } catch (fehler) {
    knoepfeSperren(false);
    meldungZeigen(fehler.message, "falsch");
  }
}

/* --- Abmelden ---
   Löscht den Ausweis aus diesem Browser. Auf dem Server
   bleibt alles stehen - beim nächsten Anmelden ist es wieder da. */

function abmelden() {

  // Zuerst noch schnell abschicken, was liegen geblieben ist.
  stapelSenden();

  localStorage.removeItem(SCHLUESSEL_TOKEN);
  localStorage.removeItem(SCHLUESSEL_SPIELER);

  /* Auch die Gratis-Runden sind weg.

     Sie gehören zwar zum Computer und nicht zum Konto - aber
     wer sich abmeldet, gibt den Platz frei. Sonst würde die
     nächste Person die Gratis-Runden erben, die jemand anders
     mit dem Code freigeschaltet hat. Wer sie wieder will,
     tippt den Code einfach nochmal ein. */

  localStorage.removeItem(SCHLUESSEL_GRATIS);

  // Wer sich abmeldet, will sich normalerweise wieder
  // anmelden - nicht ein zweites Konto anlegen.
  leistenModus = "anmelden";

  leisteZeichnen();

  // Die eigene Zeile ist jetzt nicht mehr die eigene.
  ranglisteAuffrischen();
}

/* ============================================
   Punkte und Münzen verändern

   Diese drei Befehle antworten sofort mit true oder false.
   Die Spiele merken also nichts davon, dass jetzt ein
   Server dahintersteht - genau darum wurde es so gebaut.
   ============================================ */

/* --- Punkte dazugeben ---
   Gibt true zurück, wenn es geklappt hat, und false,
   wenn niemand angemeldet ist. So kann jedes Spiel
   selber entscheiden, was es dann anzeigt. */

function punkteDazu(anzahl) {

  const name = angemeldeterSpieler();

  if (name === null) {
    return false;
  }

  const neu = punkteVon(name) + anzahl;
  localStorage.setItem(SCHLUESSEL_PUNKTE + name, neu);

  stapelDazu({ punkte: anzahl });
  stapelSenden();

  leisteZeichnen();
  return true;
}

/* Gibt false zurück, wenn niemand angemeldet ist. Dann werden
   die Münzen nicht gespeichert - gesammelt werden dürfen sie
   trotzdem, sie stehen dann nur im Spiel selber. */

function muenzenDazu(anzahl) {

  const name = angemeldeterSpieler();

  if (name === null) {
    return false;
  }

  localStorage.setItem(SCHLUESSEL_MUENZEN + name, muenzenVon(name) + anzahl);
  stapelDazu({ muenzen: anzahl });

  // Sind jetzt 100 beisammen? Dann gleich eintauschen.
  // Der Eintausch schickt den Stapel selber ab - darum
  // nur dann selber schicken, wenn nichts getauscht wurde.
  if (muenzenEintauschen() === 0) {
    stapelSenden();
  }

  leisteZeichnen();
  return true;
}

/* --- Münzen gegen Punkte eintauschen ---

   Sobald 100 Münzen beisammen sind, werden sie WEGGENOMMEN
   und dafür gibt es einen Punkt. Wie am Kiosk: Münzen rein,
   Ware raus - die Münzen sind danach weg.

   Math.floor schneidet die Nachkommastellen weg. Aus
   250 / 100 = 2.5 wird also 2. So viele Punkte gibt es,
   und 200 Münzen werden abgezogen - die restlichen 50
   bleiben liegen und zählen beim nächsten Mal mit.

   Zurück kommt die Anzahl Punkte, damit der Aufrufer weiss,
   ob überhaupt etwas passiert ist. */

function muenzenEintauschen() {

  const name = angemeldeterSpieler();

  if (name === null) {
    return 0;
  }

  const habe = muenzenVon(name);
  const belohnung = Math.floor(habe / MUENZEN_PRO_PUNKT);

  if (belohnung === 0) {
    return 0;
  }

  const abzug = belohnung * MUENZEN_PRO_PUNKT;

  // Erst die Münzen weg - lokal und beim Server.
  // Minus, weil sie abgezogen werden.
  localStorage.setItem(SCHLUESSEL_MUENZEN + name, habe - abzug);
  stapelDazu({ muenzen: -abzug });

  // Dann die Punkte dazu. punkteDazu schickt den ganzen
  // Stapel ab - die abgezogenen Münzen reisen also mit.
  punkteDazu(belohnung);

  let wort = " Punkt";
  if (belohnung > 1) {
    wort = " Punkte";
  }

  tafelZeigen("🪙 " + abzug + " Münzen eingetauscht gegen " +
    belohnung + wort + " ⭐", 5000);

  return belohnung;
}

/* --- Punkte bezahlen ---
   Für die Belohnungsspiele. Gibt false zurück, wenn niemand
   angemeldet ist ODER wenn das Geld nicht reicht. */

function punkteAbziehen(anzahl) {

  // Hat man noch Gratis-Rennen übrig? Dann wird eines
  // abgeknipst - wie bei einer Fünferkarte im Hallenbad.
  // true heisst «bezahlt», obwohl gar keine Punkte weg sind.
  if (codeIstFrei() === true) {
    localStorage.setItem(SCHLUESSEL_GRATIS, gratisRennen() - 1);
    leisteZeichnen();
    return true;
  }

  const name = angemeldeterSpieler();

  if (name === null) {
    return false;
  }

  const jetzt = punkteVon(name);

  if (jetzt < anzahl) {
    return false;
  }

  localStorage.setItem(SCHLUESSEL_PUNKTE + name, jetzt - anzahl);

  // Minus statt plus - sonst ist es genau derselbe Weg.
  stapelDazu({ punkte: -anzahl });
  stapelSenden();

  leisteZeichnen();
  return true;
}

/* ============================================
   Gratis-Runden

   Die bleiben absichtlich im Browser und gehen NICHT
   auf den Server. Begründung: eine Gratis-Runde gehört
   zum Computer, an dem man den Code eingetippt hat -
   nicht zum Konto. Sonst könnte man mit einem Code
   auf allen Geräten gleichzeitig gratis spielen.

   Beim Abmelden werden sie trotzdem gelöscht: sie sollen
   nicht an die nächste Person weitervererbt werden.
   Siehe abmelden() weiter oben.
   ============================================ */

function gratisRennen() {
  const wert = localStorage.getItem(SCHLUESSEL_GRATIS);

  if (wert === null) {
    return 0;
  }

  // Im Notizheft steht Text. Number macht daraus eine Zahl.
  return Number(wert);
}

/* --- Ist gerade gratis? ---
   Ein eigener kleiner Befehl, damit man im Rennen nicht
   überall «> 0» schreiben muss. Ein Befehl, eine Aufgabe. */

function codeIstFrei() {
  return gratisRennen() > 0;
}

/* --- Gratis-Runden dazuschreiben ---
   Zwei Stellen brauchen das: der richtige Code auf der Startseite
   und das Ziel in der Dachheldin. Darum ein eigener Befehl -
   sonst müsste man dasselbe zweimal schreiben. */

function gratisRundenDazu(anzahl) {
  localStorage.setItem(SCHLUESSEL_GRATIS, gratisRennen() + anzahl);
  leisteZeichnen();
}

/* --- Der Code wurde eingegeben ---
   Wird vom OK-Knopf unten in der Ecke der Startseite gerufen.
   Stimmt er, gibt es fünf Gratis-Rennen dazu. Jeder Start
   knipst dann eines davon ab. */

function codePruefen() {

  const feld = document.getElementById("codefeld");
  const meldung = document.getElementById("codemeldung");

  // trim schneidet Leerschläge weg. toLowerCase macht aus
  // «Hallo» ein «hallo» - bei Zahlen ändert es nichts, aber wenn
  // du den PIN mal in ein Wort änderst, ist GROSS/klein dann egal.
  const eingabe = feld.value.trim().toLowerCase();

  // Beide Farben zuerst wegnehmen, sonst bleibt die alte kleben.
  meldung.classList.remove("stimmt");
  meldung.classList.remove("falsch");

  if (eingabe !== PIN) {
    meldung.innerHTML = "Falscher Code.";
    meldung.classList.add("falsch");
    return;
  }

  // Der Code stimmt: Runden UND Punkte dazuschreiben.
  // Erst dazuschreiben, dann anzeigen - sonst wären die
  // Zahlen noch die alten.
  gratisRundenDazu(GRATIS_PRO_CODE);

  // punkteDazu sagt selber, ob es geklappt hat. Ohne
  // Anmeldung gibt es keine Punkte - dann bleiben
  // wenigstens die Gratis-Runden.
  const punkteKamen = punkteDazu(PUNKTE_PRO_CODE);

  let text = "Stimmt! Du hast " + gratisRennen() + " Gratis-Runden.";

  if (punkteKamen === true) {
    text = text + "<br>Und " + PUNKTE_PRO_CODE +
      punkteWort(PUNKTE_PRO_CODE) + " dazu!";
  }

  meldung.innerHTML = text;
  meldung.classList.add("stimmt");

  feld.value = "";
  leisteZeichnen();
}

/* ============================================
   Bestleistung pro Spiel
   Wird auch für Leute ohne Anmeldung gespeichert,
   dann unter dem Namen «Gast» - der bleibt dann
   aber nur auf diesem Computer.
   ============================================ */

function rekordVon(spiel) {
  let name = angemeldeterSpieler();
  if (name === null) {
    name = "Gast";
  }

  const wert = localStorage.getItem("lernwelt-rekord-" + spiel + "-" + name);
  if (wert === null) {
    return 0;
  }
  return Number(wert);
}

function rekordSpeichern(spiel, wert) {
  let name = angemeldeterSpieler();
  if (name === null) {
    name = "Gast";
  }

  // Nur speichern, wenn es wirklich besser ist.
  if (wert > rekordVon(spiel)) {
    localStorage.setItem("lernwelt-rekord-" + spiel + "-" + name, wert);

    // Angemeldeten Leuten reisen die Rekorde mit auf jeden Computer.
    if (angemeldeterSpieler() !== null) {
      const nachricht = {};
      nachricht[spiel] = wert;

      stapelDazu({ rekorde: nachricht });
      stapelSenden();
    }

    return true;
  }
  return false;
}

/* ============================================
   Die Leiste ganz oben
   ============================================ */

/* --- «1 Punkt» oder «2 Punkte»? ---
   Das Wort muss zur Zahl passen. Weil das an vielen Stellen
   gebraucht wird, steht es hier einmal statt überall neu. */

function punkteWort(anzahl) {

  if (anzahl === 1) {
    return " Punkt";
  }
  return " Punkte";
}

/* --- Eine Tafel kurz einblenden ---
   Für Nachrichten, die man nicht übersehen soll: «Platz 1!»
   oder «100 Münzen sind einen Punkt wert». Sie erscheint oben
   in der Mitte und verschwindet nach ein paar Sekunden von selbst.

   Alle Tafeln kommen in denselben Behälter. Der stellt sie
   untereinander - sonst würden zwei gleichzeitige Tafeln
   genau übereinander liegen und man könnte keine lesen. */

function tafelZeigen(text, wielange) {

  let behaelter = document.getElementById("tafeln");

  // Beim ersten Mal gibt es den Behälter noch nicht.
  if (behaelter === null) {
    behaelter = document.createElement("div");
    behaelter.id = "tafeln";
    document.body.insertAdjacentElement("beforeend", behaelter);
  }

  const tafel = document.createElement("div");
  tafel.className = "tafel";
  tafel.innerHTML = textSichern(text);

  behaelter.insertAdjacentElement("beforeend", tafel);

  // Wieder wegräumen. Ohne das würden sich die Tafeln
  // stapeln, bis die Seite neu geladen wird.
  setTimeout(function () {
    tafel.remove();
  }, wielange);
}

/* Schreibt einen Satz unten in die Leiste.
   art ist "stimmt" (grün), "falsch" (rot) oder "" (grau). */

function meldungZeigen(text, art) {

  const meldung = document.getElementById("leistenmeldung");

  if (meldung === null) {
    return;
  }

  meldung.innerHTML = textSichern(text);
  meldung.className = "leiste-meldung " + art;
}

/* --- Am <body> anschreiben, ob jemand angemeldet ist ---

   Warum am body und nicht bei jedem Kasten einzeln?
   Weil dann das CSS die ganze Arbeit macht. Im CSS steht dann
   zum Beispiel:

     body.nicht-angemeldet #spielbereich { display: none; }

   «Blende den Spielbereich weg, solange am body
   nicht-angemeldet steht.» Ein einziger Handgriff hier oben
   schaltet so die ganze Seite um - und wir brauchen keine
   eigene JavaScript-Datei für die Startseite.

   classList.toggle(name, ja) heisst: setz die Klasse, wenn ja
   true ist, und nimm sie weg, wenn ja false ist. */

function anmeldeStatusZeigen() {

  const drin = angemeldeterSpieler() !== null;

  document.body.classList.toggle("angemeldet", drin);
  document.body.classList.toggle("nicht-angemeldet", drin === false);
}

function leisteZeichnen() {

  const leiste = document.getElementById("spielerleiste");
  const name = angemeldeterSpieler();

  // Bei jedem Neuzeichnen kann sich der Anmeldestand geändert
  // haben - darum steht das hier und nicht an fünf Stellen.
  anmeldeStatusZeigen();

  // Ein Schildchen mit den übrigen Gratis-Rennen.
  // Sind keine übrig, bleibt der Text leer - dann sieht man nichts.
  let freiMarke = "";
  if (codeIstFrei() === true) {
    freiMarke = '<span class="frei-marke">&#128275; ' + gratisRennen() +
      ' Rennen gratis</span>';
  }

  if (name === null) {

    // Niemand angemeldet: Name und Passwort zeigen.
    // Die Beschriftung hängt am Merkzettel leistenModus.
    let frage = "Wer spielt?";
    let grosserKnopf = "Anmelden";
    let kleinerKnopf = "Neu hier?";
    let passwortArt = "current-password";

    if (leistenModus === "registrieren") {
      frage = "Neues Konto";
      grosserKnopf = "Registrieren";
      kleinerKnopf = "Zurück";

      // new-password sagt dem Browser: hier wird eines
      // ausgedacht, nicht ein altes eingesetzt.
      passwortArt = "new-password";
    }

    leiste.innerHTML =
      '<span class="leiste-text">' + frage + '</span>' +
      '<input id="namensfeld" type="text" placeholder="Dein Name" ' +
      'maxlength="20" autocomplete="username">' +
      '<input id="passwortfeld" type="password" placeholder="Passwort" ' +
      'maxlength="40" autocomplete="' + passwortArt + '">' +
      '<button class="leiste-knopf" onclick="hauptknopfDruecken()">' +
      grosserKnopf + '</button>' +
      '<button class="leiste-knopf leiste-zweit" onclick="modusWechseln()">' +
      kleinerKnopf + '</button>' +
      freiMarke +
      '<p class="leiste-meldung" id="leistenmeldung"></p>';

    // Die Enter-Taste macht dasselbe wie der grosse Knopf.
    const enterHorcher = function (taste) {
      if (taste.key === "Enter") {
        hauptknopfDruecken();
      }
    };

    document.getElementById("namensfeld").onkeydown = enterHorcher;
    document.getElementById("passwortfeld").onkeydown = enterHorcher;

  } else {

    const punktzahl = punkteVon(name);

    // «1 Punkt» aber «2 Punkte» - das Wort muss passen.
    let wort = " Punkte";
    if (punktzahl === 1) {
      wort = " Punkt";
    }

    leiste.innerHTML =
      '<span class="leiste-text">Hallo <strong>' + textSichern(name) +
      '</strong>!</span>' +
      '<span class="punkte-marke">&#11088; ' + punktzahl + wort + '</span>' +
      '<span class="muenzen-marke">&#129689; ' + muenzenVon(name) + '</span>' +
      freiMarke +
      '<button class="leiste-knopf" onclick="abmelden()">Abmelden</button>' +
      '<p class="leiste-meldung" id="leistenmeldung"></p>';
  }
}

/* Die spitzen Klammern nehme ich raus, weil der Browser
   die als HTML lesen würde und die Seite kaputtginge. */

function textSichern(text) {
  return String(text).replace(/[<>&]/g, "");
}

/* --- Die Leiste in die Seite einbauen ---
   Sie steht in keiner einzigen HTML-Datei. Sie wird hier
   hergestellt und ganz oben eingesetzt - so ist sie
   automatisch auf jeder Seite gleich. */

function leisteEinbauen() {
  const leiste = document.createElement("div");
  leiste.id = "spielerleiste";
  document.body.insertAdjacentElement("afterbegin", leiste);
  leisteZeichnen();
}

/* --- Beim Laden der Seite beim Server nachfragen ---
   Vielleicht hat man am anderen Computer gespielt. Dann
   stimmt die Abschrift nicht mehr und wird hier berichtigt.

   Läuft im Hintergrund: die Seite ist sofort da, die Zahlen
   springen einen Wimpernschlag später auf den richtigen Wert. */

function kontoAuffrischen() {

  if (token() === null) {
    return;
  }

  serverFragen("konto", { token: token() })
    .then(function (daten) {
      kontoUebernehmen(daten);
      leisteZeichnen();

      // Erst jetzt nachreichen, was liegen geblieben ist.
      stapelSenden();

      // Hat man am anderen Computer Münzen gesammelt, sind
      // vielleicht 100 beisammen. Dann jetzt eintauschen.
      muenzenEintauschen();
    })
    .catch(function (fehler) {

      // Ist der Ausweis abgelaufen, muss man sich neu anmelden.
      // Bei einem Internet-Problem lassen wir ihn stehen.
      if (fehler.message.indexOf("neu anmelden") >= 0) {
        localStorage.removeItem(SCHLUESSEL_TOKEN);
        leisteZeichnen();
      }
    });
}

/* --- Los geht's --- */

leisteEinbauen();
kontoAuffrischen();

/* Auch die Enter-Taste soll den Code prüfen.
   Das Feld gibt es nur auf der Startseite. Darum zuerst
   nachschauen, ob es überhaupt da ist - sonst gäbe es auf
   allen anderen Seiten eine Fehlermeldung. */

const codefeld = document.getElementById("codefeld");

if (codefeld !== null) {
  codefeld.onkeydown = function (taste) {
    if (taste.key === "Enter") {
      codePruefen();
    }
  };
}
