/* ============================================
   Die Befehle vom FaGe-Quiz
   Hier steht NUR, was passiert, wenn man klickt.
   ============================================ */

/* --- Die Schubladen (Variablen) --- */

let punkte = 0;            // wie viele Punkte man hat
let aktuelleFrage = 1;     // welche Frage gerade dran ist
let schonRichtig = false;  // ist die Frage schon richtig beantwortet?
let falschGeklickt = false; // wurde bei dieser Frage schon falsch geklickt?

// Zählt die Fragen automatisch. Fügst du eine Frage hinzu,
// stimmt die Zahl von selbst.
const anzahlFragen = document.querySelectorAll(".frage").length;

/* --- Der Smiley oben rechts in jeder Frage ---
   Er ist selbst gezeichnet (svg), damit man ihn einfärben kann.
   Ein Emoji wie 😀 hat seine Farbe schon fest eingebaut.

   Beide Münder sind drin - fröhlich und traurig. Das CSS
   zeigt jeweils den passenden und versteckt den anderen. */

const smileyBild =
  '<span class="smiley">' +
    '<svg viewBox="0 0 40 40">' +
      '<circle class="kopf" cx="20" cy="20" r="17" />' +
      '<circle class="auge" cx="14" cy="16" r="2.2" />' +
      '<circle class="auge" cx="26" cy="16" r="2.2" />' +
      '<path class="mund froh" d="M12 25 Q20 32 28 25" />' +
      '<path class="mund traurig" d="M12 30 Q20 23 28 30" />' +
    '</svg>' +
  '</span>';

/* Setzt in jede Frage einen Smiley.
   So bekommt auch jede neue Frage automatisch einen -
   du musst im HTML nichts dazuschreiben. */

function smileysEinbauen() {
  const fragen = document.querySelectorAll(".frage");
  for (let i = 0; i < fragen.length; i++) {
    fragen[i].insertAdjacentHTML("afterbegin", smileyBild);
  }
}

/* --- Punktestand oben anzeigen --- */

function zeigePunkte() {
  document.getElementById("punktestand").innerHTML =
    "Punkte: " + punkte + " von " + anzahlFragen;
}

/* --- Eine Antwort prüfen --- */

function pruefe(knopf, istRichtig) {

  // Frage schon richtig beantwortet? Dann nichts mehr machen.
  if (schonRichtig === true) {
    return;
  }

  const rueckmeldung = document.getElementById("antwort" + aktuelleFrage);
  const kasten = document.getElementById("frage" + aktuelleFrage);

  if (istRichtig === false) {
    knopf.classList.add("falsch");
    falschGeklickt = true;
    kasten.classList.add("verpatzt");
    rueckmeldung.innerHTML = "Leider falsch. Versuch es nochmal!";
    return;
  }

  knopf.classList.add("richtig");
  schonRichtig = true;
  kasten.classList.add("erledigt");

  // Punkt gibt es nur, wenn vorher nichts Falsches geklickt wurde.
  if (falschGeklickt === false) {
    punkte = punkte + 1;
    zeigePunkte();
    rueckmeldung.innerHTML = "Richtig! Ein Punkt.";
  } else {
    rueckmeldung.innerHTML = "Richtig – aber kein Punkt mehr.";
  }

}

/* --- Eine Frage einblenden --- */

function zeigeFrage(nummer) {
  const kasten = document.getElementById("frage" + nummer);
  kasten.style.display = "block";

  // Der Weiter-Pfeil ist immer da - so kommt man auch ohne
  // richtige Antwort bis zur Auswertung.
  document.getElementById("pfeil" + nummer).style.visibility = "visible";

  // Ab Frage 2 gibt es einen Zurueck-Pfeil.
  if (nummer > 1) {
    document.getElementById("zurueck" + nummer).style.visibility = "visible";
  }

  // Wurde diese Frage schon richtig beantwortet?
  schonRichtig = kasten.classList.contains("erledigt");

  // Wurde bei dieser Frage schon falsch geklickt?
  falschGeklickt = kasten.classList.contains("verpatzt");
}

/* --- Blättern --- */

function weiter() {
  document.getElementById("frage" + aktuelleFrage).style.display = "none";
  aktuelleFrage = aktuelleFrage + 1;

  if (aktuelleFrage <= anzahlFragen) {
    zeigeFrage(aktuelleFrage);
  } else {
    auswertung();
  }
}

function zurueck() {
  document.getElementById("frage" + aktuelleFrage).style.display = "none";
  aktuelleFrage = aktuelleFrage - 1;
  zeigeFrage(aktuelleFrage);
}

/* --- Ergebnis am Schluss --- */

function auswertung() {
  let text = "";

  if (punkte === anzahlFragen) {
    text = "Perfekt! Alles richtig.";
  } else if (punkte >= anzahlFragen / 2) {
    text = "Gut gemacht!";
  } else {
    text = "Schau dir die Fragen nochmal an.";
  }

  // Ab 8 von 10 Punkten gibt es Konfetti und einen Punkt
  // fürs Konto. Minus 2 statt einfach 8: so stimmt es auch
  // noch, wenn du später mehr Fragen dazutust.
  let extra = "";

  if (punkte >= anzahlFragen - 2) {

    // 120 Schnipsel, 10 Sekunden lang.
    // Der Befehl steht in js/konfetti.js.
    konfetti(120, 10000);

    // punkteDazu gibt false zurück, wenn niemand angemeldet ist.
    // Der Befehl steht in js/punkte.js.
    if (punkteDazu(1) === true) {
      extra = "<br>&#11088; +1 Punkt für dein Konto!";
    } else {
      extra = "<br><small>Melde dich oben an, dann sammelst du Punkte.</small>";
    }
  }

  const ergebnis = document.getElementById("ergebnis");
  ergebnis.innerHTML = "Quiz beendet!<br>Du hast " + punkte +
    " von " + anzahlFragen + " Punkten.<br>" + text + extra;
  ergebnis.classList.add("ergebnis-karte");
}

/* --- Los geht's --- */

smileysEinbauen();
zeigePunkte();
zeigeFrage(1);

/* --- Die Leertaste laedt das Quiz neu ---
   Nur nach der Auswertung. Woran erkennt man die? Das leere
   #ergebnis bekommt dann die Klasse «ergebnis-karte».
   Mitten im Quiz wuerde ein Leerschlag sonst alle Antworten
   wegwerfen. */

leertasteStartet(function () {
  const ergebnis = document.getElementById("ergebnis");

  if (ergebnis.classList.contains("ergebnis-karte") === true) {
    location.reload();
  }
});
