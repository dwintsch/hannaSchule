/* ============================================
   Suchsel
   Organe in einem Gitter aus Buchstaben suchen.

   «Suchsel» ist der Fachbegriff für genau das: ein Gitter
   voller Buchstaben, in dem Wörter versteckt sind.
   ============================================ */

/* --- Die Wörter. HIER darfst du ändern. ---

   Regeln, damit es aufgeht:
   · GROSSBUCHSTABEN
   · keine Umlaute (ein Ä bräuchte ein eigenes Feld im Gitter)
   · keine Leerschläge und keine Bindestriche
   · höchstens so lang wie das Gitter breit ist (also 12)

   Im Moment sind es genau so viele, wie pro Runde versteckt
   werden (anzahlWoerter). Anders wird jede Runde trotzdem:
   die Wörter landen jedes Mal woanders im Gitter.

   Schreibst du mehr dazu, werden pro Runde nur noch
   anzahlWoerter davon ausgesucht - dann wechseln auch die
   Wörter selber. */

const organe = [
  "GEHIRN", "HERZ", "LUNGE", "LEBER", "NIERE", "MAGEN", "DARM", "HAUT"
];

/* --- Einstellungen. Hier darfst du drehen. --- */

const anzahlWoerter = 8;   // wie viele pro Runde versteckt werden
const spalten = 12;        // Breite des Gitters
const zeilen = 12;         // Höhe des Gitters
const belohnung = 1;       // Punkte, wenn ALLE gefunden sind

/* In welche Richtungen ein Wort liegen darf.
   ds = Schritt zur Seite, dz = Schritt nach unten.

   Nur waagrecht und senkrecht - wie in einem richtigen
   Suchsel. Schräg gab es kurz, wurde aber wieder
   herausgenommen.

   Auch kein Rückwärts: ein Wort von hinten zu lesen ist
   viel schwerer und macht keinen Spass mehr. */

const richtungen = [
  { ds: 1, dz: 0 },   // waagrecht nach rechts
  { ds: 0, dz: 1 }    // senkrecht nach unten
];

const buchstaben = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/* --- Die Schubladen --- */

let gitter = [];       // ein Buchstabe pro Feld
let gesucht = [];      // die versteckten Wörter mit ihren Feldern
let ersteWahl = null;  // welches Feld zuerst angeklickt wurde
let fertig = false;    // sind schon alle gefunden?

/* --- Eine Liste durchmischen ---
   Von hinten nach vorne durchgehen und jedes Stück mit einem
   zufälligen davor tauschen. So kommt jede Reihenfolge gleich
   oft vor - beim naiven «zufällig ziehen» wäre das nicht so. */

function mischen(liste) {

  for (let i = liste.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    const merken = liste[i];
    liste[i] = liste[j];
    liste[j] = merken;
  }

  return liste;
}

/* --- Von Zeile und Spalte zur Feldnummer ---

   Das Gitter ist in Wahrheit eine einzige lange Liste.
   Feld 0 ist oben links, Feld 12 ist der Anfang der zweiten
   Zeile. Diese Rechnung übersetzt zwischen beidem. */

function nummerVon(spalte, zeile) {
  return zeile * spalten + spalte;
}

/* --- Wie viele Kreuzungen soll es mindestens geben? ---

   Eine Kreuzung ist ein Kaestchen, das zu ZWEI Woertern
   gehoert - der gemeinsame Buchstabe.

   Ohne diese Vorgabe lagen die Woerter fast immer einfach
   nebeneinander: gemessen hatten 79 von 100 Raetseln gar
   keine einzige Kreuzung. Das war zu leicht.

   Hier darfst du drehen: 0 = wie frueher, 3 = noch
   verzwickter. Zu hoch geht nicht - bei acht kurzen
   Woertern ist irgendwann kein Platz mehr. */

const mindestensKreuzungen = 2;

/* --- Ein Wort ins Gitter legen ---

   Wir schauen ALLE moeglichen Stellen an, nicht nur ein paar
   zufaellige. Das sind hoechstens 2 Richtungen mal 12 mal 12
   = 288 Stueck - fuer den Computer nichts.

   Dabei entstehen zwei Stapel:
     mitKreuzung  - hier beruehrt das Wort ein anderes
     ohneKreuzung - hier steht es fuer sich allein

   Passen heisst: jedes Kaestchen ist leer, ODER es steht
   schon genau derselbe Buchstabe drin. Der zweite Fall ist
   die Kreuzung.

   «bevorzugeKreuzung» sagt: nimm wenn moeglich eine Stelle
   vom ersten Stapel. So bekommen wir gezielt Kreuzungen,
   statt darauf zu hoffen.

   Gibt null zurueck, wenn das Wort nirgends passt. */

