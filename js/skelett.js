/* ============================================
   Das Skelett
   Knochen antippen und ihren Namen lernen.

   Jeder Knochen in skelett.html traegt
   data-knochen="..." - dieselbe Nummer wie hier in
   der Liste. Knochen, die es zweimal gibt (links und
   rechts), tragen denselben Namen. Darum leuchten
   beim Antippen immer beide auf.
   ============================================ */

/* Die Knochenliste steht in js/knochenliste.js - sie wird auch
   von den Latein-Paaren gebraucht. Diese Datei wird in
   skelett.html VOR dieser hier geladen. */

/* --- Einstellungen. Hier darfst du drehen. --- */

const belohnung = 1;     // Punkte fuer eine geschaffte Runde
const testFragen = 10;   // so viele Fragen hat eine Testrunde
const pause = 900;       // Millisekunden, bevor die naechste Frage kommt

/* --- Die Schubladen ---

   Das Spiel hat ZWEI Betriebsarten, gemerkt in "modus":

     "lernen"  Knochen antippen, Namen lesen.
     "testen"  Ein Name wird genannt, du suchst den Knochen.

   Das ist derselbe Merkzettel-Trick wie "leistenModus" oben in
   der Spielerleiste: eine einzige Schublade entscheidet, was
   ein Antippen bedeutet. */

let modus = "lernen";

// Nur fuers Lernen
let angeschaut = [];     // welche Knochen schon dran waren

// Nur fuers Testen
let gesucht = null;      // welcher Knochen gerade gefragt ist
let frageNr = 0;         // die wievielte Frage laeuft
let richtig = 0;         // wie viele auf Anhieb sassen
let schonDaneben = false;// in DIESER Frage schon danebengetippt?
let testUhr = null;      // Wartezeit bis zur naechsten Frage

// Fuer beide
let fertig = false;

/* --- Einen Knochen aus der Liste holen ---
   Gibt null zurueck, wenn es ihn nicht gibt - dann steht in
   der Zeichnung ein Name, den die Liste nicht kennt. */

function knochenSuchen(schluessel) {

  for (let i = 0; i < knochen.length; i++) {
    if (knochen[i].schluessel === schluessel) {
      return knochen[i];
    }
  }
  return null;
}

/* --- Die Zeile ueber dem Bild ---
   Sie zeigt je nach Betriebsart etwas anderes an. */

function zeigeAnzeige() {

  const zeile = document.getElementById("anzeige");

  if (modus === "testen") {
    zeile.innerHTML = "Frage " + frageNr + " von " + testFragen +
      " &middot; richtig: " + richtig;
  } else {
    zeile.innerHTML = "Angeschaut: " + angeschaut.length +
      " von " + knochen.length;
  }
}

/* --- Alle Farben wegnehmen ---
   gewaehlt, gesehen, richtig und falsch zusammen. Wird beim
   Umschalten und bei jeder neuen Runde gebraucht. */

function markenLoeschen(auchGesehen) {

  const teile = document.querySelectorAll("#skelett .knochen");

  for (let i = 0; i < teile.length; i++) {
    teile[i].classList.remove("gewaehlt");
    teile[i].classList.remove("richtig");
    teile[i].classList.remove("falsch");
    if (auchGesehen === true) {
      teile[i].classList.remove("gesehen");
    }
  }
}

/* --- Nur die Auswahl wegnehmen ---
   Vor jedem neuen Antippen im Lern-Modus. Sonst blieben zwei
   Knochen gleichzeitig hervorgehoben. */

function auswahlLoeschen() {
  markenLoeschen(false);
}

/* --- Alle Teile eines Knochens einfaerben ---
   Bei Armen und Beinen sind das zwei, bei den Rippen 24. */

function einfaerben(schluessel, klasse) {

  const teile = document.querySelectorAll(
    '#skelett [data-knochen="' + schluessel + '"]');

  for (let i = 0; i < teile.length; i++) {
    teile[i].classList.add(klasse);
  }
  return teile;
}

/* --- Welche der drei Tafeln ist zu sehen? ---
   Immer genau eine. Sichtbar/unsichtbar macht das CSS ueber
   display, hier wird nur umgeschaltet. */

function tafelZeigenTeil(welche) {

  document.getElementById("tafel-hinweis").style.display =
    (welche === "hinweis") ? "block" : "none";
  document.getElementById("tafel-inhalt").style.display =
    (welche === "inhalt") ? "block" : "none";
  document.getElementById("tafel-frage").style.display =
    (welche === "frage") ? "block" : "none";
}

