/* ============================================
   Snake - ein Belohnungsspiel
   Bezahlt wird mit den Punkten aus den Lernspielen.

   Die Schlange ist eine LISTE von Kästchen. Vorne kommt
   bei jedem Takt eines dazu, hinten fällt eines weg -
   das sieht dann aus wie Kriechen. Frisst sie ein Vitamin,
   lassen wir das hintere einfach stehen: schon ist sie
   ein Kästchen länger.
   ============================================ */

/* --- Einstellungen. Hier darfst du drehen. --- */

const kosten = 2;          // Punkte pro Runde
const breite = 15;         // Kästchen nebeneinander
const hoehe = 15;          // Kästchen untereinander

const startTempo = 200;    // Millisekunden pro Schritt am Anfang
const schnellstes = 90;    // schneller wird sie nie
const schneller = 6;       // um so viel schneller pro Vitamin

const startLaenge = 3;

/* --- Die Schubladen --- */

let laeuft = false;
let schlange = [];             // die Kästchennummern, Kopf zuvorderst
let richtung = { ds: 1, dz: 0 };
let naechsteRichtung = { ds: 1, dz: 0 };
let futter = 0;                // wo das Vitamin liegt
let tempo = startTempo;
let uhr = null;

const gitter = document.getElementById("gitter");
const tafel = document.getElementById("tafel");

let felder = [];               // alle Kästchen als Elemente

/* --- Das Gitter einmal herstellen ---
   Die Kästchen bleiben immer dieselben. Beim Spielen werden
   sie nur an- und ausgemalt - das ist viel weniger Arbeit,
   als sie jedes Mal neu zu bauen. */

function gitterBauen() {

  gitter.innerHTML = "";

  // Die Spaltenzahl kommt aus dem JavaScript, nicht aus dem CSS.
  // So muss man «breite» nur an einem Ort ändern.
  gitter.style.gridTemplateColumns = "repeat(" + breite + ", 1fr)";

  for (let i = 0; i < breite * hoehe; i++) {
    const kaestchen = document.createElement("div");
    kaestchen.className = "kaestchen";
    gitter.appendChild(kaestchen);
  }

  felder = gitter.children;
}

/* --- Von Spalte und Zeile zur Kästchennummer ---
   Wie beim Kreuzworträtsel: das Feld ist in Wahrheit
   eine einzige lange Liste. */

function nummerVon(spalte, zeile) {
  return zeile * breite + spalte;
}

/* --- Anzeige oben --- */

function zeigeAnzeige() {
  document.getElementById("anzeige").innerHTML =
    "L&auml;nge: " + schlange.length +
    " &nbsp;·&nbsp; Rekord: " + rekordVon("snake");
}

/* --- Das Feld anmalen --- */

function zeichnen() {

  // Zuerst alles löschen, dann neu anmalen. 225 Kästchen sind
  // so wenig, dass sich Feineres nicht lohnt.
  for (let i = 0; i < felder.length; i++) {
    felder[i].className = "kaestchen";
  }

  for (let i = 0; i < schlange.length; i++) {

    // Das erste Stück ist der Kopf und sieht anders aus.
    if (i === 0) {
      felder[schlange[i]].className = "kaestchen kopf";
    } else {
      felder[schlange[i]].className = "kaestchen koerper";
    }
  }

  felder[futter].className = "kaestchen futter";
}

/* --- Ein neues Vitamin hinlegen ---
   Es darf nicht unter der Schlange liegen. Darum sammeln
   wir zuerst alle freien Kästchen ein und ziehen dann eines
   davon. Das ist sicherer als «würfeln bis es passt» -
   dieses Würfeln würde immer länger dauern, je voller
   das Feld wird. */

function futterHinlegen() {

  const frei = [];

  for (let i = 0; i < breite * hoehe; i++) {
    if (schlange.indexOf(i) === -1) {
      frei.push(i);
    }
  }

  // Kein freies Kästchen mehr? Dann ist das Feld voll -
  // das ist der perfekte Sieg.
  if (frei.length === 0) {
    gewonnen();
    return;
  }

  futter = frei[Math.floor(Math.random() * frei.length)];
}

/* --- Die Uhr neu stellen ---
   setInterval kann man nicht einfach schneller machen.
   Man muss die alte Uhr abstellen und eine neue starten. */

function uhrStellen() {
  clearInterval(uhr);
  uhr = setInterval(takt, tempo);
}

/* --- Losspielen --- */

