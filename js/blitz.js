/* ============================================
   Die Blitzrunde - richtig oder falsch auf Zeit
   ============================================ */

/* --- Die Aussagen ---
   Willst du eine ändern oder eine eigene dazutun?
   Nur hier, sonst nirgends.

   text    = was auf der Karte steht
   richtig = true, wenn die Aussage stimmt
             false, wenn sie nicht stimmt

   Achtung beim Selberschreiben: Steht ein Apostroph im Satz,
   nimm für den Text doppelte Anführungszeichen "..." - sonst
   denkt JavaScript, der Text sei schon fertig.

   WICHTIGE REGEL für neue Aussagen:
   Keine zwei Aussagen dürfen über dieselbe Sache das Gegenteil
   behaupten. Also nicht einmal «ss heisst selbstständig» und
   später «ss heisst mit Hilfe» - dann muss man nur die erste
   gesehen haben und weiss die zweite automatisch.
   Jede Sache kommt genau EINMAL vor. */

const aussagen = [

  // --- Vitalzeichen und Werte ---
  { text: "Der Ruhepuls eines gesunden Erwachsenen liegt etwa zwischen 60 und 100 Schlägen pro Minute.", richtig: true },
  { text: "Ein Erwachsener atmet in Ruhe etwa 12 bis 20 Mal pro Minute.", richtig: true },
  { text: "Beim Blutdruck ist die obere Zahl der systolische Wert.", richtig: true },
  { text: "Die Sauerstoffsättigung wird in Prozent angegeben.", richtig: true },
  { text: "Von Fieber spricht man bei Erwachsenen etwa ab 38 Grad Celsius.", richtig: true },
  { text: "Am genauesten misst man die Temperatur unter dem Arm.", richtig: false },
  { text: "Das Körpergewicht gehört zu den Vitalzeichen.", richtig: false },
  { text: "Den Puls kann man nur am Hals messen.", richtig: false },

  // --- Abkürzungen, die im Spital wirklich vorkommen ---
  { text: "«i.v.» heisst intravenös, also in die Vene.", richtig: true },
  { text: "«s.c.» heisst subkutan, also unter die Haut.", richtig: true },
  { text: "«BZ» ist die Abkürzung für Blutzucker.", richtig: true },
  { text: "«nüchtern» heisst: die Patientin hat vor der Untersuchung nichts gegessen.", richtig: true },
  { text: "«p.o.» ist die Abkürzung für «pro Operation».", richtig: false },

  // --- Hygiene ---
  { text: "Händedesinfektionsmittel wirkt besser, wenn die Hände vorher nass sind.", richtig: false },
  { text: "Einweghandschuhe ersetzen die Händedesinfektion.", richtig: false },
  { text: "Desinfizieren macht einen Gegenstand steril.", richtig: false },
  { text: "Ein Fieberthermometer muss zwischen zwei Patienten nicht gereinigt werden.", richtig: false },

  // --- Pflege im Alltag ---
  { text: "Ein Dekubitus entsteht durch anhaltenden Druck auf die Haut.", richtig: true },
  { text: "Kompressionsstrümpfe zieht man am besten morgens vor dem Aufstehen an.", richtig: true },
  { text: "Ein Urinbeutel muss tiefer als die Blase hängen.", richtig: true },
  { text: "Wer zu wenig isst, kann bei Diabetes eine Unterzuckerung bekommen.", richtig: true },
  { text: "Wer Fieber hat, sollte möglichst wenig trinken.", richtig: false },
  { text: "Bei Atemnot legt man die Person flach auf den Rücken.", richtig: false },

  // --- Notfälle ---
  { text: "Bei Verdacht auf einen Schlaganfall wartet man bis zum nächsten Tag.", richtig: false },
  { text: "Bei Nasenbluten legt man den Kopf in den Nacken.", richtig: false },
  { text: "Eine Verbrennung kühlt man am besten mit Eis direkt auf der Haut.", richtig: false },
  { text: "Nach einem Sturz hebt man die Person sofort schnell auf.", richtig: false },

  // --- Beruf und Regeln ---
  { text: "Die Schweigepflicht gilt auch nach dem Ende der Lehre weiter.", richtig: true },
  { text: "Die Lehre zur FaGe dauert in der Schweiz drei Jahre.", richtig: true },
  { text: "Die Pflegedokumentation darf man mit Bleistift schreiben.", richtig: false }
];

