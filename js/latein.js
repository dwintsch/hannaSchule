/* ============================================
   Latein-Paare

   Links die lateinischen Fachwoerter, rechts die deutschen
   Knochennamen - beide Spalten durcheinander. Wer ein Paar
   zusammenbringt, wird es los.

   Die Woerter kommen aus der Liste "knochen" in
   js/knochenliste.js. Die wird auch vom Skelett benutzt -
   darum steht sie in einer eigenen Datei und nicht hier.
   ============================================ */

/* --- Einstellungen. Hier darfst du drehen. --- */

const anzahlPaare = 8;   // so viele Paare hat eine Runde
const belohnung = 1;     // Punkte fuer eine geloeste Runde

const zeigenRichtig = 450;   // Millisekunden, bis ein Paar verschwindet
const zeigenFalsch = 750;    // Millisekunden, bis Rot wieder weggeht

/* --- Die Schubladen --- */

let paare = [];             // die Knochen dieser Runde
let gewaehltLatein = null;  // welcher Knopf links gerade gewaehlt ist
let gewaehltDeutsch = null; // welcher rechts
let gefunden = 0;
let daneben = 0;            // wie oft es nicht gepasst hat
let blockiert = false;      // waehrend der Farbe darf man nicht klicken
let uhr = null;

/* --- Mischen ---
   Von hinten nach vorne durchgehen und jedes Stueck mit einem
   zufaelligen davor tauschen. So landet jedes Wort mit
   gleicher Wahrscheinlichkeit an jeder Stelle.

   Wichtig: die Liste wird KOPIERT (slice), sonst wuerde die
   echte Knochenliste durcheinandergebracht - und das Skelett
   bekaeme davon auch etwas ab. */

function mischen(liste) {

  const kopie = liste.slice();

  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const halt = kopie[i];
    kopie[i] = kopie[j];
    kopie[j] = halt;
  }
  return kopie;
}

/* --- Die Zeile ueber dem Feld --- */

function zeigeAnzeige() {

  let text = "Gefunden: " + gefunden + " von " + paare.length;

  if (daneben > 0) {
    text = text + " &middot; daneben: " + daneben;
  }
  document.getElementById("anzeige").innerHTML = text;
}

/* --- Einen Wort-Knopf herstellen ---
   seite ist "latein" oder "deutsch". Der schluessel verraet
   spaeter, ob zwei Knoepfe zusammengehoeren. */

function wortKnopf(knochen, seite) {

  const knopf = document.createElement("button");

  knopf.className = "wort " + seite;
  knopf.dataset.schluessel = knochen.schluessel;
  knopf.innerHTML = (seite === "latein") ? knochen.latein : knochen.deutsch;

  knopf.onclick = function () {
    wortGewaehlt(knopf, seite);
  };

  return knopf;
}

/* --- Ein Wort wurde angetippt --- */

function wortGewaehlt(knopf, seite) {

  // Waehrend Gruen oder Rot zu sehen ist, passiert nichts.
  if (blockiert === true) {
    return;
  }

  /* Nochmal auf dasselbe tippen hebt die Wahl wieder auf.
     Ohne das saesse man fest, wenn man sich vertippt hat. */

  if (seite === "latein" && gewaehltLatein === knopf) {
    knopf.classList.remove("gewaehlt");
    gewaehltLatein = null;
    return;
  }
  if (seite === "deutsch" && gewaehltDeutsch === knopf) {
    knopf.classList.remove("gewaehlt");
    gewaehltDeutsch = null;
    return;
  }

  /* Pro Spalte ist immer nur EINS gewaehlt. Ein neuer Klick
     loest den alten ab. */

  if (seite === "latein") {
    if (gewaehltLatein !== null) {
      gewaehltLatein.classList.remove("gewaehlt");
    }
    gewaehltLatein = knopf;
  } else {
    if (gewaehltDeutsch !== null) {
      gewaehltDeutsch.classList.remove("gewaehlt");
    }
    gewaehltDeutsch = knopf;
  }

  knopf.classList.add("gewaehlt");

  /* Erst wenn aus BEIDEN Spalten etwas gewaehlt ist, wird
     geprueft. Welche Seite zuerst kommt, ist egal. */

  if (gewaehltLatein !== null && gewaehltDeutsch !== null) {
    pruefen();
  }
}