/* ============================================
   LERNEN
   ============================================ */

/* --- Ein Knochen wurde angetippt --- */

function knochenGewaehlt(schluessel) {

  /* Im Test-Modus bedeutet ein Antippen etwas ganz anderes:
     nicht "zeig mir den Namen", sondern "das ist meine Antwort". */

  if (modus === "testen") {
    antwortPruefen(schluessel);
    return;
  }

  const gefunden = knochenSuchen(schluessel);

  if (gefunden === null) {
    return;
  }

  auswahlLoeschen();

  const teile = einfaerben(schluessel, "gewaehlt");

  /* Die weisse Tafel fuellen. */

  tafelZeigenTeil("inhalt");

  document.getElementById("knochen-deutsch").innerHTML = gefunden.deutsch;
  document.getElementById("knochen-latein").innerHTML = gefunden.latein;
  document.getElementById("knochen-art").innerHTML = gefunden.art;

  /* Noch nicht angeschaut? Dann merken.
     indexOf gibt -1 zurueck, wenn etwas nicht in der Liste ist. */

  if (angeschaut.indexOf(schluessel) === -1) {
    angeschaut.push(schluessel);

    // Angeschaute Knochen bekommen einen dauerhaften Haken.
    for (let i = 0; i < teile.length; i++) {
      teile[i].classList.add("gesehen");
    }

    zeigeAnzeige();
    vielleichtFertig();
  }
}

/* --- Alle angeschaut? --- */

function vielleichtFertig() {

  if (angeschaut.length < knochen.length || fertig === true) {
    return;
  }

  fertig = true;

  let text = "Alle " + knochen.length + " Knochen angeschaut!";
  text = text + punkteSatz();

  schlussZeigen(text);
}

/* ============================================
   TESTEN
   ============================================ */

/* --- Eine Testrunde beginnen --- */

function testStarten() {

  clearTimeout(testUhr);

  frageNr = 0;
  richtig = 0;
  fertig = false;

  markenLoeschen(true);
  ergebnisLoeschen();
  naechsteFrage();
}

/* --- Die naechste Frage stellen ---
   Der zuletzt gefragte Knochen kommt nicht gleich nochmal:
   sonst waere die Antwort ja schon eingefaerbt zu sehen. */

function naechsteFrage() {

  markenLoeschen(false);

  if (frageNr >= testFragen) {
    testFertig();
    return;
  }

  const vorher = gesucht;

  do {
    gesucht = knochen[Math.floor(Math.random() * knochen.length)];
  } while (knochen.length > 1 && vorher !== null &&
           gesucht.schluessel === vorher.schluessel);

  frageNr = frageNr + 1;
  schonDaneben = false;

  tafelZeigenTeil("frage");

  /* "Finde im Bild:" statt "Wo ist der ...?".
     Grund: die Liste hat Einzahl (Schaedel) und Mehrzahl
     (Rippen, Fingerknochen). Mit Artikel muesste der Code
     das Geschlecht jedes Knochens kennen - so nicht. */
  document.getElementById("frage-zeile").innerHTML =
    "Finde im Bild:<br><span class=\"gesucht\">" +
    gesucht.deutsch + "</span>";
  document.getElementById("frage-rueckmeldung").innerHTML = "";

  zeigeAnzeige();
}

/* --- Eine Antwort beurteilen ---
   Falsch heisst NICHT "Frage vorbei": man darf weitersuchen.
   Dazu steht da, was man stattdessen getroffen hat - so lernt
   man auch aus einem Fehlgriff etwas. */

function antwortPruefen(schluessel) {

  if (gesucht === null || fertig === true) {
    return;
  }

  if (schluessel === gesucht.schluessel) {

    einfaerben(schluessel, "richtig");

    if (schonDaneben === false) {
      richtig = richtig + 1;
    }

    document.getElementById("frage-rueckmeldung").innerHTML =
      "Richtig! <strong>" + gesucht.deutsch +
      "</strong> &ndash; <em>" + gesucht.latein + "</em>";

    zeigeAnzeige();

    /* clearTimeout zuerst: sonst wuerde ein schneller Doppeltipp
       zwei Uhren starten und eine Frage ueberspringen. */
    clearTimeout(testUhr);
    testUhr = setTimeout(naechsteFrage, pause);

  } else {

    const daneben = knochenSuchen(schluessel);

    einfaerben(schluessel, "falsch");
    schonDaneben = true;

    document.getElementById("frage-rueckmeldung").innerHTML =
      "Du hast <strong>" + (daneben === null ? "?" : daneben.deutsch) +
      "</strong> getroffen. Suche weiter.";
  }
}