/* --- Einstellungen. Hier darfst du drehen. --- */

const startZeit = 60;     // Sekunden pro Runde
const zielPunkte = 8;     // ab so vielen richtigen gibt es einen Kontopunkt

/* --- Die Schubladen --- */

let laeuft = false;    // läuft gerade eine Runde?
let zeit = startZeit;  // Sekunden, die noch übrig sind
let punkte = 0;        // richtige Antworten
let fehler = 0;        // falsche Antworten
let dran = 0;          // welche Aussage gerade gezeigt wird
let uhr = null;        // die Sekunden-Uhr
let blinkUhr = null;   // wann die Farbe wieder weggeht

const karte = document.getElementById("karte");
const aussageFeld = document.getElementById("aussage");
const startknopf = document.getElementById("startknopf");
const ende = document.getElementById("ende");

// Beide Antwortknöpfe zusammen. So kann man sie mit einer
// Schleife auf einmal sperren - wie im Hangman die Buchstaben.
const knoepfe = document.querySelectorAll(".antwort");

/* --- Die Aussagen mischen ---
   Genau derselbe Befehl wie im Memory: von hinten durchgehen
   und jede mit einer zufälligen anderen tauschen. */

function mischen(liste) {
  for (let i = liste.length - 1; i > 0; i--) {
    const zufall = Math.floor(Math.random() * (i + 1));
    const merker = liste[i];
    liste[i] = liste[zufall];
    liste[zufall] = merker;
  }
}

/* --- Anzeige oben --- */

function zeigeAnzeige() {
  document.getElementById("anzeige").innerHTML =
    "&#9201; " + zeit + " s" +
    " &nbsp;·&nbsp; Richtig: " + punkte +
    " &nbsp;·&nbsp; Falsch: " + fehler +
    " &nbsp;·&nbsp; Rekord: " + rekordVon("blitz");
}

/* --- Die zwei Antwortknöpfe sperren oder freigeben ---
   true = gesperrt, false = man darf klicken. */

function knoepfeSperren(gesperrt) {
  for (let i = 0; i < knoepfe.length; i++) {
    knoepfe[i].disabled = gesperrt;
  }
}

/* --- Los geht's --- */

function starten() {

  // Läuft schon eine Runde? Dann nichts machen.
  if (laeuft === true) {
    return;
  }

  // Den angeklickten Knopf «loslassen», sonst würde die
  // Enter-Taste ihn gleich nochmal drücken.
  if (document.activeElement !== null) {
    document.activeElement.blur();
  }

  // Sicherheitshalber eine alte Uhr abstellen.
  clearInterval(uhr);

  // Alles zurücksetzen
  laeuft = true;
  zeit = startZeit;
  punkte = 0;
  fehler = 0;
  dran = 0;

  mischen(aussagen);

  startknopf.style.display = "none";
  ende.innerHTML = "";
  ende.classList.remove("ende-karte");

  knoepfeSperren(false);
  zeigeAussage();
  zeigeAnzeige();

  // setInterval heisst: mach das immer wieder.
  // 1000 Millisekunden sind eine Sekunde.
  uhr = setInterval(sekunde, 1000);
}

/* --- Eine Sekunde ist vorbei --- */

function sekunde() {

  zeit = zeit - 1;
  zeigeAnzeige();

  if (zeit <= 0) {
    fertig();
  }
}

/* --- Die nächste Aussage auf die Karte schreiben --- */