function starten() {

  // Den Knopf «loslassen». Ein angeklickter Knopf behält
  // sonst den Fokus - und mit Enter würde man ihn immer
  // wieder drücken, ohne die Maus zu benutzen.
  if (document.activeElement !== null) {
    document.activeElement.blur();
  }

  // Läuft schon ein Spiel? Dann nichts machen - sonst liefen
  // zwei Uhren gleichzeitig. Denselben Fehler gab es beim
  // Rennen schon einmal.
  if (laeuft === true) {
    return;
  }

  clearInterval(uhr);

  // Erst bezahlen. Klappt das nicht, geht es nicht los.
  if (punkteAbziehen(kosten) === false) {
    zeigeStarttafel();
    return;
  }

  // In der Mitte starten, nach rechts schauend.
  const mitteZ = Math.floor(hoehe / 2);
  const mitteS = Math.floor(breite / 2);

  schlange = [];
  for (let i = 0; i < startLaenge; i++) {
    schlange.push(nummerVon(mitteS - i, mitteZ));
  }

  richtung = { ds: 1, dz: 0 };
  naechsteRichtung = { ds: 1, dz: 0 };
  tempo = startTempo;
  laeuft = true;

  futterHinlegen();
  zeichnen();
  zeigeAnzeige();

  tafel.classList.add("weg");
  uhrStellen();
}

/* --- Ein Schritt --- */

function takt() {

  // Erst jetzt gilt die neue Richtung. Warum nicht sofort
  // beim Tastendruck? Weil man sonst in einem einzigen Takt
  // zweimal abbiegen und sich damit selber treffen könnte.
  richtung = naechsteRichtung;

  const kopf = schlange[0];
  const s = kopf % breite + richtung.ds;
  const z = Math.floor(kopf / breite) + richtung.dz;

  // An die Wand?
  if (s < 0 || s >= breite || z < 0 || z >= hoehe) {
    verloren();
    return;
  }

  const neu = nummerVon(s, z);
  const frisst = (neu === futter);

  /* In sich selber?

     Achtung, feiner Punkt: das letzte Stück rutscht in
     diesem Takt sowieso weg. Genau dorthin darf der Kopf
     also ziehen - ausser die Schlange wächst gerade, dann
     bleibt das Stück ja liegen. */

  let koerper = schlange;
  if (frisst === false) {
    koerper = schlange.slice(0, schlange.length - 1);
  }

  if (koerper.indexOf(neu) >= 0) {
    verloren();
    return;
  }

  // Vorne das neue Stück anhängen.
  schlange.unshift(neu);

  if (frisst === true) {

    // Hinten NICHT wegnehmen - so wird sie länger.
    futterHinlegen();

    if (tempo > schnellstes) {
      tempo = tempo - schneller;

      if (tempo < schnellstes) {
        tempo = schnellstes;
      }
      uhrStellen();
    }

    zeigeAnzeige();

  } else {
    schlange.pop();   // hinten wegnehmen
  }

  // Ist das Feld voll geworden, hat futterHinlegen() schon
  // gewonnen() gerufen und die Uhr abgestellt.
  if (laeuft === true) {
    zeichnen();
  }
}

/* --- Steuern ---
   ds = Schritt zur Seite, dz = Schritt nach unten. */

function lenken(ds, dz) {

  if (laeuft === false) {
    return;
  }

  /* Nicht um 180 Grad wenden - das wäre sofort der Tod.
     Verglichen wird mit «richtung», also mit der Richtung,
     in die sie WIRKLICH läuft. Würde man mit
     «naechsteRichtung» vergleichen, könnte man mit zwei
     schnellen Tastendrücken doch noch umkehren. */

  if (ds === -richtung.ds && dz === -richtung.dz) {
    return;
  }

  naechsteRichtung = { ds: ds, dz: dz };
}

/* --- Die Tastatur ---

   Tippt gerade jemand oben in der Leiste seinen Namen oder
   sein Passwort? Dann gehören die Tasten dorthin und nicht
   ins Spiel. Genau wie beim Rennen. */

function tipptGerade() {
  const wo = document.activeElement;
  return wo !== null && wo.tagName === "INPUT";
}

document.onkeydown = function (taste) {

  if (tipptGerade() === true) {
    return;
  }

  if (taste.key === "ArrowLeft") {
    taste.preventDefault();   // die Seite soll nicht scrollen
    lenken(-1, 0);
  }

  if (taste.key === "ArrowRight") {
    taste.preventDefault();
    lenken(1, 0);
  }

  if (taste.key === "ArrowUp") {
    taste.preventDefault();
    lenken(0, -1);
  }

  if (taste.key === "ArrowDown") {
    taste.preventDefault();
    lenken(0, 1);
  }

  /* Die Leertaste startet.
     preventDefault ist Pflicht: sonst scrollt die Seite UND
     der Startknopf, der ja den Fokus hat, feuert nochmal. */

  if (taste.key === " ") {
    taste.preventDefault();

    if (laeuft === false) {
      starten();
    }
  }
};