function wortLegen(wort, bevorzugeKreuzung) {

  const mitKreuzung = [];
  const ohneKreuzung = [];

  for (let r = 0; r < richtungen.length; r++) {

    const richtung = richtungen[r];

    // Wie weit darf der Anfang hoechstens rechts bzw. unten
    // sein, damit das Wort noch ganz ins Gitter passt?
    const platzS = spalten - (wort.length - 1) * richtung.ds;
    const platzZ = zeilen - (wort.length - 1) * richtung.dz;

    for (let startZ = 0; startZ < platzZ; startZ++) {
      for (let startS = 0; startS < platzS; startS++) {

        const felder = [];
        let passt = true;
        let kreuzt = 0;

        for (let i = 0; i < wort.length; i++) {

          const nr = nummerVon(startS + i * richtung.ds,
            startZ + i * richtung.dz);

          if (gitter[nr] !== "" && gitter[nr] !== wort[i]) {
            passt = false;
            break;
          }

          // Steht schon derselbe Buchstabe da? Dann kreuzen
          // sich hier zwei Woerter.
          if (gitter[nr] === wort[i]) {
            kreuzt = kreuzt + 1;
          }

          felder.push(nr);
        }

        if (passt === false) {
          continue;
        }

        if (kreuzt > 0) {
          mitKreuzung.push(felder);
        } else {
          ohneKreuzung.push(felder);
        }
      }
    }
  }

  /* Welchen Stapel nehmen wir? Wenn Kreuzungen erwuenscht
     sind und es welche gibt, den ersten. Sonst den zweiten -
     und wenn der leer ist, doch den ersten. */

  let auswahl = ohneKreuzung;

  if (bevorzugeKreuzung === true && mitKreuzung.length > 0) {
    auswahl = mitKreuzung;
  }

  if (auswahl.length === 0) {
    auswahl = (ohneKreuzung.length > 0) ? ohneKreuzung : mitKreuzung;
  }

  if (auswahl.length === 0) {
    return null;   // nirgends Platz
  }

  const felder = auswahl[Math.floor(Math.random() * auswahl.length)];

  // Jetzt erst wirklich hineinschreiben.
  for (let i = 0; i < wort.length; i++) {
    gitter[felder[i]] = wort[i];
  }

  return felder;
}

/* --- Wie viele Kaestchen gehoeren zu mehr als einem Wort? --- */

function kreuzungenZaehlen(liste) {

  const wieOft = {};

  for (let i = 0; i < liste.length; i++) {
    for (let j = 0; j < liste[i].felder.length; j++) {
      const nr = liste[i].felder[j];
      wieOft[nr] = (wieOft[nr] || 0) + 1;
    }
  }

  let anzahl = 0;

  for (const nr in wieOft) {
    if (wieOft[nr] > 1) {
      anzahl = anzahl + 1;
    }
  }

  return anzahl;
}

/* --- Ein Gitter bauen und die Wörter hineinlegen ---

   Gibt die Liste der Wörter zurück, die WIRKLICH Platz
   gefunden haben. Das können weniger sein als gewünscht.

   Die langen Wörter kommen zuerst dran. Warum? Ein Wort mit
   11 Buchstaben passt schräg nur an ganz wenige Stellen -
   ist das Gitter schon halb voll, findet es keinen Platz
   mehr. Ein kurzes Wort findet dagegen fast immer noch eine
   Lücke. Also die schwierigen zuerst. */

function gitterBauen(auswahl) {

  gitter = [];

  for (let i = 0; i < spalten * zeilen; i++) {
    gitter.push("");
  }

  // sort ordnet die Liste um. b.length - a.length heisst:
  // das längere zuerst. slice() macht vorher eine Kopie,
  // damit die übergebene Liste nicht durcheinandergerät.
  const nachLaenge = auswahl.slice().sort(function (a, b) {
    return b.length - a.length;
  });

  const drin = [];

  for (let i = 0; i < nachLaenge.length; i++) {

    /* Solange wir noch zu wenige Kreuzungen haben, suchen wir
       fuer dieses Wort gezielt eine Stelle, wo es ein anderes
       beruehrt. Sind genug beisammen, darf es wieder irgendwo
       liegen - sonst kleben am Schluss alle Woerter in einer
       Ecke zusammen, und das waere wieder leichter. */

    const brauchtNoch = kreuzungenZaehlen(drin) < mindestensKreuzungen;

    const felder = wortLegen(nachLaenge[i], brauchtNoch);

    if (felder !== null) {
      drin.push({ wort: nachLaenge[i], felder: felder, gefunden: false });
    }
  }

  return drin;
}

/* --- Eine neue Runde --- */

