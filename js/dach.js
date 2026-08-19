/* ============================================
   Dachheldin - ein Belohnungsspiel

   Als Superheldin von Krankenhaus zu Krankenhaus springen
   und Münzen sammeln.
   Bezahlt wird mit den Punkten aus den Lernspielen,
   genau wie beim Rennen.

   Das Neue in diesem Spiel: SCHWERKRAFT.
   Bis jetzt hat sich alles gleichmässig bewegt. Hier wird
   die Figur jeden Takt ein bisschen stärker nach unten
   gezogen - darum fliegt sie beim Sprung erst hoch,
   wird langsamer und fällt dann wieder.
   ============================================ */

/* --- Einstellungen. Hier darfst du drehen. --- */

const kosten = 1;          // Punkte pro Runde
const taktLaenge = 20;     // Millisekunden pro Takt
const startTempo = 3.2;    // Pixel pro Takt am Anfang
const maxTempo = 8;        // schneller wird es nie
const schwerkraft = 1.0;   // wie stark es nach unten zieht
const sprungKraft = 11;    // wie kräftig der Absprung ist

// Bei dieser Strecke steht das Ziel. Wer es erreicht, hat
// gewonnen und bekommt eine Gratis-Runde geschenkt.
const ziel = 800;

// Wie viele Takte vorher das Zielband ins Bild geschoben wird.
// So sieht man es kommen und kann sich freuen.
const zielVorlauf = 100;

// Wie viele Gratis-Runden es fürs Ziel gibt.
const zielBelohnung = 1;

// Die Höhe des Spielfelds. Muss zu dach.css passen!
const feldHoehe = 320;

/* Die BREITE fragen wir beim Element nach, statt sie fest
   hinzuschreiben. Auf dem Computer sind es 440 Pixel, auf dem
   Handy weniger - dort ist das Feld nur so breit wie der
   Bildschirm. Stünde hier eine feste Zahl, würden auf dem Handy
   Häuser ausserhalb des Bildes gebaut.

   Steht weiter unten, gleich nachdem wir das Element geholt haben -
   vorher gibt es ja noch nichts zu fragen. */

// Die Figur bleibt immer an derselben Stelle von links.
// Bewegt wird die Welt, nicht die Figur - so wie beim Rennen
// die Strasse.
const figurX = 80;
const figurBreite = 26;
const figurHoehe = 34;

/* --- Die Schubladen --- */

let laeuft = false;       // läuft gerade eine Runde?
let strecke = 0;          // die Punktzahl im Spiel
let muenzen = 0;          // in dieser Runde gesammelt
let tempo = startTempo;

let figurY = 0;           // oberer Rand der Figur, von oben gemessen
let vy = 0;               // Tempo nach unten. Minus heisst nach oben!
let amBoden = false;      // steht die Figur auf einem Dach?

let daecher = [];         // alle Dächer
let muenzenListe = [];    // alle Münzen, die noch herumliegen
let uhr = null;           // der Takt
let zielBand = null;      // das Zielband, solange es im Bild ist

/* faktor sagt, wie viel schneller es gerade läuft als am Anfang.
   Am Start ist er 1, beim Höchsttempo 2,5.

   Warum es ihn braucht: Wenn die Welt schneller wird, der Sprung
   aber gleich bleibt, fliegt die Figur immer weiter - irgendwann
   über jedes Dach hinweg, und dann ist kein Sprung mehr zu
   schaffen. Das habe ich beim Durchrechnen gemerkt.
   Darum wachsen Absprung und Schwerkraft mit: der Sprungbogen
   bleibt in der Stadt immer gleich lang, er geht nur schneller. */

let faktor = 1;

const feld = document.getElementById("dachfeld");
const feldBreite = feld.clientWidth;
const figur = document.getElementById("figur");
const tafel = document.getElementById("tafel");

/* --- Anzeige oben --- */

function zeigeAnzeige() {
  document.getElementById("anzeige").innerHTML =
    "Strecke: " + Math.floor(strecke) + " / " + ziel +
    " &nbsp;·&nbsp; &#129689; " + muenzen +
    " &nbsp;·&nbsp; Rekord &#129689; " + rekordVon("dach-muenzen");
}

/* --- Die Tafel vor dem Start --- */

