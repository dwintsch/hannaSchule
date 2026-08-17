/* ============================================
   Konfetti
   Wird von mehreren Spielen gebraucht - darum steht
   es in einer eigenen Datei und nicht bei einem Spiel.
   Genau wie grund.css bei den Farben.

   Aufrufen so:  konfetti(90, 8000);
   Die erste Zahl = wie viele Schnipsel.
   Die zweite Zahl = wie lange es dauert (in Millisekunden).
   ============================================ */

function konfetti(anzahl, wielange) {

  const farben = ["#2a9d8f", "#ef476f", "#ffd166", "#118ab2", "#16c95a", "#f78ca0"];

  // Millisekunden in Sekunden umrechnen (1000 ms = 1 s)
  const sekunden = wielange / 1000;

  for (let i = 0; i < anzahl; i++) {

    const schnipsel = document.createElement("div");
    schnipsel.className = "konfetti";

    // Zufällig über die ganze Breite verteilen.
    // vw heisst «Prozent der Fensterbreite».
    schnipsel.style.left = Math.random() * 100 + "vw";

    // Zufällige Farbe aus der Liste
    schnipsel.style.backgroundColor =
      farben[Math.floor(Math.random() * farben.length)];

    // Nicht alle gleichzeitig und nicht alle gleich schnell -
    // sonst sähe es aus wie ein Vorhang statt wie Konfetti.
    // Die Schnipsel starten über die halbe Zeit verteilt,
    // so regnet es bei einer längeren Zeit auch länger.
    schnipsel.style.animationDelay = Math.random() * (sekunden / 2) + "s";
    schnipsel.style.animationDuration = 2.5 + Math.random() * 2.5 + "s";

    document.body.appendChild(schnipsel);
  }

  // Am Schluss alle Schnipsel wieder wegräumen.
  setTimeout(konfettiWegraeumen, wielange);
}

function konfettiWegraeumen() {
  const schnipsel = document.querySelectorAll(".konfetti");
  for (let i = 0; i < schnipsel.length; i++) {
    schnipsel[i].remove();
  }
}
