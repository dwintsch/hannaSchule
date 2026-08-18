/* ============================================
   Snake - ein Belohnungsspiel
   Bezahlt wird mit den Punkten aus den Lernspielen.

   Die Schlange ist eine LISTE von Kästchen. Vorne kommt
   bei jedem Takt eines dazu, hinten fällt eines weg -
   das sieht dann aus wie Kriechen. Frisst sie einen Apfel,
   lassen wir das hintere einfach stehen: schon ist sie
   ein Kästchen länger.
   ============================================ */

/* --- Einstellungen. Hier darfst du drehen. --- */

const kosten = 1;          // Punkte pro Runde
const breite = 15;         // Kästchen nebeneinander
const hoehe = 15;          // Kästchen untereinander

const startTempo = 200;    // Millisekunden pro Schritt am Anfang
const schnellstes = 90;    // schneller wird sie nie
const schneller = 6;       // um so viel schneller pro Vitamin

const startLaenge = 3;
const anzahlFutter = 3;    // wie viele Äpfel gleichzeitig liegen

/* --- Die Schubladen --- */

let laeuft = false;
let schlange = [];             // die Kästchennummern, Kopf zuvorderst
let richtung = { ds: 1, dz: 0 };
let naechsteRichtung = { ds: 1, dz: 0 };
let futter = [];               // wo die Äpfel liegen (mehrere!)
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

/* --- Die zwei Zeichnungen ---

   Kopf und Schwanz sind kleine <svg>, keine Emojis. Grund:
   ein Emoji könnte man weder umfärben noch drehen - und
   gedreht werden müssen beide, je nachdem wohin die
   Schlange gerade läuft.

   Beide sind nach RECHTS gezeichnet. Das Drehen macht das
   CSS über die Klassen nach-rechts / nach-unten / nach-links
   / nach-oben. */

const KOPF_BILD =
  '<svg viewBox="0 0 20 20">' +
  '<rect class="kopf-haut" x="1" y="2" width="16" height="16" rx="7" />' +
  '<path class="zunge" d="M16 10 H18.6 M18.6 10 L20 8.4 M18.6 10 L20 11.6" />' +
  '<circle class="auge" cx="12.4" cy="6.4" r="2" />' +
  '<circle class="auge" cx="12.4" cy="13.6" r="2" />' +
  '<circle class="pupille" cx="13.2" cy="6.4" r="0.9" />' +
  '<circle class="pupille" cx="13.2" cy="13.6" r="0.9" />' +
  '</svg>';

/* Der Schwanz läuft spitz zu. Die breite Seite zeigt zum
   Körper, die Spitze nach aussen. */

const SCHWANZ_BILD =
  '<svg viewBox="0 0 20 20">' +
  '<path class="schwanz-haut" d="M0 3.5 L19 10 L0 16.5 Z" />' +
  '</svg>';

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

/* --- In welche Richtung schaut ein Stück? ---

   Der Unterschied zweier Kästchennummern verrät die Richtung:
   +1 ist rechts, -1 links, +breite ist eine Zeile tiefer,
   -breite eine höher. An den Wänden ist immer Schluss, darum
   kann die Rechnung nie über den Rand springen. */

function richtungsKlasse(unterschied) {

  if (unterschied === 1) {
    return "nach-rechts";
  }
  if (unterschied === -1) {
    return "nach-links";
  }
  if (unterschied === breite) {
    return "nach-unten";
  }
  return "nach-oben";
}

/* Der Kopf schaut dorthin, wo er herkam - also weg vom
   zweiten Stück. Ganz am Anfang gibt es noch kein zweites,
   dann nehmen wir die gemerkte Richtung. */

function kopfRichtung() {

  if (schlange.length >= 2) {
    return schlange[0] - schlange[1];
  }
  return richtung.ds + richtung.dz * breite;
}

/* Die Schwanzspitze zeigt vom Körper weg. */

function schwanzRichtung() {
  const letztes = schlange.length - 1;
  return schlange[letztes] - schlange[letztes - 1];
}