function zeigeAussage() {

  // Alle Aussagen durch? Dann ist früher Schluss.
  if (dran >= aussagen.length) {
    fertig();
    return;
  }

  aussageFeld.innerHTML = aussagen[dran].text;
}

/* --- Es wurde geantwortet ---
   gewaehlt ist true beim Knopf «Richtig» und false bei «Falsch». */

function antworten(gewaehlt) {

  if (laeuft === false) {
    return;
  }

  // Was wäre die richtige Antwort gewesen?
  const loesung = aussagen[dran].richtig;

  if (gewaehlt === loesung) {
    punkte = punkte + 1;
    blinken("gut");
  } else {
    fehler = fehler + 1;
    blinken("schlecht");
  }

  dran = dran + 1;

  zeigeAnzeige();
  zeigeAussage();
}

/* --- Die Karte blinkt kurz grün oder rot ---
   clearTimeout stellt die alte Uhr ab. Sonst würde bei zwei
   schnellen Klicks die erste Uhr die neue Farbe zu früh löschen. */

function blinken(klasse) {

  clearTimeout(blinkUhr);

  karte.classList.remove("gut");
  karte.classList.remove("schlecht");
  karte.classList.add(klasse);

  blinkUhr = setTimeout(function () {
    karte.classList.remove(klasse);
  }, 300);
}

/* --- Die Runde ist vorbei --- */

function fertig() {

  // Schon fertig? Dann nicht zweimal auswerten.
  if (laeuft === false) {
    return;
  }

  laeuft = false;
  clearInterval(uhr);
  knoepfeSperren(true);

  if (zeit <= 0) {
    aussageFeld.innerHTML = "Zeit um!";
  } else {
    aussageFeld.innerHTML = "Alle Aussagen durch!";
  }

  // War das ein neuer Rekord?
  const istRekord = rekordSpeichern("blitz", punkte);

  let zusatz = "";
  if (istRekord === true) {
    zusatz = "<br>Neuer Rekord!";
  }

  // Ab zielPunkte richtigen gibt es Konfetti und einen Kontopunkt.
  let extra = "";

  if (punkte >= zielPunkte) {

    konfetti(120, 10000);

    // punkteDazu gibt false zurück, wenn niemand angemeldet ist.
    if (punkteDazu(1) === true) {
      extra = "<br>&#11088; +1 Punkt für dein Konto!";
    } else {
      extra = "<br><small>Melde dich oben an, dann sammelst du Punkte.</small>";
    }

  } else {
    extra = "<br><small>Ab " + zielPunkte +
      " richtigen gibt es einen Punkt fürs Konto.</small>";
  }

  ende.innerHTML =
    "Richtig: " + punkte + " &nbsp;·&nbsp; Falsch: " + fehler +
    zusatz + extra;
  ende.classList.add("ende-karte");

  // Der Startknopf kommt zurück, jetzt heisst er «Nochmal».
  startknopf.innerHTML = "Nochmal";
  startknopf.style.display = "inline-block";

  zeigeAnzeige();
}

/* --- Mit den Pfeiltasten antworten ---
   Bei einem Spiel auf Zeit ist die Tastatur viel schneller
   als die Maus. Links = Richtig, rechts = Falsch. */

document.onkeydown = function (taste) {

  if (taste.key === "ArrowLeft") {
    taste.preventDefault();   // die Seite soll nicht scrollen
    antworten(true);
  }

  if (taste.key === "ArrowRight") {
    taste.preventDefault();
    antworten(false);
  }
};

/* --- Los geht's --- */

knoepfeSperren(true);
zeigeAnzeige();

/* --- Die Leertaste startet ---
   leertasteStartet() steht in js/punkte.js und kuemmert sich
   darum, dass es nicht ausloest, waehrend jemand oben seinen
   Namen eintippt. */

leertasteStartet(function () {
  if (laeuft === false) {
    starten();
  }
});
