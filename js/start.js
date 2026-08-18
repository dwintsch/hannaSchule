/* ============================================
   Die Startseite

   Bis jetzt kam die Startseite ohne eigene
   JavaScript-Datei aus - das Ein- und Ausblenden
   nach dem Anmelden macht allein das CSS.

   Für den Knopf mit dem Namen unten braucht es nun
   doch einen Befehl. Darum diese Datei, und darum
   wird sie nur von index.html geladen.
   ============================================ */

/* --- Den Text «Wie das gemacht wurde» auf- und zuklappen ---
   Wird vom Knopf mit dem Namen in der Fusszeile gerufen. */

function machertextUmschalten() {

  const text = document.getElementById("machertext");
  const knopf = document.getElementById("name-knopf");

  /* classList.toggle setzt die Klasse, wenn sie fehlt, und
     nimmt sie weg, wenn sie da ist. Zurück gibt es true oder
     false - je nachdem, ob die Klasse jetzt dran ist.

     Das Anzeigen selber macht wieder das CSS:
     .machertext ist versteckt, .machertext.offen ist sichtbar. */

  const offen = text.classList.toggle("offen");

  /* aria-expanded sagt einem Vorleseprogramm, ob der Text
     gerade offen ist. Sehende merken das an der Seite -
     wer nicht sieht, braucht diesen Hinweis. */

  knopf.setAttribute("aria-expanded", offen);
}
