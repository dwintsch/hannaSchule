/* ============================================
   Die Befehle vom Abkürzungs-Memory
   ============================================ */

/* --- Die Paare ---
   Willst du ein Paar ändern? Nur hier, sonst nirgends.
   kurz = die Abkürzung, lang = das ausgeschriebene Wort. */

const paare = [
  { kurz: "Pat.",  lang: "Patient" },
  { kurz: "ss",    lang: "selbstständig" },
  { kurz: "tgl.",  lang: "täglich" },
  { kurz: "Temp.", lang: "Temperatur" },
  { kurz: "KP",    lang: "Körperpflege" },
  { kurz: "Vz",    lang: "Vitalzeichen" },
  { kurz: "Med.",  lang: "Medikamente" },
  { kurz: "BD",    lang: "Blutdruck" }
];

/* --- Die Schubladen (Variablen) --- */

let ersteKarte = null;    // erste angeklickte Karte
let zweiteKarte = null;   // zweite angeklickte Karte
let blockiert = false;    // sperrt das Klicken, solange verglichen wird
let versuche = 0;         // wie oft man zwei Karten gedreht hat
let gefundenePaare = 0;   // wie viele Paare schon draussen sind
let anzeigeUhr = null;    // merkt sich, wann das Paar verschwinden soll
let liegendesPaar = [];   // die zwei Karten, die gerade oben liegen

/* --- Die Karten mischen ---
   Geht von hinten durch den Stapel und tauscht jede Karte
   mit einer zufälligen anderen. So liegen sie jedes Mal anders. */

function mischen(liste) {
  for (let i = liste.length - 1; i > 0; i--) {
    const zufall = Math.floor(Math.random() * (i + 1));
    const merker = liste[i];
    liste[i] = liste[zufall];
    liste[zufall] = merker;
  }
}

/* --- Die Karten aufs Spielfeld legen --- */

function spielAufbauen() {

  // Aus 8 Paaren werden 16 Karten:
  // pro Paar eine Karte mit der Abkürzung und eine mit dem Wort.
  const karten = [];

  for (let i = 0; i < paare.length; i++) {
    karten.push({ text: paare[i].kurz, paar: i });
    karten.push({ text: paare[i].lang, paar: i });
  }

  mischen(karten);

  const spielfeld = document.getElementById("spielfeld");

  for (let i = 0; i < karten.length; i++) {

    // Einen neuen Knopf herstellen
    const knopf = document.createElement("button");
    knopf.className = "karte";

    // Merkzettel an der Karte: zu welchem Paar gehört sie?
    knopf.dataset.paar = karten[i].paar;

    knopf.innerHTML =
      '<span class="karte-innen">' +
        '<span class="rueckseite"></span>' +
        '<span class="vorderseite">' + karten[i].text + '</span>' +
      '</span>';

    knopf.onclick = function () {
      klick(knopf);
    };

    spielfeld.appendChild(knopf);
  }
}

/* --- Anzeige oben --- */

function zeigeVersuche() {
  document.getElementById("versuche").innerHTML =
    "Versuche: " + versuche + " · Paare: " + gefundenePaare + " von " + paare.length;
}

/* --- Klick auf eine Karte --- */

function klick(karte) {

  // Es werden gerade zwei Karten verglichen? Dann warten.
  if (blockiert === true) {
    return;
  }

  // Diese Karte ist schon offen oder schon gelöst? Dann nichts machen.
  if (karte.classList.contains("offen") === true) {
    return;
  }

  karte.classList.add("offen");

  // Erste Karte: nur merken und auf die zweite warten.
  if (ersteKarte === null) {
    ersteKarte = karte;
    return;
  }

  // Zweite Karte: jetzt wird verglichen.
  zweiteKarte = karte;
  versuche = versuche + 1;
  zeigeVersuche();

  blockiert = true;

  if (ersteKarte.dataset.paar === zweiteKarte.dataset.paar) {
    paarGefunden();
  } else {
    paarFalsch();
  }
}

/* --- Richtig: die zwei Karten legen sich nebeneinander --- */

function paarGefunden() {

  const karte1 = ersteKarte;
  const karte2 = zweiteKarte;

  // setTimeout heisst: warte kurz, dann mach das.
  // Die 600 sind Millisekunden, also gut eine halbe Sekunde.
  // So kann man die zweite Karte noch lesen.
  setTimeout(function () {
    karte1.classList.add("geloest");
    karte2.classList.add("geloest");
    zusammenlegen(karte1, karte2);
  }, 600);

  gefundenePaare = gefundenePaare + 1;
  zeigeVersuche();

  aufraeumen(900);

  if (gefundenePaare === paare.length) {
    setTimeout(gewonnen, 3800);
  }
}

