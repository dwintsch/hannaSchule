/* ============================================
   Die Knochenliste

   Sie steht in einer EIGENEN Datei, weil zwei Spiele sie
   brauchen: das Skelett und die Latein-Paare. Stuende sie in
   einem der beiden, muesste das andere sie abschreiben - und
   dann laufen die zwei Listen frueher oder spaeter
   auseinander. Genau wie grund.css und punkte.js: was
   mehrere brauchen, steht einmal.

   Diese Datei muss VOR skelett.js und VOR latein.js geladen
   werden - sonst kennen die den Namen "knochen" noch nicht.
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

  { schluessel: "kreuzbein", deutsch: "Kreuzbein",
    latein: "Os sacrum", art: "unregelmässiger Knochen" },

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

  { schluessel: "mittelhandknochen", deutsch: "Mittelhandknochen",
    latein: "Ossa metacarpi", art: "Röhrenknochen" },

  { schluessel: "fingerknochen", deutsch: "Fingerknochen",
    latein: "Phalanges manus", art: "Röhrenknochen" },

  { schluessel: "becken", deutsch: "Hüftbein",
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
    latein: "Ossa tarsi", art: "kurze Knochen" },

  { schluessel: "mittelfussknochen", deutsch: "Mittelfussknochen",
    latein: "Ossa metatarsi", art: "Röhrenknochen" },

  { schluessel: "zehenknochen", deutsch: "Zehenknochen",
    latein: "Phalanges pedis", art: "Röhrenknochen" }
];
