/* ============================================
   Anmelden und Punkte sammeln
   Wird von ALLEN Seiten gebraucht - darum eine
   eigene Datei, genau wie konfetti.js.

   Gespeichert wird im localStorage. Das ist ein kleines
   Notizheft, das der Browser für diese Seite führt.
   Es bleibt erhalten, auch wenn man den Browser schliesst
   oder den Computer ausschaltet.

   ACHTUNG: Das Notizheft gehört zu DIESEM Browser auf
   DIESEM Computer. Auf einem anderen Gerät fängt man
   wieder bei null an. Für ein echtes Konto überall
   bräuchte es einen Server.
   ============================================ */

/* Unter diesen Namen wird gespeichert. */
const SCHLUESSEL_SPIELER = "lernwelt-spieler";
const SCHLUESSEL_PUNKTE = "lernwelt-punkte-";
const SCHLUESSEL_MUENZEN = "lernwelt-muenzen-";
const SCHLUESSEL_GRATIS = "lernwelt-gratis-rennen";

/* --- Der Code ---
   HIER darfst du den PIN ändern - und nur hier.
   Es dürfen auch Buchstaben sein. Dann bitte klein schreiben:
   die Eingabe wird sowieso in Kleinbuchstaben umgewandelt,
   damit GROSS oder klein keine Rolle spielt. */

const PIN = "8590";

/* Wie viele Gratis-Rennen ein Code freischaltet.
   Hier darfst du drehen: 3, 10 - was du willst. */

const GRATIS_PRO_CODE = 5;

/* --- Wer ist gerade angemeldet? ---
   Gibt den Namen zurück, oder null wenn niemand da ist. */

function angemeldeterSpieler() {
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

/* --- Anmelden --- */

function anmelden() {

  const feld = document.getElementById("namensfeld");

  // trim schneidet Leerschläge am Anfang und Ende weg.
  // Die spitzen Klammern nehme ich raus, weil der Browser
  // die als HTML lesen würde und die Seite kaputtginge.
  const name = feld.value.trim().replace(/[<>]/g, "");

  if (name === "") {
    feld.focus();
    return;
  }

  localStorage.setItem(SCHLUESSEL_SPIELER, name);
  leisteZeichnen();
}

/* --- Abmelden ---
   Löscht nur, WER angemeldet ist. Die Punkte bleiben
   gespeichert und sind beim nächsten Anmelden wieder da. */

function abmelden() {
  localStorage.removeItem(SCHLUESSEL_SPIELER);
  leisteZeichnen();
}

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

  leisteZeichnen();
  return true;
}

/* --- Die Münzen ---
   Münzen sind etwas anderes als Punkte!

   Punkte verdient man in den Lernspielen und bezahlt damit die
   Belohnungsspiele. Münzen sammelt man IM Belohnungsspiel ein.
   Sie werden nur gezählt - man kann nichts damit kaufen.
   Darum haben sie ihre eigene Schublade im Notizheft. */

function muenzenVon(name) {
  const wert = localStorage.getItem(SCHLUESSEL_MUENZEN + name);

  if (wert === null) {
    return 0;
  }

  return Number(wert);
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

  leisteZeichnen();
  return true;
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

  leisteZeichnen();
  return true;
}

/* --- Wie viele Gratis-Rennen sind noch übrig? ---
   Steht im localStorage, genau wie die Punkte. Darum gilt die
   Fünferkarte noch, wenn du von der Startseite ins Rennen gehst. */

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
   sonst müsste man dasselbe zweimal schreiben.

   Braucht keine Anmeldung: die Gratis-Runden gehören nicht zu
   einem Namen, sondern zum Browser. */

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

  // Der Code stimmt: fünf Runden dazuschreiben.
  // Erst dazuschreiben, dann anzeigen - sonst wäre die Zahl noch alt.
  gratisRundenDazu(GRATIS_PRO_CODE);

  meldung.innerHTML = "Stimmt! Du hast " + gratisRennen() +
    " Gratis-Runden.";
  meldung.classList.add("stimmt");

  feld.value = "";
  leisteZeichnen();
}

/* --- Bestleistung pro Spiel ---
   Wird auch für Leute ohne Anmeldung gespeichert,
   dann unter dem Namen «Gast». */

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
    return true;
  }
  return false;
}

/* --- Die Leiste ganz oben zeichnen --- */

function leisteZeichnen() {

  const leiste = document.getElementById("spielerleiste");
  const name = angemeldeterSpieler();

  // Ein Schildchen mit den übrigen Gratis-Rennen.
  // Sind keine übrig, bleibt der Text leer - dann sieht man nichts.
  let freiMarke = "";
  if (codeIstFrei() === true) {
    freiMarke = '<span class="frei-marke">&#128275; ' + gratisRennen() +
      ' Rennen gratis</span>';
  }

  if (name === null) {

    // Niemand angemeldet: Namensfeld zeigen
    leiste.innerHTML =
      '<span class="leiste-text">Wer spielt?</span>' +
      '<input id="namensfeld" type="text" placeholder="Dein Name" maxlength="20">' +
      '<button class="leiste-knopf" onclick="anmelden()">Anmelden</button>' +
      freiMarke;

    // Auch die Enter-Taste soll anmelden.
    document.getElementById("namensfeld").onkeydown = function (taste) {
      if (taste.key === "Enter") {
        anmelden();
      }
    };

  } else {

    const punktzahl = punkteVon(name);

    // «1 Punkt» aber «2 Punkte» - das Wort muss passen.
    let wort = " Punkte";
    if (punktzahl === 1) {
      wort = " Punkt";
    }

    leiste.innerHTML =
      '<span class="leiste-text">Hallo <strong>' + name + '</strong>!</span>' +
      '<span class="punkte-marke">&#11088; ' + punktzahl + wort + '</span>' +
      '<span class="muenzen-marke">&#129689; ' + muenzenVon(name) + '</span>' +
      freiMarke +
      '<button class="leiste-knopf" onclick="abmelden()">Abmelden</button>';
  }
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

/* --- Los geht's --- */

leisteEinbauen();

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
