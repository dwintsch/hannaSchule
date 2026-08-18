/* ============================================
   Das Rennen - ein Belohnungsspiel
   Bezahlt wird mit den Punkten aus den Lernspielen.
   ============================================ */

/* --- Einstellungen. Hier darfst du drehen. --- */

const kosten = 1;          // Punkte pro Runde
const spurBreite = 100;    // eine Spur ist 100 Pixel breit
const startTempo = 4;      // Pixel pro Takt am Anfang
const taktLaenge = 20;     // Millisekunden pro Takt

// Wo das Bett steht (von oben gemessen)
const bettOben = 350;
const bettUnten = 400;

/* --- Die Hindernisse ---
   Lauter Sachen aus dem Spital. Neue duerfen frei dazu:
   ein Zeichen (bild) und wie es in der Schlussmeldung heisst
   (name). Der Name steht schon im vierten Fall da -
   «Du bist in EINE Spritze gefahren», aber «in EIN Pflaster».
   So braucht es keine Grammatik im Code. */

const hindernisse = [
  { bild: "&#128137;", name: "eine Spritze" },
  { bild: "&#128138;", name: "eine Tablette" },
  { bild: "&#129657;", name: "ein Pflaster" }
];

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
const bett = document.getElementById("bett");
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

  // Ist der Code an? Dann braucht es weder Anmeldung
  // noch Punkte - die zwei Prüfungen darunter überspringen wir.
  const frei = codeIstFrei();

  if (name === null && frei === false) {
    tafel.innerHTML =
      "<div><strong>Erst anmelden</strong></div>" +
      "<div>Melde dich oben an, dann kannst du mit deinen Punkten " +
      "ein Rennen bezahlen.</div>" +
      '<button class="tafelknopf" disabled>Rennen starten</button>';
    return;
  }

  if (frei === false && punkteVon(name) < kosten) {
    tafel.innerHTML =
      "<div><strong>Zu wenig Punkte</strong></div>" +
      "<div>Ein Rennen kostet " + kosten + punkteWort(kosten) + ". Du hast " +
      punkteVon(name) + ".<br>Spiel ein Quiz, ein Memory oder Hangman!</div>" +
      '<button class="tafelknopf" disabled>Rennen starten</button>';
    return;
  }

  // Der Satz mit dem Preis heisst anders, wenn es gratis ist.
  let preis = "Ein Rennen kostet " + kosten + punkteWort(kosten) + ".";
  if (frei === true) {
    preis = "&#128275; Dein Code gilt &ndash; noch " + gratisRennen() +
            " Rennen gratis!";
  }

  tafel.innerHTML =
    "<div><strong>Bereit?</strong></div>" +
    "<div>Fahr um die Spitalsachen herum: Spritzen &#128137;, " +
    "Tabletten &#128138; und Pflaster &#129657;." +
    "<br>Ein Stern &#11088; gibt dir einen Schutzschild." +
    "<br>" + preis + "</div>" +
    '<button class="tafelknopf" onclick="starten()">Rennen starten</button>' +
    '<div class="tastenhinweis">oder einfach die Leertaste drücken</div>';
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

  bett.style.left = spur * spurBreite + "px";
  bett.classList.remove("zusammenstoss");   // den Knall wieder wegnehmen
  bett.classList.remove("geschuetzt");
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

    // Berühren sich Bett und Ding?
    const trifftSpur = ding.spur === spur;
    const trifftHoehe = ding.y + 44 > bettOben && ding.y < bettUnten;

    if (trifftSpur === true && trifftHoehe === true) {

      if (ding.art === "stern") {

        // Ein Stern gibt einen Schutzschild.
        // Hat man schon einen, gibt es stattdessen Strecke -
        // so ist der Stern nie umsonst.
        if (schutz === false) {
          schutz = true;
          bett.classList.add("geschuetzt");
        } else {
          strecke = strecke + 50;
        }

        wegnehmen(i);

      } else {

        if (schutz === true) {

          // Der Schild wird verbraucht: einmal durchfahren.
          schutz = false;
          bett.classList.remove("geschuetzt");
          wegnehmen(i);

        } else {
          verloren(ding.name);
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
  let bild = "";
  let name = "";

  if (Math.random() < 0.25 || dingeOhneStern >= 4) {
    art = "stern";
    bild = "&#11088;";             // Stern
    dingeOhneStern = 0;
  } else {

    // Eines aus der Liste ganz oben, zufaellig ausgesucht.
    // Math.random gibt eine Kommazahl zwischen 0 und 1.
    // Mal der Laenge und abgerundet ergibt das eine
    // gueltige Platznummer in der Liste.
    const welches = hindernisse[Math.floor(Math.random() * hindernisse.length)];

    bild = welches.bild;
    name = welches.name;
    dingeOhneStern = dingeOhneStern + 1;
  }

  const neueSpur = Math.floor(Math.random() * 3);

  const element = document.createElement("div");
  element.className = "ding";
  element.innerHTML = bild;
  element.style.left = neueSpur * spurBreite + "px";
  element.style.top = "-50px";
  feld.appendChild(element);

  dinger.push({ element: element, spur: neueSpur, y: -50, art: art,
    name: name });
}

/* --- Steuern --- */

function nachLinks() {
  if (laeuft === false) {
    return;
  }
  if (spur > 0) {
    spur = spur - 1;
    bett.style.left = spur * spurBreite + "px";
  }
}

function nachRechts() {
  if (laeuft === false) {
    return;
  }
  if (spur < 2) {
    spur = spur + 1;
    bett.style.left = spur * spurBreite + "px";
  }
}

/* --- Die Tastatur ---

   Zuerst eine Frage: Tippt gerade jemand in ein Feld?
   Oben in der Leiste stehen Name und Passwort. Ohne diese
   Pruefung wuerde die Leertaste im Passwortfeld das Rennen
   starten, statt einen Leerschlag zu machen - und die
   Pfeiltasten koennte man dort nicht mehr brauchen. */

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
    nachLinks();
  }

  if (taste.key === "ArrowRight") {
    taste.preventDefault();
    nachRechts();
  }

  /* Die Leertaste startet das Rennen.

     preventDefault ist hier Pflicht. Ohne es passierten zwei
     Dinge auf einmal: die Seite wuerde scrollen, UND der
     Startknopf - der ja gerade den Fokus hat - wuerde nochmal
     ausgeloest. Denselben Fehler gab es schon bei der
     Dachheldin mit dem Springen. */

  if (taste.key === " ") {
    taste.preventDefault();

    if (laeuft === false) {
      starten();
    }
  }
};

