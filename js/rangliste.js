/* ============================================
   Die Rangliste am rechten Rand

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

/* --- Den leeren Kasten in die Seite setzen --- */

function ranglisteEinbauen() {

  const kasten = document.createElement("div");
  kasten.id = "rangliste";

  kasten.innerHTML =
    '<h2 class="rang-titel">&#127942; Rangliste</h2>' +
    '<p class="rang-hinweis">wird geladen &hellip;</p>';

  // beforeend heisst: ganz unten anhängen. Wo genau er
  // steht, macht nichts aus - das CSS klebt ihn sowieso
  // an den rechten Rand (position: fixed).
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