/* --- Die Testrunde ist durch --- */

function testFertig() {

  fertig = true;
  gesucht = null;

  tafelZeigenTeil("hinweis");

  let text = richtig + " von " + testFragen + " auf Anhieb richtig.";

  /* Dieselbe Schwelle wie im Quiz: zwei Fehler sind erlaubt.
     So bleibt es zu schaffen, ohne geschenkt zu sein. */

  if (richtig >= testFragen - 2) {
    text = text + punkteSatz();
  } else {
    text = text + "<br>Ab " + (testFragen - 2) +
      " richtigen gibt es einen Punkt. Probier es nochmal!";
  }

  schlussZeigen(text);
}

/* ============================================
   FUER BEIDE
   ============================================ */

/* --- Der Satz mit den Punkten ---
   punkteDazu sagt selber, ob es geklappt hat. Steht hier
   einmal, weil ihn Lernen und Testen beide brauchen. */

function punkteSatz() {

  if (punkteDazu(belohnung) === true) {
    return " Das gibt " + belohnung + punkteWort(belohnung) + " &#11088;";
  }
  return "<br>Melde dich oben an, dann gibt es dafür Punkte.";
}

/* --- Die Schlusstafel --- */

function schlussZeigen(text) {

  const ergebnis = document.getElementById("ergebnis");
  ergebnis.innerHTML = text;
  ergebnis.className = "ergebnis-karte";

  konfetti(120, 8000);
}

function ergebnisLoeschen() {

  const ergebnis = document.getElementById("ergebnis");
  ergebnis.innerHTML = "";
  ergebnis.className = "";
}

/* --- Umschalten zwischen Lernen und Testen --- */

function modusSetzen(neu) {

  modus = neu;

  document.getElementById("knopf-lernen").classList.toggle("an", neu === "lernen");
  document.getElementById("knopf-testen").classList.toggle("an", neu === "testen");

  neuesSpiel();
}

/* --- Von vorne ---
   Was das heisst, haengt von der Betriebsart ab. */

function neuesSpiel() {

  clearTimeout(testUhr);

  fertig = false;
  gesucht = null;
  ergebnisLoeschen();

  if (modus === "testen") {
    testStarten();
    return;
  }

  angeschaut = [];
  markenLoeschen(true);
  tafelZeigenTeil("hinweis");
  zeigeAnzeige();
}

/* --- Die Knochen zum Leben erwecken ---
   Jeder bekommt seinen Klick-Befehl. Das steht hier und nicht
   als onclick in der Zeichnung: dort waeren es ueber hundert
   Stellen. */

function knochenBereitmachen() {

  const teile = document.querySelectorAll("#skelett .knochen");

  for (let i = 0; i < teile.length; i++) {

    const teil = teile[i];
    const schluessel = teil.dataset.knochen;

    /* addEventListener und nicht "teil.onclick = ...".
       Bei gewoehnlichen Knoepfen ginge beides - bei Teilen
       einer Zeichnung (SVG) ist addEventListener der Weg,
       der ueberall verlaesslich funktioniert. */

    teil.addEventListener("click", function () {
      knochenGewaehlt(schluessel);
    });

    /* Auch mit der Tastatur: Enter waehlt aus.
       Die Leertaste absichtlich NICHT - die ist auf allen
       Seiten fuer "neue Runde" reserviert. */

    teil.addEventListener("keydown", function (taste) {
      if (taste.key === "Enter") {
        taste.preventDefault();
        knochenGewaehlt(schluessel);
      }
    });
  }
}

/* --- Los geht's --- */

knochenBereitmachen();
neuesSpiel();

/* Die Leertaste faengt von vorne an - aber nur, wenn die Runde
   fertig ist. Sonst waere alles Gesammelte mit einem
   Leerschlag weg. leertasteStartet() steht in js/punkte.js. */

leertasteStartet(function () {
  if (fertig === true) {
    neuesSpiel();
  }
});
