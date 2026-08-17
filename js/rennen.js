/* ============================================
   Das Rennen - ein Belohnungsspiel
   Bezahlt wird mit den Punkten aus den Lernspielen.
   ============================================ */

/* --- Einstellungen. Hier darfst du drehen. --- */

const kosten = 2;          // Punkte pro Runde
const spurBreite = 100;    // eine Spur ist 100 Pixel breit
const startTempo = 4;      // Pixel pro Takt am Anfang
const taktLaenge = 20;     // Millisekunden pro Takt

// Wo das Auto steht (von oben gemessen)
const autoOben = 350;
const autoUnten = 400;

/* --- Die Schubladen --- */

let laeuft = false;      // fährt gerade jemand?
let schutz = false;      // hat man einen Schutzschild?
let spur = 1;            // 0 = links, 1 = mitte, 2 = rechts
let strecke = 0;         // die Punktzahl im Spiel
let tempo = startTempo;
let versatz = 0;         // wie weit die Strasse verschoben ist
let dinger = [];         // alle Hindernisse und Sterne
let uhr = null;          // der Takt
let seitLetztem = 0;     // Takte seit dem letzten Hindernis
let dingeOhneStern = 0;  // wie viele Hindernisse ohne Stern kamen

const feld = document.getElementById("rennen");
const strasse = document.getElementById("strasse");
const auto = document.getElementById("auto");
const tafel = document.getElementById("tafel");

/* --- Anzeige oben --- */

function zeigeAnzeige() {

  // Der Schild wird nur angezeigt, wenn man einen hat.
  let schild = "";
  if (schutz === true) {
    schild = " &nbsp;·&nbsp; &#128737; Schutz";
  }

  document.getElementById("anzeige").innerHTML =
    "Strecke: " + strecke +
    " &nbsp;·&nbsp; Rekord: " + rekordVon("rennen") + schild;
}

/* --- Die Tafel vor dem Start --- */

function zeigeStarttafel() {

  const name = angemeldeterSpieler();

  if (name === null) {
    tafel.innerHTML =
      "<div><strong>Erst anmelden</strong></div>" +
      "<div>Melde dich oben an, dann kannst du mit deinen Punkten " +
      "ein Rennen bezahlen.</div>" +
      '<button class="tafelknopf" disabled>Rennen starten</button>';
    return;
  }

  if (punkteVon(name) < kosten) {
    tafel.innerHTML =
      "<div><strong>Zu wenig Punkte</strong></div>" +
      "<div>Ein Rennen kostet " + kosten + " Punkte. Du hast " +
      punkteVon(name) + ".<br>Spiel ein Quiz, ein Memory oder Hangman!</div>" +
      '<button class="tafelknopf" disabled>Rennen starten</button>';
    return;
  }

  tafel.innerHTML =
    "<div><strong>Bereit?</strong></div>" +
    "<div>Fahr um die Hindernisse &#128679; herum." +
    "<br>Ein Stern &#11088; gibt dir einen Schutzschild." +
    "<br>Ein Rennen kostet " + kosten + " Punkte.</div>" +
    '<button class="tafelknopf" onclick="starten()">Rennen starten</button>';
}

/* --- Losrennen --- */

function starten() {

  // Den Knopf «loslassen». Ein angeklickter Knopf behält
  // sonst den Fokus - und mit Enter würde man ihn immer
  // wieder drücken, ohne die Maus zu benutzen.
  if (document.activeElement !== null) {
    document.activeElement.blur();
  }

  // Läuft schon ein Rennen? Dann nichts machen.
  // Sonst könnte man mit der Enter-Taste mitten im Rennen
  // nochmal starten - dann liefen zwei Uhren gleichzeitig.
  if (laeuft === true) {
    return;
  }

  // Sicherheitshalber eine alte Uhr abstellen, falls noch
  // eine läuft. clearInterval mit null stört nicht.
  clearInterval(uhr);

  // Erst bezahlen. Klappt das nicht, geht es nicht los.
  if (punkteAbziehen(kosten) === false) {
    zeigeStarttafel();
    return;
  }

  // Alles zurücksetzen
  aufraeumenFeld();
  laeuft = true;
  schutz = false;
  spur = 1;
  strecke = 0;
  tempo = startTempo;
  versatz = 0;
  seitLetztem = 0;
  dingeOhneStern = 0;

  auto.style.left = spur * spurBreite + "px";
  auto.innerHTML = "&#128663;";      // Auto
  auto.classList.remove("geschuetzt");
  tafel.classList.add("weg");

  zeigeAnzeige();

  // setInterval heisst: mach das immer wieder, alle 20 Millisekunden.
  // Anders als setTimeout, das nur einmal wartet.
  uhr = setInterval(takt, taktLaenge);
}

/* --- Ein Takt: das Herz vom Spiel ---
   Wird 50 Mal pro Sekunde ausgeführt. Jedes Mal rückt
   alles ein kleines Stück - das ergibt die Bewegung. */

function takt() {

  strecke = strecke + 1;

  // Alle 300 Takte wird es ein bisschen schneller.
  tempo = startTempo + strecke / 300;

  // Die Strasse nach unten schieben
  versatz = versatz + tempo;
  strasse.style.backgroundPosition =
    "97px " + versatz + "px, 197px " + versatz + "px";

  hindernisseBewegen();
  vielleichtNeuesHindernis();

  zeigeAnzeige();
}