/* --- Verloren --- */

function verloren(worein) {

  laeuft = false;
  clearInterval(uhr);        // den Takt abstellen

  // Nur verstecken, nicht ueberschreiben - sonst waere die
  // Zeichnung weg und beim naechsten Start nicht mehr da.
  bett.classList.add("zusammenstoss");

  const istRekord = rekordSpeichern("rennen", strecke);

  let zusatz = "";
  if (istRekord === true) {
    zusatz = "<br>Neuer Rekord!";
  }

  const frei = codeIstFrei();

  let knopf = '<button class="tafelknopf" onclick="starten()">' +
              "Nochmal (" + kosten + punkteWort(kosten) + ")</button>";

  if (frei === true) {
    knopf = '<button class="tafelknopf" onclick="starten()">' +
            "Nochmal (noch " + gratisRennen() + " gratis)</button>";
  } else {
    const name = angemeldeterSpieler();
    if (name === null || punkteVon(name) < kosten) {
      knopf = '<button class="tafelknopf" disabled>Zu wenig Punkte</button>';
    }
  }

  // Steht ausnahmsweise nichts da, lassen wir den Satz weg.
  let hineingefahren = "";
  if (worein) {
    hineingefahren = "<div>Du bist in " + worein + " gefahren.</div>";
  }

  tafel.innerHTML =
    "<div><strong>Erwischt!</strong></div>" +
    hineingefahren +
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