function neuesSpiel() {

  gesucht = [];
  ersteWahl = null;
  fertig = false;

  // Aus allen Organen ein paar auswählen.
  const auswahl = mischen(organe.slice()).slice(0, anzahlWoerter);

  /* Bis zu 20 Anläufe für ein Gitter, in dem ALLE Wörter
     Platz haben. Beim ersten Anlauf klappt es fast immer;
     ab und zu verbaut sich das Gitter aber selber, und dann
     fehlte ohne diese Schleife einfach ein Wort.

     20 ist eine Notbremse: ohne Obergrenze könnte die
     Schleife ewig laufen, wenn jemand die Wörter einmal zu
     lang macht. Dann spielt man halt mit einem weniger. */

  for (let anlauf = 0; anlauf < 20; anlauf++) {

    gesucht = gitterBauen(auswahl);

    // Gut ist ein Gitter erst, wenn ALLE Woerter drin sind
    // UND es genug Kreuzungen hat.
    const alleDrin = (gesucht.length === auswahl.length);
    const genugKreuzungen =
      (kreuzungenZaehlen(gesucht) >= mindestensKreuzungen);

    if (alleDrin === true && genugKreuzungen === true) {
      break;
    }
  }

  // Die leeren Felder mit Zufallsbuchstaben auffüllen.
  for (let i = 0; i < gitter.length; i++) {
    if (gitter[i] === "") {
      gitter[i] = buchstaben[Math.floor(Math.random() * buchstaben.length)];
    }
  }

  document.getElementById("ergebnis").innerHTML = "";
  document.getElementById("ergebnis").className = "";

  gitterZeichnen();
  wortListeZeichnen();
  zeigeAnzeige();
}

/* --- Das Gitter hinstellen --- */

function gitterZeichnen() {

  const kasten = document.getElementById("gitter");
  kasten.innerHTML = "";

  /* Die Spaltenzahl wird HIER gesetzt und nicht im CSS.
     Grund: sonst müsste man beim Ändern von «spalten» an
     zwei Orten nachziehen - und genau das ist beim Memory
     schon einmal vergessen gegangen. */
  kasten.style.gridTemplateColumns = "repeat(" + spalten + ", 1fr)";

  for (let i = 0; i < gitter.length; i++) {

    const feld = document.createElement("button");
    feld.className = "feld";
    feld.innerHTML = gitter[i];

    // Die Feldnummer merken wir am Knopf selber, damit der
    // Klick weiss, welches Feld gemeint ist.
    feld.dataset.nr = i;
    feld.onclick = function () {
      feldGeklickt(i);
    };

    kasten.appendChild(feld);
  }

  // Schon gefundene Wörter wieder einfärben (nach dem Neuzeichnen).
  for (let i = 0; i < gesucht.length; i++) {
    if (gesucht[i].gefunden === true) {
      felderFaerben(gesucht[i].felder, "gefunden");
    }
  }
}

/* --- Ein paar Felder einfärben --- */

function felderFaerben(felder, klasse) {

  const knoepfe = document.getElementById("gitter").children;

  for (let i = 0; i < felder.length; i++) {
    knoepfe[felder[i]].classList.add(klasse);
  }
}

function auswahlLoeschen() {

  const knoepfe = document.getElementById("gitter").children;

  for (let i = 0; i < knoepfe.length; i++) {
    knoepfe[i].classList.remove("gewaehlt");
  }

  ersteWahl = null;
}

/* --- Auf ein Feld geklickt --- */

function feldGeklickt(nr) {

  if (fertig === true) {
    return;
  }

  // Erster Klick: nur merken und markieren.
  if (ersteWahl === null) {
    ersteWahl = nr;
    felderFaerben([nr], "gewaehlt");
    return;
  }

  // Nochmal auf dasselbe Feld: Auswahl abbrechen.
  if (ersteWahl === nr) {
    auswahlLoeschen();
    return;
  }

  const felder = strichVon(ersteWahl, nr);
  auswahlLoeschen();

  if (felder === null) {
    meldung("Nur waagrecht oder senkrecht.", "daneben");
    return;
  }

  wortPruefen(felder);
}

/* --- Der Strich zwischen zwei Feldern ---

   Gibt die Felder dazwischen zurück - aber nur, wenn die
   zwei Felder in derselben Zeile oder in derselben Spalte
   liegen. Schräg zählt hier nicht: dort liegt ja auch kein
   Wort.

   Passt es nicht, kommt null zurück. */