/* --- Passen die zwei zusammen? --- */

function pruefen() {

  const links = gewaehltLatein;
  const rechts = gewaehltDeutsch;

  blockiert = true;

  if (links.dataset.schluessel === rechts.dataset.schluessel) {

    links.classList.add("richtig");
    rechts.classList.add("richtig");

    gefunden = gefunden + 1;
    zeigeAnzeige();

    uhr = setTimeout(function () {

      /* "weg" ist display: none. Die uebrigen Woerter ruecken
         dadurch von selber zusammen - dafuer muss man nichts
         umsortieren. */

      links.classList.add("weg");
      rechts.classList.add("weg");

      auswahlLoeschen();
      blockiert = false;
      vielleichtFertig();

    }, zeigenRichtig);

  } else {

    links.classList.add("falsch");
    rechts.classList.add("falsch");

    daneben = daneben + 1;
    zeigeAnzeige();

    uhr = setTimeout(function () {

      links.classList.remove("falsch");
      rechts.classList.remove("falsch");

      auswahlLoeschen();
      blockiert = false;

    }, zeigenFalsch);
  }
}

/* --- Die Wahl in beiden Spalten aufheben --- */

function auswahlLoeschen() {

  if (gewaehltLatein !== null) {
    gewaehltLatein.classList.remove("gewaehlt");
    gewaehltLatein = null;
  }
  if (gewaehltDeutsch !== null) {
    gewaehltDeutsch.classList.remove("gewaehlt");
    gewaehltDeutsch = null;
  }
}

/* --- Alle Paare weg? --- */

function vielleichtFertig() {

  if (gefunden < paare.length) {
    return;
  }

  let text = "Alle " + paare.length + " Paare gefunden!";

  if (daneben === 0) {
    text = text + " Ohne einen einzigen Fehlgriff!";
  }

  // punkteDazu sagt selber, ob es geklappt hat.
  if (punkteDazu(belohnung) === true) {
    text = text + " Das gibt " + belohnung + punkteWort(belohnung) + " &#11088;";
  } else {
    text = text + "<br>Melde dich oben an, dann gibt es dafür Punkte.";
  }

  const ergebnis = document.getElementById("ergebnis");
  ergebnis.innerHTML = text;
  ergebnis.className = "ergebnis-karte";

  konfetti(120, 8000);
}

/* --- Eine neue Runde --- */

function neuesSpiel() {

  clearTimeout(uhr);

  /* Aus allen Knochen werden anzahlPaare zufaellig gezogen.
     Bei 22 Knochen und 8 Paaren ist darum jede Runde anders -
     auch wenn man sie hintereinander spielt. */

  paare = mischen(knochen).slice(0, anzahlPaare);

  gefunden = 0;
  daneben = 0;
  blockiert = false;
  gewaehltLatein = null;
  gewaehltDeutsch = null;

  const links = document.getElementById("spalte-latein");
  const rechts = document.getElementById("spalte-deutsch");

  links.innerHTML = "";
  rechts.innerHTML = "";

  /* BEIDE Spalten werden getrennt gemischt. Wuerde nur eine
     gemischt, staende das erste Wort links immer neben seinem
     Partner rechts - und das waere kein Raetsel mehr. */

  const lateinisch = mischen(paare);
  const deutsch = mischen(paare);

  for (let i = 0; i < lateinisch.length; i++) {
    links.appendChild(wortKnopf(lateinisch[i], "latein"));
  }
  for (let i = 0; i < deutsch.length; i++) {
    rechts.appendChild(wortKnopf(deutsch[i], "deutsch"));
  }

  document.getElementById("ergebnis").innerHTML = "";
  document.getElementById("ergebnis").className = "";

  zeigeAnzeige();
}

/* --- Los geht's --- */

neuesSpiel();

/* Die Leertaste faengt eine neue Runde an - aber nur, wenn die
   alte fertig ist. Sonst waere mitten im Spiel alles Gefundene
   mit einem Leerschlag weg. leertasteStartet() steht in
   js/punkte.js. */

leertasteStartet(function () {
  if (gefunden === paare.length) {
    neuesSpiel();
  }
});
