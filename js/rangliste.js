/* ============================================
   Die Rangliste am linken Rand

   Zeigt die zehn Besten. Steht auf JEDER Seite -
   darum eine eigene Datei, genau wie punkte.js
   und konfetti.js.

   Diese Datei braucht zwei Befehle aus punkte.js:
   serverFragen() und token(). Darum muss punkte.js
   in der HTML-Datei ZUERST geladen werden. Steht
   rangliste.js zuerst, gibt es eine Fehlermeldung.

   Der Kasten steht in keiner HTML-Datei. Er wird
   hier hergestellt und unten in den Body gehängt.
   ============================================ */

/* Die Zeichen für die ersten drei Plätze.
   Ab Platz 4 kommt einfach die Zahl. */

const MEDAILLEN = ["\u{1F947}", "\u{1F948}", "\u{1F949}"];

/* Hier merken wir uns, auf welchem Platz man beim letzten Mal
   war. Nur so lässt sich erkennen, dass jemand AUFGESTIEGEN ist -
   sonst käme die Jubel-Meldung bei jedem Seitenaufruf neu. */

const SCHLUESSEL_PLATZ = "lernwelt-letzter-platz";

/* --- Auf welchem Platz stehe ich? ---
   Gibt 0 zurück, wenn man nicht in der Liste steht. */

function meinPlatz(liste) {

  for (let i = 0; i < liste.length; i++) {
    if (liste[i].ich === true) {
      return i + 1;
    }
  }
  return 0;
}

/* --- Bin ich gerade aufgestiegen? ---

   Die Meldung soll nur kommen, wenn man WIRKLICH neu
   auf Platz 1 ist. Darum drei Bedingungen:

   1. jetzt bin ich Erste
   2. ich weiss, wo ich vorher war (beim allerersten Mal
      nach dem Anmelden weiss ich es noch nicht)
   3. vorher war ich es noch nicht

   Ohne Nummer 2 würde die Meldung bei jedem Seitenwechsel
   wieder aufpoppen, solange man vorne liegt. */

function platzPruefen(liste) {

  // Nicht angemeldet? Dann gibt es keinen eigenen Platz.
  // Den Merkzettel löschen, damit nach dem nächsten Anmelden
  // sauber von vorne gezählt wird.
  if (token() === null) {
    localStorage.removeItem(SCHLUESSEL_PLATZ);
    return;
  }

  const jetzt = meinPlatz(liste);
  const roh = localStorage.getItem(SCHLUESSEL_PLATZ);

  // null heisst «ich weiss es noch nicht».
  const vorher = (roh === null) ? null : Number(roh);

  localStorage.setItem(SCHLUESSEL_PLATZ, jetzt);

  if (jetzt === 1 && vorher !== null && vorher !== 1) {

    tafelZeigen("\u{1F3C6} Platz 1! Du führst die Rangliste an.", 7000);

    // Konfetti gibt es nur auf Seiten, die konfetti.js geladen
    // haben. Darum zuerst nachschauen, ob es den Befehl gibt -
    // derselbe Trick wie bei ranglisteAuffrischen in punkte.js.
    if (typeof konfetti === "function") {
      konfetti(120, 7000);
    }
  }
}

/* --- Den leeren Kasten in die Seite setzen --- */

function ranglisteEinbauen() {

  const kasten = document.createElement("div");
  kasten.id = "rangliste";

  kasten.innerHTML =
    '<h2 class="rang-titel">&#127942; Rangliste</h2>' +
    '<p class="rang-hinweis">wird geladen &hellip;</p>';

  // beforeend heisst: ganz unten anhängen. Wo genau er
  // steht, macht nichts aus - das CSS klebt ihn sowieso
  // an den linken Rand (position: fixed).
  document.body.insertAdjacentElement("beforeend", kasten);
}

/* --- Eine einzelne Zeile bauen --- */

function rangZeile(eintrag, platz) {

  // Platz 1, 2, 3 bekommen eine Medaille, der Rest die Zahl.
  let zeichen = platz + ".";

  if (platz <= 3) {
    zeichen = MEDAILLEN[platz - 1];
  }

  // Die eigene Zeile wird hervorgehoben.
  let klasse = "rang-zeile";

  if (eintrag.ich === true) {
    klasse = "rang-zeile ich";
  }

  // «1 Punkt» aber «2 Punkte» - genau wie in der Leiste oben.
  let wort = " Punkte";

  if (eintrag.punkte === 1) {
    wort = " Punkt";
  }

  return '<li class="' + klasse + '">' +
    '<span class="rang-platz">' + zeichen + '</span>' +
    '<span class="rang-name">' + textSichern(eintrag.name) + '</span>' +
    '<span class="rang-punkte">' + eintrag.punkte + wort + '</span>' +
    '</li>';
}

/* --- Die Antwort des Servers anzeigen --- */

function ranglisteZeichnen(daten) {

  const kasten = document.getElementById("rangliste");

  if (kasten === null) {
    return;
  }

  // Zuerst schauen, ob jemand aufgestiegen ist - noch bevor
  // die neue Liste gezeichnet wird.
  platzPruefen(daten.liste);

  let inhalt = '<h2 class="rang-titel">&#127942; Rangliste</h2>';

  if (daten.liste.length === 0) {
    kasten.innerHTML = inhalt +
      '<p class="rang-hinweis">Noch niemand da. Sei die Erste!</p>';
    return;
  }

  inhalt = inhalt + '<ol class="rang-liste">';

  // Eine Schleife über die Liste. platz zählt von 1 hoch,
  // die Liste selber fängt aber bei 0 an - darum das + 1.
  for (let i = 0; i < daten.liste.length; i++) {
    inhalt = inhalt + rangZeile(daten.liste[i], i + 1);
  }

  inhalt = inhalt + '</ol>';

  // Steht nicht jeder in den Top 10, sagen wir wie viele es sind.
  if (daten.mitspieler > daten.liste.length) {
    inhalt = inhalt + '<p class="rang-fuss">von ' + daten.mitspieler +
      ' Mitspielenden</p>';
  }

  kasten.innerHTML = inhalt;
}

/* --- Beim Server nachfragen ---
   Der Ausweis wird mitgeschickt, damit der Server weiss,
   welche Zeile die eigene ist. Ohne Anmeldung geht es
   auch - dann ist einfach keine Zeile hervorgehoben. */

function ranglisteLaden() {

  serverFragen("rangliste", { token: token() })
    .then(ranglisteZeichnen)
    .catch(function () {

      const kasten = document.getElementById("rangliste");

      if (kasten !== null) {
        kasten.innerHTML =
          '<h2 class="rang-titel">&#127942; Rangliste</h2>' +
          '<p class="rang-hinweis">gerade nicht erreichbar</p>';
      }
    });
}

/* --- Los geht's --- */

ranglisteEinbauen();
ranglisteLaden();