function strichVon(a, b) {

  const spalteA = a % spalten;
  const zeileA = Math.floor(a / spalten);
  const spalteB = b % spalten;
  const zeileB = Math.floor(b / spalten);

  const weitS = spalteB - spalteA;
  const weitZ = zeileB - zeileA;

  // Eines von beiden muss 0 sein: entweder gleiche Zeile
  // (kein Schritt nach unten) oder gleiche Spalte.
  if (weitS !== 0 && weitZ !== 0) {
    return null;
  }

  // Wie viele Felder sind es? Der grössere der zwei Abstände,
  // plus eines - das Startfeld zählt ja mit.
  const laenge = Math.max(Math.abs(weitS), Math.abs(weitZ)) + 1;

  // Math.sign gibt -1, 0 oder 1 - genau der Schritt pro Feld.
  const schrittS = Math.sign(weitS);
  const schrittZ = Math.sign(weitZ);

  const felder = [];

  for (let i = 0; i < laenge; i++) {
    felder.push(nummerVon(spalteA + i * schrittS, zeileA + i * schrittZ));
  }

  return felder;
}

/* --- Zwei Feldlisten vergleichen --- */

function gleicheFelder(a, b) {

  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

/* --- Steckt in diesem Strich ein gesuchtes Wort? ---

   Verglichen wird mit den Feldern des Wortes, einmal
   vorwärts und einmal rückwärts. Warum rückwärts?
   Weil man auch beim LETZTEN Buchstaben anfangen darf -
   der Strich ist dann derselbe, nur andersherum. */

function wortPruefen(felder) {

  const rueckwaerts = felder.slice().reverse();

  for (let i = 0; i < gesucht.length; i++) {

    const eintrag = gesucht[i];

    if (eintrag.gefunden === true) {
      continue;
    }

    if (gleicheFelder(felder, eintrag.felder) === true ||
        gleicheFelder(rueckwaerts, eintrag.felder) === true) {

      eintrag.gefunden = true;

      felderFaerben(eintrag.felder, "gefunden");
      wortListeZeichnen();
      zeigeAnzeige();

      meldung(eintrag.wort + " gefunden!", "treffer");
      vielleichtFertig();
      return;
    }
  }

  meldung("Da ist kein gesuchtes Wort.", "daneben");
}

/* --- Alle gefunden? --- */

function vielleichtFertig() {

  for (let i = 0; i < gesucht.length; i++) {
    if (gesucht[i].gefunden === false) {
      return;
    }
  }

  fertig = true;

  let text = "Alle " + gesucht.length + " Organe gefunden!";

  // Die Punkte gibt es nur mit Anmeldung. punkteDazu sagt
  // uns selber, ob es geklappt hat.
  if (punkteDazu(belohnung) === true) {

    // «1 Punkt» aber «2 Punkte» - genau wie in der Leiste oben.
    let wort = " Punkte";
    if (belohnung === 1) {
      wort = " Punkt";
    }

    text = text + " Das gibt " + belohnung + wort + " &#11088;";
  } else {
    text = text + "<br>Melde dich oben an, dann gibt es dafür Punkte.";
  }

  const ergebnis = document.getElementById("ergebnis");
  ergebnis.innerHTML = text;
  ergebnis.className = "ergebnis-karte";

  konfetti(120, 8000);
}

/* --- Die Liste der gesuchten Wörter --- */

function wortListeZeichnen() {

  let inhalt = "";

  for (let i = 0; i < gesucht.length; i++) {

    let klasse = "wort";
    if (gesucht[i].gefunden === true) {
      klasse = "wort erledigt";
    }

    inhalt = inhalt + '<span class="' + klasse + '">' +
      gesucht[i].wort + "</span>";
  }

  document.getElementById("woerterliste").innerHTML = inhalt;
}

/* --- Die Zeile über dem Gitter --- */

function zeigeAnzeige() {

  let wieviele = 0;

  for (let i = 0; i < gesucht.length; i++) {
    if (gesucht[i].gefunden === true) {
      wieviele = wieviele + 1;
    }
  }

  document.getElementById("anzeige").innerHTML =
    "Gefunden: " + wieviele + " von " + gesucht.length;
}

/* --- Eine kurze Rückmeldung unter dem Gitter ---
   Sie verschwindet wieder, sobald die nächste kommt. */

function meldung(text, art) {

  // Ist das Spiel fertig, steht dort die Schlussmeldung -
  // die soll nicht überschrieben werden.
  if (fertig === true) {
    return;
  }

  const ergebnis = document.getElementById("ergebnis");
  ergebnis.innerHTML = text;
  ergebnis.className = art;
}

/* --- Los geht's --- */

neuesSpiel();

/* --- Die Leertaste gibt ein neues Raetsel ---
   Aber NUR wenn das alte fertig ist. Sonst wuerde ein
   Leerschlag mitten im Spiel alles Gefundene wegwischen. */

leertasteStartet(function () {
  if (fertig === true) {
    neuesSpiel();
  }
});