function zeigeStarttafel() {

  const name = angemeldeterSpieler();

  // Liegt ein Gratis-Ticket vom Code-Feld bereit? Dann braucht
  // es weder Anmeldung noch Punkte.
  const frei = codeIstFrei();

  if (name === null && frei === false) {
    tafel.innerHTML =
      "<div><strong>Erst anmelden</strong></div>" +
      "<div>Melde dich oben an, dann kannst du mit deinen Punkten " +
      "eine Runde bezahlen.</div>" +
      '<button class="tafelknopf" disabled>Springen</button>';
    return;
  }

  if (frei === false && punkteVon(name) < kosten) {
    tafel.innerHTML =
      "<div><strong>Zu wenig Punkte</strong></div>" +
      "<div>Eine Runde kostet " + kosten + punkteWort(kosten) + ". Du hast " +
      punkteVon(name) + ".<br>" + lernspieleHinweis() + "</div>" +
      '<button class="tafelknopf" disabled>Springen</button>';
    return;
  }

  let preis = "Eine Runde kostet " + kosten + punkteWort(kosten) + ".";
  if (frei === true) {
    preis = "&#128275; Dein Code gilt &ndash; noch " + gratisRennen() +
            " Runden gratis!";
  }

  tafel.innerHTML =
    "<div><strong>Bereit?</strong></div>" +
    "<div>Spring von Krankenhaus zu Krankenhaus und sammle " +
    "Münzen &#129689;." +
    "<br>Fällst du in eine Lücke, ist die Runde vorbei." +
    "<br>" + preis + "</div>" +
    '<button class="tafelknopf" onclick="starten()">Springen</button>';
}

/* --- Losspringen --- */

function starten() {

  // Den Knopf «loslassen». Sonst würde die Leertaste, mit der
  // man springt, immer wieder diesen Knopf drücken.
  if (document.activeElement !== null) {
    document.activeElement.blur();
  }

  // Läuft schon eine Runde? Dann nichts machen.
  if (laeuft === true) {
    return;
  }

  clearInterval(uhr);

  // Erst bezahlen. Klappt das nicht, geht es nicht los.
  if (punkteAbziehen(kosten) === false) {
    zeigeStarttafel();
    return;
  }

  // Alles zurücksetzen
  aufraeumenFeld();

  laeuft = true;
  strecke = 0;
  muenzen = 0;
  tempo = startTempo;
  faktor = 1;
  vy = 0;

  // Das erste Dach ist extra breit - so hat man Zeit,
  // sich zurechtzufinden, bevor die erste Lücke kommt.
  erstesDach();

  // Die Figur steht auf dem ersten Dach.
  figurY = feldHoehe - 120 - figurHoehe;
  amBoden = true;

  figur.style.left = figurX + "px";
  figur.style.top = figurY + "px";

  // Die Zeichnung wieder zeigen (nach einem Absturz war sie weg).
  figur.classList.remove("abgestuerzt");

  tafel.classList.add("weg");

  zeigeAnzeige();

  uhr = setInterval(takt, taktLaenge);
}

/* --- Das erste, breite Dach --- */

function erstesDach() {
  dachHinstellen(0, 210, 120);
}

/* --- Ein Dach ins Feld stellen ---
   x = wie weit von links, breite und hoehe in Pixeln.
   Die Dächer stehen unten am Feldrand, darum genügt die Höhe -
   das «bottom: 0» steht im CSS. */

function dachHinstellen(x, breite, hoehe) {

  const element = document.createElement("div");
  element.className = "dach";
  element.style.left = x + "px";
  element.style.width = breite + "px";
  element.style.height = hoehe + "px";
  feld.appendChild(element);

  const dach = { element: element, x: x, breite: breite, hoehe: hoehe };
  daecher.push(dach);

  return dach;
}

/* --- Rechts ein neues Dach anhängen ---
   Die Lücke und der Höhenunterschied sind absichtlich begrenzt.
   Ohne Grenze käme irgendwann ein Sprung, den man gar nicht
   schaffen kann - das wäre unfair, genau wie beim Rennen
   ein Rennen ohne einen einzigen Stern. */

