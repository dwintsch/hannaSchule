/* ============================================
   Die Befehle vom Galgenmännchen
   ============================================ */

/* --- Die Wörter ---
   Willst du ein Wort ändern? Nur hier, sonst nirgends.
   Regeln: GROSSBUCHSTABEN, keine Umlaute, keine Leerschläge. */

const woerter = [

  // Deine Wörter
  "INFUSION",
  "KATHETER",
  "VITALZEICHEN",
  "BLUTDRUCK",
  "HYGIENE",
  "MEDIKAMENT",
  "VERBAND",
  "DIAGNOSE",
  "NACHTDIENST",
  "SPITAL",
  "OPERATION",

  // Körper
  "HERZ",
  "LUNGE",
  "NIERE",
  "LEBER",
  "MAGEN",
  "DARM",
  "BLASE",
  "GEHIRN",
  "KNOCHEN",
  "MUSKEL",
  "GELENK",
  "SKELETT",
  "ARTERIE",
  "VENE",
  "ATMUNG",
  "PULS",

  // Pflege und Spital
  "PFLEGE",
  "STATION",
  "VISITE",
  "RAPPORT",
  "SCHICHT",
  "NOTFALL",
  "AMBULANZ",
  "CHIRURGIE",
  "GERIATRIE",
  "THERAPIE",
  "BETTRUHE",
  "ROLLSTUHL",

  // Material und Behandlung
  "SPRITZE",
  "TABLETTE",
  "PFLASTER",
  "WUNDE",
  "STERIL",
  "DESINFEKTION",
  "IMPFUNG",
  "REZEPT",
  "SAUERSTOFF",
  "BLUTZUCKER",
  "TEMPERATUR",
  "FIEBER",
  "INFEKTION",
  "ALLERGIE",
  "GESUNDHEIT",
  "KRANKHEIT"
];

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const maxFehler = 9;

/* --- Die Schubladen (Variablen) --- */

// Ein zufälliges Wort aussuchen.
// Math.random() gibt eine Zahl zwischen 0 und 1,
// mal die Anzahl Wörter ergibt eine zufällige Stelle in der Liste.
const wort = woerter[Math.floor(Math.random() * woerter.length)];

let geraten = [];        // welche Buchstaben schon geklickt wurden
let fehler = 0;          // wie viele davon falsch waren
let spielLaeuft = true;  // ist das Spiel noch am Laufen?

/* --- Anzeige oben --- */

function zeigeFehler() {
  document.getElementById("fehler").innerHTML =
    "Fehler: " + fehler + " von " + maxFehler;
}

/* --- Das Wort anzeigen ---
   Für jeden Buchstaben ein Kästchen mit Strich darunter.
   Schon geraten? Dann steht der Buchstabe da, sonst nichts. */

function zeigeWort() {

  let inhalt = "";

  for (let i = 0; i < wort.length; i++) {

    const buchstabe = wort[i];

    if (geraten.includes(buchstabe) === true) {
      inhalt = inhalt + '<span class="platz">' + buchstabe + '</span>';
    } else {
      inhalt = inhalt + '<span class="platz">&nbsp;</span>';
    }
  }

  document.getElementById("wort").innerHTML = inhalt;
}

/* --- Die 26 Knöpfe herstellen --- */

function buchstabenAufbauen() {

  const kasten = document.getElementById("buchstaben");

  for (let i = 0; i < alphabet.length; i++) {

    const buchstabe = alphabet[i];

    const knopf = document.createElement("button");
    knopf.className = "buchstabe";
    knopf.innerHTML = buchstabe;

    knopf.onclick = function () {
      rate(buchstabe, knopf);
    };

    kasten.appendChild(knopf);
  }
}

/* --- Ein Buchstabe wurde angeklickt --- */

function rate(buchstabe, knopf) {

  if (spielLaeuft === false) {
    return;
  }

  // Buchstabe merken und Knopf sperren
  geraten.push(buchstabe);
  knopf.disabled = true;

  if (wort.includes(buchstabe) === true) {

    // Treffer!
    knopf.classList.add("richtig");
    zeigeWort();
    pruefeGewonnen();

  } else {

    // Daneben - ein Körperteil mehr
    knopf.classList.add("falsch");
    fehler = fehler + 1;
    zeigeFehler();
    zeichneMaennchen();
    pruefeVerloren();
  }
}

/* --- Das Männchen zeichnen ---
   Bei 1 Fehler ist Teil 1 da, bei 2 Fehlern Teil 1 und 2, und so weiter. */

function zeichneMaennchen() {
  for (let i = 1; i <= maxFehler; i++) {
    if (fehler >= i) {
      document.getElementById("teil" + i).style.display = "block";
    }
  }
}

/* --- Sind alle Buchstaben gefunden? --- */

function pruefeGewonnen() {

  for (let i = 0; i < wort.length; i++) {
    // Fehlt noch ein Buchstabe? Dann ist es nicht vorbei.
    if (geraten.includes(wort[i]) === false) {
      return;
    }
  }

  spielLaeuft = false;
  knoepfeSperren();

  // Zwei Punkte fürs Konto - Hangman ist das schwerste Spiel.
  // punkteDazu gibt false zurück, wenn niemand angemeldet ist.
  // Der Befehl steht in js/punkte.js.
  let extra = "";

  if (punkteDazu(2) === true) {
    extra = "<br>&#11088; +2 Punkte für dein Konto!";
  } else {
    extra = "<br><small>Melde dich oben an, dann sammelst du Punkte.</small>";
  }

  const ende = document.getElementById("ende");
  ende.innerHTML = "Gewonnen! Das Wort war <br>" + wort +
    "<br>Fehler: " + fehler + " von " + maxFehler + extra;
  ende.classList.add("gewonnen");

  // Konfetti! 120 Schnipsel, 10 Sekunden lang - gleich wie
  // beim Quiz und beim Memory. Der Befehl selber steht
  // in js/konfetti.js.
  konfetti(120, 10000);
}

/* --- Sind alle Fehler aufgebraucht? --- */

function pruefeVerloren() {

  if (fehler < maxFehler) {
    return;
  }

  spielLaeuft = false;
  knoepfeSperren();

  // Das ganze Wort aufdecken, damit man es sieht.
  let inhalt = "";
  for (let i = 0; i < wort.length; i++) {
    inhalt = inhalt + '<span class="platz verpasst">' + wort[i] + '</span>';
  }
  document.getElementById("wort").innerHTML = inhalt;

  const ende = document.getElementById("ende");
  ende.innerHTML = "Leider verloren.<br>Das Wort war " + wort + ".";
  ende.classList.add("verloren");
}

/* --- Am Schluss alle Knöpfe sperren --- */

function knoepfeSperren() {
  const knoepfe = document.querySelectorAll(".buchstabe");
  for (let i = 0; i < knoepfe.length; i++) {
    knoepfe[i].disabled = true;
  }
}

/* --- Los geht's --- */

buchstabenAufbauen();
zeigeWort();
zeigeFehler();