/* --- Die Tafel vor dem Start --- */

function zeigeStarttafel() {

  const name = angemeldeterSpieler();

  // Ist der Code an? Dann braucht es weder Anmeldung
  // noch Punkte - die zwei Prüfungen darunter überspringen wir.
  const frei = codeIstFrei();

  if (name === null && frei === false) {
    tafel.innerHTML =
      "<div><strong>Erst anmelden</strong></div>" +
      "<div>Melde dich oben an, dann kannst du mit deinen Punkten " +
      "eine Runde bezahlen.</div>" +
      '<button class="tafelknopf" disabled>Losspielen</button>';
    tafel.classList.remove("weg");
    return;
  }

  if (frei === false && punkteVon(name) < kosten) {
    tafel.innerHTML =
      "<div><strong>Zu wenig Punkte</strong></div>" +
      "<div>Eine Runde kostet " + kosten + " Punkte. Du hast " +
      punkteVon(name) + ".<br>Spiel ein Quiz, ein Memory oder Hangman!</div>" +
      '<button class="tafelknopf" disabled>Losspielen</button>';
    tafel.classList.remove("weg");
    return;
  }

  // Der Satz mit dem Preis heisst anders, wenn es gratis ist.
  let preis = "Eine Runde kostet " + kosten + " Punkte.";
  if (frei === true) {
    preis = "&#128275; Dein Code gilt &ndash; noch " + gratisRennen() +
            " Runden gratis!";
  }

  tafel.innerHTML =
    "<div><strong>Bereit?</strong></div>" +
    "<div>Sammle die Vitamine &#127823; ein und beiss dich nicht " +
    "selber.<br>" + preis + "</div>" +
    '<button class="tafelknopf" onclick="starten()">Losspielen</button>' +
    '<div class="tastenhinweis">oder einfach die Leertaste dr&uuml;cken</div>';

  tafel.classList.remove("weg");
}

/* --- Der Knopf auf der Schlusstafel ---
   Steht in einem eigenen Befehl, weil beide Schlusstafeln
   (verloren und gewonnen) ihn brauchen. */

function nochmalKnopf() {

  if (codeIstFrei() === true) {
    return '<button class="tafelknopf" onclick="starten()">' +
      "Nochmal (noch " + gratisRennen() + " gratis)</button>";
  }

  const name = angemeldeterSpieler();

  if (name === null || punkteVon(name) < kosten) {
    return '<button class="tafelknopf" disabled>Zu wenig Punkte</button>';
  }

  return '<button class="tafelknopf" onclick="starten()">' +
    "Nochmal (" + kosten + " Punkte)</button>";
}

/* --- Verloren --- */

function verloren() {

  laeuft = false;
  clearInterval(uhr);

  const istRekord = rekordSpeichern("snake", schlange.length);

  let zusatz = "";
  if (istRekord === true) {
    zusatz = "<br>Neuer Rekord!";
  }

  tafel.innerHTML =
    "<div><strong>Autsch!</strong></div>" +
    "<div>L&auml;nge: " + schlange.length + zusatz +
    "<br>Rekord: " + rekordVon("snake") + "</div>" +
    nochmalKnopf();

  tafel.classList.remove("weg");
  zeigeAnzeige();
}

/* --- Das ganze Feld voll: der perfekte Sieg --- */

function gewonnen() {

  laeuft = false;
  clearInterval(uhr);

  rekordSpeichern("snake", schlange.length);

  tafel.innerHTML =
    "<div><strong>Das ganze Feld!</strong></div>" +
    "<div>Du hast alle " + (breite * hoehe) + " K&auml;stchen gef&uuml;llt. " +
    "Das schafft fast niemand.</div>" +
    nochmalKnopf();

  tafel.classList.remove("weg");
  zeigeAnzeige();
}

/* --- Los geht's --- */

gitterBauen();

// Am Anfang liegt noch nichts da - damit zeichnen() nicht
// über ein leeres Feld stolpert, setzen wir das Vitamin
// irgendwohin und malen einmal.
schlange = [];
futter = 0;
zeichnen();

zeigeAnzeige();
zeigeStarttafel();