function neuesDachAnhaengen() {

  let letzteKante = 0;
  let letzteHoehe = 120;

  if (daecher.length > 0) {
    const letztes = daecher[daecher.length - 1];
    letzteKante = letztes.x + letztes.breite;
    letzteHoehe = letztes.hoehe;
  }

  // Die Lücke: 40 bis 57 Pixel. Der Sprungbogen ist 70 Pixel lang,
  // also passt jede Lücke bequem.
  //
  // Warum nicht noch enger? Die Heldin ist 26 Pixel breit. Bei einer
  // Lücke unter etwa 30 Pixeln würde sie auf zwei Dächern gleichzeitig
  // stehen - und dann weiss dachUnter() nicht mehr, welches gilt.
  // Ich habe 30 Pixel durchgerechnet: da ist sie an einer Hauswand
  // hängen geblieben. 40 ist die sichere Untergrenze.
  const luecke = 40 + Math.floor(Math.random() * 18);

  // Die neue Höhe: höchstens 30 Pixel höher, aber bis 40 tiefer.
  // Nach oben weniger als nach unten, weil der Sprung nur etwa
  // 60 Pixel hoch geht - hinauf ist schwerer als hinunter.
  let hoehe = letzteHoehe + (Math.floor(Math.random() * 71) - 40);

  if (hoehe < 60) {
    hoehe = 60;
  }
  if (hoehe > 190) {
    hoehe = 190;
  }

  // Die Dächer sind breiter als der Sprungbogen (70). Sonst würde
  // man über ein schmales Dach hinwegfliegen und käme nie darauf.
  const breite = 90 + Math.floor(Math.random() * 61);

  const dach = dachHinstellen(letzteKante + luecke, breite, hoehe);

  // Auf etwa jedes zweite Dach kommt eine Münze.
  if (Math.random() < 0.55) {
    muenzeHinstellen(dach);
  }
}

/* --- Eine Münze über ein Dach legen --- */

function muenzeHinstellen(dach) {

  // Nicht ganz an den Rand, sonst ist sie kaum erreichbar.
  const x = dach.x + 14 + Math.floor(Math.random() * (dach.breite - 40));
  const y = feldHoehe - dach.hoehe - 44;

  const element = document.createElement("div");
  element.className = "muenze";
  element.innerHTML = "&#129689;";
  element.style.left = x + "px";
  element.style.top = y + "px";
  feld.appendChild(element);

  muenzenListe.push({ element: element, x: x, y: y });
}

/* --- Ein Takt: das Herz vom Spiel ---
   50 Mal pro Sekunde. Jedes Mal rückt alles ein Stück. */

function takt() {

  strecke = strecke + 1;

  // Langsam schneller werden - aber nur bis maxTempo.
  tempo = startTempo + strecke / 900;
  if (tempo > maxTempo) {
    tempo = maxTempo;
  }

  faktor = tempo / startTempo;

  daecherBewegen();
  muenzenBewegen();
  zielBandBewegen();

  // Solange rechts Platz ist, ein neues Dach anhängen.
  while (rechteKante() < feldBreite + 80) {
    neuesDachAnhaengen();
  }

  // Kommt das Ziel bald? Dann das Zielband ins Bild schieben.
  if (zielBand === null && strecke >= ziel - zielVorlauf) {
    zielBandSetzen();
  }

  schwerkraftAnwenden();

  // Aus dem Bild gefallen?
  if (figurY > feldHoehe) {
    verloren();
    return;
  }

  muenzenEinsammeln();
  zeigeAnzeige();

  // Ziel erreicht? Das kommt zuletzt - so zählt eine Münze
  // direkt beim Zielband noch mit.
  if (strecke >= ziel) {
    geschafft();
  }
}

/* --- Das Zielband ins Bild stellen ---
   Es soll genau dann bei der Heldin sein, wenn die Strecke
   1000 erreicht. Darum die Rechnung: noch zu laufende Takte
   mal Tempo = so weit rechts muss es stehen. */

function zielBandSetzen() {

  const x = figurX + (ziel - strecke) * tempo;

  const element = document.createElement("div");
  element.className = "ziel";
  element.innerHTML = '<span class="ziel-band">&#127937; ZIEL</span>';
  element.style.left = x + "px";
  feld.appendChild(element);

  zielBand = { element: element, x: x };
}

function zielBandBewegen() {

  if (zielBand === null) {
    return;
  }

  zielBand.x = zielBand.x - tempo;
  zielBand.element.style.left = zielBand.x + "px";
}

/* --- Wo endet das letzte Dach? --- */

function rechteKante() {
  if (daecher.length === 0) {
    return 0;
  }
  const letztes = daecher[daecher.length - 1];
  return letztes.x + letztes.breite;
}

/* --- Alle Dächer nach links schieben ---
   Von hinten durchgehen! Wer vorne etwas aus der Liste
   entfernt, verschiebt alle dahinter. Gleicher Grund
   wie bei den Hindernissen im Rennen. */

