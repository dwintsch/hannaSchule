/* ============================================
   Das Skelett
   Knochen antippen und ihren Namen lernen.

   Jeder Knochen in skelett.html traegt
   data-knochen="..." - dieselbe Nummer wie hier in
   der Liste. Knochen, die es zweimal gibt (links und
   rechts), tragen denselben Namen. Darum leuchten
   beim Antippen immer beide auf.
   ============================================ */

/* --- Die Knochen. HIER darfst du aendern. ---

   Zu jedem Knochen gehoeren vier Sachen:

     schluessel  der Name im data-knochen der Zeichnung
     deutsch     wie er auf Deutsch heisst
     latein      wie er in der Fachsprache heisst
     art         welche Sorte Knochen das ist

   Die fuenf Arten sind alle vertreten: Roehrenknochen,
   Plattknochen, kurze Knochen, unregelmaessige Knochen
   und das Sesambein. So sieht man an einem Skelett, was
   die Einteilung ueberhaupt bedeutet.

   ACHTUNG: Die Zuordnung ist Anatomie, nicht Meinung -
   aber Hanna kennt den Stoff besser als ich. Bitte einmal
   durchsehen, bevor damit gelernt wird. */

const knochen = [
  { schluessel: "schaedel", deutsch: "Schädel",
    latein: "Cranium", art: "Plattknochen" },

  { schluessel: "unterkiefer", deutsch: "Unterkiefer",
    latein: "Mandibula", art: "unregelmässiger Knochen" },

  { schluessel: "wirbelsaeule", deutsch: "Wirbelsäule",
    latein: "Columna vertebralis", art: "unregelmässige Knochen" },

  { schluessel: "schluesselbein", deutsch: "Schlüsselbein",
    latein: "Clavicula", art: "Röhrenknochen" },

  { schluessel: "schulterblatt", deutsch: "Schulterblatt",
    latein: "Scapula", art: "Plattknochen" },

  { schluessel: "brustbein", deutsch: "Brustbein",
    latein: "Sternum", art: "Plattknochen" },

  { schluessel: "rippen", deutsch: "Rippen",
    latein: "Costae", art: "Plattknochen" },

  { schluessel: "oberarmknochen", deutsch: "Oberarmknochen",
    latein: "Humerus", art: "Röhrenknochen" },

  { schluessel: "speiche", deutsch: "Speiche",
    latein: "Radius", art: "Röhrenknochen" },

  { schluessel: "elle", deutsch: "Elle",
    latein: "Ulna", art: "Röhrenknochen" },

  { schluessel: "handwurzelknochen", deutsch: "Handwurzelknochen",
    latein: "Ossa carpi", art: "kurze Knochen" },

  { schluessel: "becken", deutsch: "Becken",
    latein: "Os coxae", art: "Plattknochen" },

  { schluessel: "oberschenkelknochen", deutsch: "Oberschenkelknochen",
    latein: "Femur", art: "Röhrenknochen" },

  { schluessel: "kniescheibe", deutsch: "Kniescheibe",
    latein: "Patella", art: "Sesambein" },

  { schluessel: "schienbein", deutsch: "Schienbein",
    latein: "Tibia", art: "Röhrenknochen" },

  { schluessel: "wadenbein", deutsch: "Wadenbein",
    latein: "Fibula", art: "Röhrenknochen" },

  { schluessel: "fusswurzelknochen", deutsch: "Fusswurzelknochen",
    latein: "Ossa tarsi", art: "kurze Knochen" }
];

/* --- Einstellungen. Hier darfst du drehen. --- */

const belohnung = 1;   // Punkte, wenn man ALLE angeschaut hat

/* --- Die Schubladen --- */

let angeschaut = [];   // welche Knochen schon dran waren
let fertig = false;

/* --- Einen Knochen aus der Liste holen ---
   Gibt null zurueck, wenn es ihn nicht gibt - dann steht in
   der Zeichnung ein Name, den die Liste nicht kennt. */

function knochenSuchen(schluessel) {

  for (let i = 0; i < knochen.length; i++) {
    if (knochen[i].schluessel === schluessel) {
      return knochen[i];
    }
  }
  return null;
}

/* --- Die Zeile ueber dem Bild --- */

function zeigeAnzeige() {
  document.getElementById("anzeige").innerHTML =
    "Angeschaut: " + angeschaut.length + " von " + knochen.length;
}

