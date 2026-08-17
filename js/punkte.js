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

/* --- Punkte bezahlen ---
   Für die Belohnungsspiele. Gibt false zurück, wenn niemand
   angemeldet ist ODER wenn das Geld nicht reicht. */

function punkteAbziehen(anzahl) {

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

  if (name === null) {

    // Niemand angemeldet: Namensfeld zeigen
    leiste.innerHTML =
      '<span class="leiste-text">Wer spielt?</span>' +
      '<input id="namensfeld" type="text" placeholder="Dein Name" maxlength="20">' +
      '<button class="leiste-knopf" onclick="anmelden()">Anmelden</button>';

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