function daecherBewegen() {

  for (let i = daecher.length - 1; i >= 0; i--) {

    const dach = daecher[i];

    dach.x = dach.x - tempo;
    dach.element.style.left = dach.x + "px";

    // Links hinausgeschoben? Dann wegräumen.
    if (dach.x + dach.breite < -30) {
      dach.element.remove();
      daecher.splice(i, 1);
    }
  }
}

function muenzenBewegen() {

  for (let i = muenzenListe.length - 1; i >= 0; i--) {

    const muenze = muenzenListe[i];

    muenze.x = muenze.x - tempo;
    muenze.element.style.left = muenze.x + "px";

    if (muenze.x < -30) {
      muenze.element.remove();
      muenzenListe.splice(i, 1);
    }
  }
}

/* --- Auf welchem Dach steht die Figur gerade? ---
   Gibt das Dach zurück, das unter ihr liegt - oder null,
   wenn dort eine Lücke ist. */

function dachUnter() {

  for (let i = 0; i < daecher.length; i++) {

    const dach = daecher[i];

    if (figurX + figurBreite > dach.x && figurX < dach.x + dach.breite) {
      return dach;
    }
  }

  return null;
}

/* --- Die Schwerkraft ---
   Das Herzstück. vy ist das Tempo nach unten. Jeden Takt kommt
   ein bisschen dazu - darum wird die Figur beim Steigen
   langsamer und beim Fallen schneller. */

function schwerkraftAnwenden() {

  // Wo waren die Füsse vorher? Das brauchen wir, um zu erkennen,
  // ob die Figur gerade durch eine Dachkante gefallen ist.
  const alteFuesse = figurY + figurHoehe;

  // faktor zweimal, weil die Schwerkraft im Quadrat mitwachsen
  // muss - nur so bleibt der Sprungbogen gleich lang.
  vy = vy + schwerkraft * faktor * faktor;
  figurY = figurY + vy;

  const neueFuesse = figurY + figurHoehe;

  const dach = dachUnter();
  amBoden = false;

  if (dach !== null) {

    // Wie weit oben ist die Dachfläche?
    const dachOben = feldHoehe - dach.hoehe;

    if (alteFuesse <= dachOben && neueFuesse >= dachOben) {

      // Landen: genau auf die Dachfläche setzen und stoppen.
      figurY = dachOben - figurHoehe;
      vy = 0;
      amBoden = true;

    } else if (neueFuesse > dachOben + 6) {

      // Wir sind seitlich in die Hauswand geknallt -
      // der Sprung war zu kurz oder zu tief.
      verloren();
      return;
    }
  }

  figur.style.top = figurY + "px";
}

/* --- Springen ---
   Nur wenn man auf einem Dach steht. So gibt es keinen
   Doppelsprung mitten in der Luft. */

function springen() {

  if (laeuft === false) {
    return;
  }

  if (amBoden === false) {
    return;
  }

  // Minus heisst nach oben. Der Absprung wächst mit dem Tempo mit.
  vy = -sprungKraft * faktor;
  amBoden = false;
}

/* --- Münzen einsammeln --- */

function muenzenEinsammeln() {

  for (let i = muenzenListe.length - 1; i >= 0; i--) {

    const muenze = muenzenListe[i];

    // Berühren sich Figur und Münze? Die Münze ist 24 Pixel gross.
    const trifftX = figurX + figurBreite > muenze.x &&
                    figurX < muenze.x + 24;
    const trifftY = figurY + figurHoehe > muenze.y &&
                    figurY < muenze.y + 24;

    if (trifftX === true && trifftY === true) {

      muenzen = muenzen + 1;

      muenze.element.remove();
      muenzenListe.splice(i, 1);

      // Sofort aufs Konto - so zählt die Leiste ganz oben mit.
      // Gibt false zurück, wenn niemand angemeldet ist; dann
      // zählt die Münze nur in dieser Runde.
      muenzenDazu(1);
    }
  }
}

/* --- Der Knopf «Nochmal» ---
   Beide Schlusstafeln brauchen ihn - die vom Absturz und die
   vom Ziel. Darum ein eigener Befehl: ein Befehl, eine Aufgabe. */

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

/* --- Ehrlicher Hinweis für Nichtangemeldete --- */

function muenzHinweis() {

  if (angemeldeterSpieler() !== null) {
    return "";
  }

  return "<br><small>Melde dich oben an, dann werden deine " +
         "Münzen gespeichert.</small>";
}

/* --- Im Ziel! ---
   Die Belohnung fürs Durchhalten. */