/* --- Die zwei Karten zum Landeplatz oben fliegen lassen --- */

function zusammenlegen(karte1, karte2) {

  // Liegt oben noch ein älteres Paar? Sofort wegräumen.
  paarWegraeumen();

  const innen1 = karte1.querySelector(".karte-innen");
  const innen2 = karte2.querySelector(".karte-innen");

  karte1.classList.add("fliegt");
  karte2.classList.add("fliegt");

  // Wo sind die zwei Karten jetzt gerade?
  const start1 = innen1.getBoundingClientRect();
  const start2 = innen2.getBoundingClientRect();

  // Wo ist der leere Landeplatz oben?
  const platz = document.getElementById("paar-anzeige").getBoundingClientRect();

  // Die zwei Zielpunkte ausrechnen: links und rechts von der Mitte.
  const abstand = 18;
  const mitteX = platz.left + platz.width / 2;
  const zielY = platz.top + (platz.height - start1.height) / 2;

  const zielX1 = mitteX - start1.width - abstand / 2;
  const zielX2 = mitteX + abstand / 2;

  // Wie weit muss jede Karte wandern? Ziel minus Start.
  fliegeZu(innen1, zielX1 - start1.left, zielY - start1.top);
  fliegeZu(innen2, zielX2 - start2.left, zielY - start2.top);

  liegendesPaar = [innen1, innen2];

  // Findet man schnell ein zweites Paar, würde die alte Uhr
  // das neue zu früh löschen. Darum vorher abstellen.
  clearTimeout(anzeigeUhr);

  // Nach 2,6 Sekunden verschwinden die beiden.
  anzeigeUhr = setTimeout(paarWegraeumen, 2600);
}

/* --- Eine Karte an ihren Platz schieben ---
   translate verschiebt nur das Bild, nicht den Platz.
   rotateY(180deg) muss dabeistehen, sonst würde sich die
   Karte beim Fliegen wieder zudecken. */

function fliegeZu(innen, x, y) {
  innen.style.transform =
    "translate(" + x + "px, " + y + "px) rotateY(180deg)";
}

/* --- Das liegende Paar ausblenden --- */

function paarWegraeumen() {
  for (let i = 0; i < liegendesPaar.length; i++) {
    liegendesPaar[i].classList.add("verblasst");
  }
  liegendesPaar = [];
}

/* --- Falsch: beide decken sich wieder zu --- */

function paarFalsch() {

  const karte1 = ersteKarte;
  const karte2 = zweiteKarte;

  setTimeout(function () {
    karte1.classList.remove("offen");
    karte2.classList.remove("offen");
  }, 1200);

  aufraeumen(1200);
}

/* --- Nach jedem Vergleich: Schubladen leeren --- */

function aufraeumen(wartezeit) {
  ersteKarte = null;
  zweiteKarte = null;

  // Erst wieder klicken lassen, wenn die Karten fertig sind.
  // Bei einem gefundenen Paar geht das schneller - man muss ja
  // nicht warten, bis sich die Karten wieder zudecken.
  setTimeout(function () {
    blockiert = false;
  }, wartezeit);
}

/* --- Alle Paare gefunden --- */

function gewonnen() {
  let text = "";

  if (versuche <= paare.length + 3) {
    text = "Wahnsinn, so wenige Versuche!";
  } else if (versuche <= paare.length * 2) {
    text = "Gut gemacht!";
  } else {
    text = "Geschafft! Beim nächsten Mal geht es schneller.";
  }

  // Ein Punkt fürs Konto. punkteDazu gibt false zurück,
  // wenn niemand angemeldet ist. Steht in js/punkte.js.
  let extra = "";

  if (punkteDazu(1) === true) {
    extra = "<br>&#11088; +1 Punkt für dein Konto!";
  } else {
    extra = "<br><small>Melde dich oben an, dann sammelst du Punkte.</small>";
  }

  const meldung = document.getElementById("gewonnen");
  meldung.innerHTML = "Alle Paare gefunden!<br>Du hast " + versuche +
    " Versuche gebraucht.<br>" + text + extra;
  meldung.classList.add("gewonnen-karte");

  // Konfetti! 120 Schnipsel, 10 Sekunden lang - gleich wie beim Quiz.
  // Der Befehl selber steht in js/konfetti.js.
  konfetti(120, 10000);
}

/* --- Los geht's --- */

spielAufbauen();
zeigeVersuche();

/* --- Die Leertaste gibt ein neues Spiel ---
   Nur wenn alle Paare gefunden sind - sonst waere ein
   versehentlicher Leerschlag mitten im Spiel aergerlich. */

leertasteStartet(function () {
  if (gefundenePaare === paare.length) {
    location.reload();
  }
});