/* --- Alle Hindernisse und Sterne bewegen --- */

function hindernisseBewegen() {

  // Von hinten durchgehen! Wer vorne etwas aus der Liste
  // entfernt, verschiebt alle dahinter - dann würde man
  // eines überspringen.
  for (let i = dinger.length - 1; i >= 0; i--) {

    const ding = dinger[i];

    ding.y = ding.y + tempo;
    ding.element.style.top = ding.y + "px";

    // Berühren sich Auto und Ding?
    const trifftSpur = ding.spur === spur;
    const trifftHoehe = ding.y + 44 > autoOben && ding.y < autoUnten;

    if (trifftSpur === true && trifftHoehe === true) {

      if (ding.art === "stern") {

        // Ein Stern gibt einen Schutzschild.
        // Hat man schon einen, gibt es stattdessen Strecke -
        // so ist der Stern nie umsonst.
        if (schutz === false) {
          schutz = true;
          auto.classList.add("geschuetzt");
        } else {
          strecke = strecke + 50;
        }

        wegnehmen(i);

      } else {

        if (schutz === true) {

          // Der Schild wird verbraucht: einmal durchfahren.
          schutz = false;
          auto.classList.remove("geschuetzt");
          wegnehmen(i);

        } else {
          verloren();
          return;
        }
      }
    }

    // Unten hinausgerutscht? Dann wegräumen.
    if (ding.y > 430) {
      wegnehmen(i);
    }
  }
}

/* --- Ein Ding aus dem Spiel nehmen --- */

function wegnehmen(i) {
  dinger[i].element.remove();
  dinger.splice(i, 1);   // splice schneidet aus der Liste heraus
}

/* --- Vielleicht ein neues Hindernis oben hineinsetzen --- */

function vielleichtNeuesHindernis() {

  seitLetztem = seitLetztem + 1;

  // Je schneller es geht, desto kürzer der Abstand -
  // aber nie unter 22 Takte, sonst wäre es unfair.
  let abstand = Math.round(90 / tempo * 2);
  if (abstand < 22) {
    abstand = 22;
  }

  if (seitLetztem < abstand) {
    return;
  }

  seitLetztem = 0;

  // Etwa jedes vierte Ding ist ein Stern statt eines Hindernisses.
  // 0.25 heisst 25 Prozent. Grössere Zahl = mehr Sterne.
  //
  // Dazu eine Garantie: Sind vier Hindernisse ohne Stern
  // gekommen, gibt es sicher einen. Sonst kann man bei Pech
  // ein ganzes Rennen ohne Stern fahren - und genau das ist
  // beim Testen passiert.
  let art = "hindernis";
  let bild = "&#128679;";          // Baustelle

  if (Math.random() < 0.25 || dingeOhneStern >= 4) {
    art = "stern";
    bild = "&#11088;";             // Stern
    dingeOhneStern = 0;
  } else {
    dingeOhneStern = dingeOhneStern + 1;
  }

  const neueSpur = Math.floor(Math.random() * 3);

  const element = document.createElement("div");
  element.className = "ding";
  element.innerHTML = bild;
  element.style.left = neueSpur * spurBreite + "px";
  element.style.top = "-50px";
  feld.appendChild(element);

  dinger.push({ element: element, spur: neueSpur, y: -50, art: art });
}

/* --- Steuern --- */

function nachLinks() {
  if (laeuft === false) {
    return;
  }
  if (spur > 0) {
    spur = spur - 1;
    auto.style.left = spur * spurBreite + "px";
  }
}

function nachRechts() {
  if (laeuft === false) {
    return;
  }
  if (spur < 2) {
    spur = spur + 1;
    auto.style.left = spur * spurBreite + "px";
  }
}

// Die Pfeiltasten auf der Tastatur
document.onkeydown = function (taste) {

  if (taste.key === "ArrowLeft") {
    taste.preventDefault();   // die Seite soll nicht scrollen
    nachLinks();
  }

  if (taste.key === "ArrowRight") {
    taste.preventDefault();
    nachRechts();
  }
};

/* --- Verloren --- */

function verloren() {

  laeuft = false;
  clearInterval(uhr);        // den Takt abstellen

  auto.innerHTML = "&#128165;";      // Zusammenstoss

  const istRekord = rekordSpeichern("rennen", strecke);

  let zusatz = "";
  if (istRekord === true) {
    zusatz = "<br>Neuer Rekord!";
  }

  let knopf = '<button class="tafelknopf" onclick="starten()">' +
              "Nochmal (" + kosten + " Punkte)</button>";

  const name = angemeldeterSpieler();
  if (name === null || punkteVon(name) < kosten) {
    knopf = '<button class="tafelknopf" disabled>Zu wenig Punkte</button>' ;
  }

  tafel.innerHTML =
    "<div><strong>Erwischt!</strong></div>" +
    "<div>Strecke: " + strecke + zusatz +
    "<br>Rekord: " + rekordVon("rennen") + "</div>" +
    knopf;

  tafel.classList.remove("weg");

  zeigeAnzeige();
}

/* --- Spielfeld leer machen --- */

function aufraeumenFeld() {
  for (let i = 0; i < dinger.length; i++) {
    dinger[i].element.remove();
  }
  dinger = [];
}

/* --- Los geht's --- */

zeigeAnzeige();
zeigeStarttafel();