function geschafft() {

  // Schon fertig? Dann nicht zweimal belohnen.
  if (laeuft === false) {
    return;
  }

  laeuft = false;
  clearInterval(uhr);

  // Konfetti! Es fällt von oben nach unten über die ganze Seite.
  // Der Befehl steht in js/konfetti.js.
  konfetti(150, 9000);

  // Die Belohnung: eine Gratis-Runde. Steht in js/punkte.js -
  // dort wird sie auch gleich in die Leiste oben geschrieben.
  gratisRundenDazu(zielBelohnung);

  // «1 Gratis-Runde» aber «2 Gratis-Runden» - das Wort muss passen.
  let wort = " Gratis-Runden";
  if (zielBelohnung === 1) {
    wort = " Gratis-Runde";
  }

  const istRekord = rekordSpeichern("dach-muenzen", muenzen);

  let zusatz = "";
  if (istRekord === true) {
    zusatz = "<br>Neuer Münz-Rekord!";
  }

  tafel.innerHTML =
    "<div><strong>&#127937; Im Ziel!</strong></div>" +
    "<div>Du hast die " + ziel + " geschafft!" +
    "<br>&#129689; Münzen: " + muenzen + zusatz +
    "<br>&#128275; Du bekommst " + zielBelohnung + wort + "!" +
    muenzHinweis() + "</div>" +
    nochmalKnopf();

  tafel.classList.remove("weg");

  zeigeAnzeige();
}

/* --- Verloren --- */

function verloren() {

  // Schon fertig? Dann nichts mehr machen.
  if (laeuft === false) {
    return;
  }

  laeuft = false;
  clearInterval(uhr);

  // Zeichnung verstecken, Explosion zeigen. Macht das CSS.
  figur.classList.add("abgestuerzt");

  const istRekord = rekordSpeichern("dach-muenzen", muenzen);

  let zusatz = "";
  if (istRekord === true) {
    zusatz = "<br>Neuer Münz-Rekord!";
  }

  // Wie weit war es noch bis zum Ziel?
  const fehlt = ziel - Math.floor(strecke);

  tafel.innerHTML =
    "<div><strong>Abgestürzt!</strong></div>" +
    "<div>Strecke: " + Math.floor(strecke) + " von " + ziel +
    "<br>Nur noch " + fehlt + " bis zum Ziel!" +
    "<br>&#129689; Münzen: " + muenzen + zusatz +
    muenzHinweis() + "</div>" +
    nochmalKnopf();

  tafel.classList.remove("weg");

  zeigeAnzeige();
}

/* --- Spielfeld leer machen --- */

function aufraeumenFeld() {

  for (let i = 0; i < daecher.length; i++) {
    daecher[i].element.remove();
  }
  daecher = [];

  for (let i = 0; i < muenzenListe.length; i++) {
    muenzenListe[i].element.remove();
  }
  muenzenListe = [];

  // Das Zielband auch weg, sonst stünde es beim Neustart
  // mitten im Bild.
  if (zielBand !== null) {
    zielBand.element.remove();
    zielBand = null;
  }
}

/* --- Steuern mit der Tastatur ---
   Leertaste oder Pfeil nach oben. preventDefault ist hier
   besonders wichtig: die Leertaste würde die Seite sonst
   nach unten scrollen. */

document.onkeydown = function (taste) {

  // Wer gerade oben seinen Namen eintippt, soll mit dem
  // Leerschlag nicht plötzlich springen.
  if (taste.target.tagName === "INPUT") {
    return;
  }

  // Die Leertaste heisst in JavaScript " " - also ein Text mit
  // einem Leerschlag darin. taste.code === "Space" fragt dasselbe
  // noch einmal anders. Beides, damit es in jedem Browser klappt.
  const leertaste = taste.key === " " || taste.code === "Space";

  if (leertaste === true || taste.key === "ArrowUp") {

    // preventDefault ist hier doppelt wichtig: die Leertaste
    // würde sonst die Seite nach unten scrollen UND einen
    // angeklickten Knopf gleich nochmal drücken.
    taste.preventDefault();

    /* Laeuft noch keine Runde? Dann STARTET die Leertaste -
       genau wie beim Rennen und bei Snake. Erst waehrend der
       Runde springt sie. Vorher konnte man die Dachheldin als
       einziges Spiel nicht mit der Leertaste beginnen. */

    if (laeuft === false) {
      starten();
    } else {
      springen();
    }
  }
};

/* --- Los geht's --- */

zeigeAnzeige();
zeigeStarttafel();