/* --- Alles abwaehlen ---
   Vor jedem neuen Antippen. Sonst blieben zwei Knochen
   gleichzeitig hervorgehoben. */

function auswahlLoeschen() {

  const teile = document.querySelectorAll("#skelett .knochen");

  for (let i = 0; i < teile.length; i++) {
    teile[i].classList.remove("gewaehlt");
  }
}

/* --- Ein Knochen wurde angetippt --- */

function knochenGewaehlt(schluessel) {

  const gefunden = knochenSuchen(schluessel);

  if (gefunden === null) {
    return;
  }

  auswahlLoeschen();

  /* Alle Teile mit diesem Namen hervorheben - bei Armen und
     Beinen sind das zwei, bei den Rippen zehn. */

  const teile = document.querySelectorAll(
    '#skelett [data-knochen="' + schluessel + '"]');

  for (let i = 0; i < teile.length; i++) {
    teile[i].classList.add("gewaehlt");
  }

  /* Die weisse Tafel fuellen. */

  document.getElementById("tafel-hinweis").style.display = "none";
  document.getElementById("tafel-inhalt").style.display = "block";

  document.getElementById("knochen-deutsch").innerHTML = gefunden.deutsch;
  document.getElementById("knochen-latein").innerHTML = gefunden.latein;
  document.getElementById("knochen-art").innerHTML = gefunden.art;

  /* Noch nicht angeschaut? Dann merken.
     indexOf gibt -1 zurueck, wenn etwas nicht in der Liste ist. */

  if (angeschaut.indexOf(schluessel) === -1) {
    angeschaut.push(schluessel);

    // Angeschaute Knochen bekommen einen dauerhaften Haken.
    for (let i = 0; i < teile.length; i++) {
      teile[i].classList.add("gesehen");
    }

    zeigeAnzeige();
    vielleichtFertig();
  }
}

/* --- Alle angeschaut? --- */

function vielleichtFertig() {

  if (angeschaut.length < knochen.length || fertig === true) {
    return;
  }

  fertig = true;

  let text = "Alle " + knochen.length + " Knochen angeschaut!";

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

/* --- Von vorne --- */

function neuesSpiel() {

  angeschaut = [];
  fertig = false;

  auswahlLoeschen();

  const teile = document.querySelectorAll("#skelett .knochen");
  for (let i = 0; i < teile.length; i++) {
    teile[i].classList.remove("gesehen");
  }

  document.getElementById("tafel-hinweis").style.display = "block";
  document.getElementById("tafel-inhalt").style.display = "none";

  document.getElementById("ergebnis").innerHTML = "";
  document.getElementById("ergebnis").className = "";

  zeigeAnzeige();
}

/* --- Die Knochen zum Leben erwecken ---
   Jeder bekommt seinen Klick-Befehl. Das steht hier und nicht
   als onclick in der Zeichnung: dort waeren es 30 Stellen. */

function knochenBereitmachen() {

  const teile = document.querySelectorAll("#skelett .knochen");

  for (let i = 0; i < teile.length; i++) {

    const teil = teile[i];
    const schluessel = teil.dataset.knochen;

    /* addEventListener und nicht «teil.onclick = ...».
       Bei gewoehnlichen Knoepfen ginge beides - bei Teilen
       einer Zeichnung (SVG) ist addEventListener der Weg,
       der ueberall verlaesslich funktioniert. */

    teil.addEventListener("click", function () {
      knochenGewaehlt(schluessel);
    });

    /* Auch mit der Tastatur: Enter waehlt aus.
       Die Leertaste absichtlich NICHT - die ist auf allen
       Seiten fuer «neue Runde» reserviert. */

    teil.addEventListener("keydown", function (taste) {
      if (taste.key === "Enter") {
        taste.preventDefault();
        knochenGewaehlt(schluessel);
      }
    });
  }
}

/* --- Los geht's --- */

knochenBereitmachen();
neuesSpiel();

/* Die Leertaste faengt von vorne an - aber nur, wenn man
   schon alle angeschaut hat. Sonst waere alles Gesammelte
   mit einem Leerschlag weg. leertasteStartet() steht in
   js/punkte.js. */

leertasteStartet(function () {
  if (fertig === true) {
    neuesSpiel();
  }
});