/* --- Das Feld anmalen --- */

function zeichnen() {

  // Zuerst alles löschen, dann neu anmalen. 225 Kästchen sind
  // so wenig, dass sich Feineres nicht lohnt.
  for (let i = 0; i < felder.length; i++) {
    felder[i].className = "kaestchen";
    felder[i].innerHTML = "";
  }

  for (let i = 0; i < schlange.length; i++) {

    const kaestchen = felder[schlange[i]];

    if (i === 0) {

      // Das erste Stück ist der Kopf.
      kaestchen.className = "kaestchen kopf " +
        richtungsKlasse(kopfRichtung());
      kaestchen.innerHTML = KOPF_BILD;

    } else if (i === schlange.length - 1) {

      // Das letzte ist der Schwanz.
      kaestchen.className = "kaestchen schwanz " +
        richtungsKlasse(schwanzRichtung());
      kaestchen.innerHTML = SCHWANZ_BILD;

    } else {
      kaestchen.className = "kaestchen koerper";
    }
  }

  // Und zuletzt die Äpfel.
  for (let i = 0; i < futter.length; i++) {
    felder[futter[i]].className = "kaestchen apfel";
    felder[futter[i]].innerHTML = "&#127822;";
  }
}

/* --- Welche Kästchen sind frei? ---
   Frei heisst: keine Schlange und kein Apfel drauf. */

function freieKaestchen() {

  const frei = [];

  for (let i = 0; i < breite * hoehe; i++) {
    if (schlange.indexOf(i) === -1 && futter.indexOf(i) === -1) {
      frei.push(i);
    }
  }

  return frei;
}

/* --- Äpfel nachlegen ---
   Es sollen immer «anzahlFutter» Stück auf dem Feld liegen.
   Wird einer gefressen, kommt sofort ein neuer dazu.

   Wir sammeln zuerst alle freien Kästchen ein und ziehen
   dann eines. Das ist sicherer als «würfeln bis es passt» -
   dieses Würfeln würde immer länger dauern, je voller das
   Feld wird. Ist gar nichts mehr frei, hören wir einfach auf. */

function futterAuffuellen() {

  while (futter.length < anzahlFutter) {

    const frei = freieKaestchen();

    if (frei.length === 0) {
      return;
    }

    futter.push(frei[Math.floor(Math.random() * frei.length)]);
  }
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

  futter = [];
  futterAuffuellen();

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

  // Liegt auf dem neuen Kästchen ein Apfel? indexOf gibt
  // seinen Platz in der Liste zurück, oder -1.
  const apfelPlatz = futter.indexOf(neu);
  const frisst = (apfelPlatz >= 0);

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
    // Den gefressenen Apfel wegnehmen und einen neuen legen.
    futter.splice(apfelPlatz, 1);
    futterAuffuellen();

    // Ganzes Feld voll? Das ist der perfekte Sieg.
    if (schlange.length === breite * hoehe) {
      gewonnen();
      return;
    }

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

  zeichnen();
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
      "<div>Eine Runde kostet " + kosten + punkteWort(kosten) + ". Du hast " +
      punkteVon(name) + ".<br>Spiel ein Quiz, ein Memory oder Hangman!</div>" +
      '<button class="tafelknopf" disabled>Losspielen</button>';
    tafel.classList.remove("weg");
    return;
  }

  // Der Satz mit dem Preis heisst anders, wenn es gratis ist.
  let preis = "Eine Runde kostet " + kosten + punkteWort(kosten) + ".";
  if (frei === true) {
    preis = "&#128275; Dein Code gilt &ndash; noch " + gratisRennen() +
            " Runden gratis!";
  }

  tafel.innerHTML =
    "<div><strong>Bereit?</strong></div>" +
    "<div>Sammle die &Auml;pfel &#127822; ein und beiss dich nicht " +
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
    "Nochmal (" + kosten + punkteWort(kosten) + ")</button>";
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
futter = [];
zeichnen();

zeigeAnzeige();
zeigeStarttafel();
