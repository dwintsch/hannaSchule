# Projekt: FaGe Lern-Quiz

## Wer arbeitet an diesem Projekt

Hanna, 15 Jahre alt. Macht ein dreitägiges Informatik-Projekt beim Vater.
Sie wird den Beruf **Fachfrau Gesundheit (FaGe)** erlernen.

Sie hat **keine Vorkenntnisse** im Programmieren und kennt die Fachbegriffe nicht.

## Wie mit ihr gesprochen wird — wichtig!

- **Einfaches Deutsch.** Keine Fachsprache ohne Erklärung.
- Jeden neuen Begriff beim ersten Mal erklären (mit Vergleich aus dem Alltag).
- **Immer nur ein Schritt auf einmal.** Nicht mehrere Änderungen gleichzeitig verlangen.
- Ganz konkret sagen: welche Zeile, was genau dort hin, was danach passieren soll.
- Ermutigend bleiben. Fehler sind normal und gehören dazu.
- Nach jedem Schritt: `Ctrl`+`S` → Browser → `F5` erinnern.

## Ziel des Projekts

Sie will **selber programmieren**, nicht nur zuschauen. Also:

- Sie tippt den Code selbst ab, ich erkläre dabei.
- Wenn sie ausdrücklich sagt «kannst du das machen» → dann mache ich es und
  erkläre danach, was ich geändert habe (Vorher/Nachher zeigen).
- Immer prüfen, ob sie den Schritt wirklich gemacht hat (Datei lesen), bevor es weitergeht.

## Technisches

Aus dem Quiz wird eine **Lernwelt**: eine Startseite, von der aus mehrere
Spiele erreichbar sind (Quiz fertig, Memory als Nächstes, drittes Spiel offen).

```
mein-quiz/
├── index.html      ← Startseite mit den Spiel-Kacheln
├── quiz.html       ← das Quiz (hiess früher index.html)
├── memory.html     ← das Abkürzungs-Memory
├── galgen.html     ← das Hangman
├── rennen.html     ← Belohnungsspiel, KOSTET Punkte
├── css/
│   ├── grund.css   ← gilt auf ALLEN Seiten (Farben, Schrift, Knöpfe,
│   │                  .neustart, .zurueck-zur-startseite,
│   │                  #spielerleiste, .konfetti)
│   ├── start.css   ← nur Startseite
│   ├── quiz.css    ← nur Quiz
│   ├── memory.css  ← nur Memory
│   ├── galgen.css  ← nur Hangman
│   └── rennen.css  ← nur Rennen
└── js/
    ├── punkte.js   ← Anmelden + Punktekonto, auf ALLEN Seiten
    ├── konfetti.js ← wird von MEHREREN Spielen gebraucht
    ├── quiz.js     ← die Befehle vom Quiz
    ├── memory.js   ← die Befehle vom Memory
    ├── galgen.js   ← die Befehle vom Hangman
    └── rennen.js   ← die Befehle vom Rennen
```

Zwei Sorten Spiele — das ist das Konzept (wie bei Anton):

| Sorte | Spiele | Punkte |
|---|---|---|
| **Lernspiele** | Quiz, Memory, Hangman | **verdienen** |
| **Belohnung** | Rennen | **kosten** |

**Anmelden und Punkte** (`js/punkte.js`, CSS `#spielerleiste` in `grund.css`):

Bewusst **Variante B**: Name eingeben, gespeichert im `localStorage` des
Browsers. Kein Server, kein Passwort, keine Rangliste (von Hanna so gewählt).
Ehrlich dazusagen: gilt nur für diesen Browser auf diesem Computer.

- Schlüssel: `lernwelt-spieler` (wer ist angemeldet) und
  `lernwelt-punkte-<name>` (Punktestand pro Name).
- Die Leiste steht in **keiner** HTML-Datei — `leisteEinbauen()` setzt sie
  oben in den Body. Neue Seiten brauchen nur `<script src="js/punkte.js">`.
- Abmelden löscht nur, *wer* angemeldet ist. Die Punkte bleiben stehen.
- Punkte: Quiz mit ≥ `anzahlFragen - 2` richtigen **1**, Memory gelöst **1**,
  Hangman gewonnen **2**. Jedes Mal neu, nicht nur beim ersten Mal.
- `punkteDazu(n)` gibt `false` zurück, wenn niemand angemeldet ist — die
  Spiele zeigen dann den Hinweis «Melde dich oben an». Ohne Anmeldung kann
  man trotzdem normal spielen.
- Der eingegebene Name wird von `<` und `>` befreit, sonst würde er als
  HTML gelesen.

### Das Rennen (rennen.html)

Belohnungsspiel im Stil von Subway Surfers, **kostet 2 Punkte pro Runde**
(`kosten` in `rennen.js`).

- Gespielt wird mit einem **Auto** 🚗 (`#auto`), nicht mit einer Figur.
- 3 Spuren à 100px in einem 300×420px-Feld, Steuerung mit Pfeiltasten
  **und** zwei Knöpfen (wichtig fürs Vorführen ohne Tastatur).
- `setInterval(takt, 20)` ist das Herz: 50 Takte pro Sekunde, jeder rückt
  alles ein Stück. Tempo steigt mit `strecke / 300`.
- Hindernis 🚧 = verloren. Stern ⭐ = **Schutzschild** 🛡 (`schutz`), damit
  übersteht man genau ein Hindernis; das Auto pulsiert dann golden
  (`#auto.geschuetzt`). Hat man schon einen Schild, gibt der Stern
  stattdessen +50 Strecke — so ist er nie umsonst.
- Sterne: 25 % Zufall **plus Garantie** — nach 4 Hindernissen ohne Stern
  kommt sicher einer (`dingeOhneStern >= 4`). Ohne Garantie kam beim
  Testen ein ganzes Rennen ohne einen einzigen Stern.
- Die Bewegungs-Illusion macht `background-position` von `#strasse` —
  ein wiederholtes Streifenmuster wird nach unten geschoben.
- `hindernisseBewegen()` läuft die Liste **von hinten nach vorne** durch,
  weil `splice` beim Entfernen alles Nachfolgende verschiebt.
- Rekord über `rekordSpeichern("rennen", strecke)`, für Nichtangemeldete
  unter «Gast».
- `starten()` ist gegen Doppelstart abgesichert: Wache `if (laeuft) return`,
  `clearInterval(uhr)` und `blur()` des angeklickten Knopfes. Sonst löst
  die Enter-Taste den fokussierten Knopf erneut aus (von Hanna beim Testen
  gefunden) und es liefen zwei Uhren gleichzeitig.
- Farbe der Belohnungsgruppe: **Pastell-Lila** — Schrift `#7b5aa6` /
  dunkel `#5b3f87` / Flächen `#ece3f7` und `#ddd2ee` / Rahmen `#b79ddb`.
  Absichtlich anders als die drei Lernspiele, damit man die zwei Gruppen
  auseinanderhält. Auch die Strasse selbst ist pastell-lila.

**Konfetti** (`js/konfetti.js`, CSS-Klasse `.konfetti` in `grund.css`):
`konfetti(anzahl, wielange)` — Quiz, Memory und Hangman rufen alle
`konfetti(120, 10000)`. Seiten, die es brauchen,
laden `konfetti.js` **vor** ihrem eigenen Script. Aufräumbefehl heisst
`konfettiWegraeumen` — nicht `aufraeumen`, sonst kollidiert er mit dem
gleichnamigen Befehl in `memory.js`.

- Jede Seite lädt **zwei** CSS-Dateien: zuerst `grund.css`, dann ihre eigene.
  Reihenfolge zählt — was weiter unten steht, gewinnt.
- `<script src="js/quiz.js"></script>` steht **ganz unten** vor `</body>`,
  sonst findet es die Fragen noch nicht.
- Alle Seiten liegen auf derselben Ebene. So bleiben die Pfade einfach
  (`css/grund.css`) und es braucht nie `../`.
- **Neues Spiel dazu:** eigene `<spiel>.html` + `css/<spiel>.css` + `js/<spiel>.js`,
  und in `index.html` das `<div class="spiel bald">` in ein `<a class="spiel">`
  umwandeln.

### Startseite (index.html)

Design: **breite Kacheln untereinander** (von Hanna gewählt), max. 500px breit,
mittig. Jede Kachel: rundes Symbol · Titel · Erklärungssatz · Marke · Pfeil.

Darüber ein Kopfbereich `.kopf`: **pastelliger, halbdurchsichtiger**
Farbverlauf (Mint → Hellblau, `rgba(..., 0.5)`) mit dunkler Schrift.
Ausdrücklich **nicht** knallig — so von Hanna gewünscht.

Jedes Spiel hat eine **eigene Akzentfarbe**, die zum Spiel passt:
Quiz türkis `#2a9d8f`, Memory rosa `#c2557a` (wie die Kartenrückseiten),
Hangman orange `#d2691e`. Die Farben stehen gebündelt im Abschnitt
«Jedes Spiel hat seine eigene Farbe» in `start.css` — dort ändern, nicht
verstreut. Beim Draufzeigen hebt sich die Kachel an und der Pfeil rutscht
nach rechts; beim Laden rutschen Kopf und Kacheln gestaffelt herein.

- Fertiges Spiel = `<a class="spiel" href="...">` → anklickbar
- Noch nicht fertig = `<div class="spiel bald">` → grau, nicht anklickbar

Die «kommt bald»-Kacheln stehen absichtlich schon da: so sieht man am
Präsentationstag den Plan hinter dem Projekt.

### Memory (memory.html)

Paar = **Abkürzung ↔ ausgeschriebenes Wort** (Pflegedokumentation).
8 Paare = 16 Karten in einem 4×4-Feld.

- Die Paare stehen **nur** in der Liste `paare` zuoberst in `js/memory.js`.
  Ändern/ergänzen bitte immer dort, sonst nirgends.
- Bei anderer Paar-Anzahl passt sich alles ausser dem Raster automatisch an.
  Für 5 Spalten müsste `repeat(4, 1fr)` in `memory.css` geändert werden.
- Rückseite rosa (`#f7d9e3`), Vorderseite weiss mit schwarzer Schrift —
  so von Hanna gewünscht.
- Umdrehen = 3D-Drehung via `rotateY`, Klasse `offen` am `<button class="karte">`.
- Gefundenes Paar: die **echten Karten** fliegen aus dem Spielfeld zum leeren
  Landeplatz `#paar-anzeige` über dem Raster und legen sich dort
  **nebeneinander** — 2,6 Sekunden, dann verblassen sie. So von Hanna
  gewünscht (ausdrücklich die Karten selbst, keine Kopie/Textanzeige).
  - Bewegt wird mit `transform: translate(...)`, **nicht** mit
    `position: fixed`. Grund: `.karte` hat `perspective`, und das macht sie
    zum Bezugsrahmen für fixe Kinder — die Koordinaten wären falsch.
    `translate` verschiebt ausserdem nur das Bild, der Platz im Raster
    bleibt leer stehen.
  - Das `rotateY(180deg)` muss im Inline-`transform` mitgeschrieben werden,
    sonst überschreibt es die Regel `.karte.offen .karte-innen` und die
    Karte dreht sich beim Fliegen wieder zu.
  - `anzeigeUhr` + `clearTimeout` verhindern, dass ein schnell gefundenes
    zweites Paar das erste zu früh löscht.
- Falsches Paar deckt sich nach 1,2 Sekunden wieder zu.
- `blockiert` sperrt das Klicken während des Vergleichs — sonst könnte man
  mit schnellem Klicken drei Karten gleichzeitig offen haben.

**Neu gelernt beim Memory:** Listen (`const paare = [...]`), Schleifen (`for`),
`setTimeout` (warte kurz), `Math.random` (Zufall), Elemente selber herstellen
(`document.createElement`).

### Hangman (galgen.html)

Heisst nach aussen **Hangman** (Titel, Überschrift, Startseiten-Kachel), die
Dateien heissen weiterhin `galgen.*`. Nicht umbenennen, ohne alle drei
Dateien plus den Link in `index.html` mitzuändern.

Ein zufälliges Fachwort erraten, 26 Buchstaben-Knöpfe, **9 Fehler** erlaubt.

- Die Wörter stehen **nur** in der Liste `woerter` zuoberst in `js/galgen.js`.
  Rund 55 Stück, nach Themen gruppiert (Hannas eigene · Körper · Pflege und
  Spital · Material und Behandlung). Neue dürfen frei dazu.
- Wortregeln: GROSSBUCHSTABEN, **keine Umlaute** (sonst bräuchte es Ä/Ö/Ü-Knöpfe),
  keine Leerschläge und keine Bindestriche.
- Das Männchen ist ein `<svg>` direkt im HTML: Galgen immer sichtbar,
  darunter **neun** Teile `#teil1`…`#teil9` (Kopf, Körper, 2 Arme, 2 Beine,
  **Hut, T-Shirt, Hose**), versteckt über `.maennchen > * { display: none }`.
  `zeichneMaennchen()` blendet pro Fehler eines mehr ein.
- Teile 1–6 sind der Körper, **7–9 das Gesicht**: Augen, Nase, Mund
  (Kleider gab es kurz, wurden von Hanna wieder verworfen).
  Der Mund ist nach unten gebogen, also traurig.
- Das Männchen ist **schwarz**, der Galgen bleibt hellorange.
- Das Gesicht (`.gesicht`) steht im SVG **nach** dem Kopf — in SVG zeichnet
  später = liegt oben, sonst wäre der Kopf über dem Gesicht.
- Im CSS **keine id-Selektoren** für die Zeichnung verwenden (`#galgen path`
  o.ä.): id schlägt Klasse, und dann überstimmt das `fill: none` der
  Grundregel die Füllfarben. Genau dieser Fehler ist schon einmal passiert.
- Mehr Fehler zulassen: `maxFehler` in `galgen.js`, ein `#teil10` im SVG,
  und die Zahl im Anleitungstext plus auf der Startseiten-Kachel.
- Bei Niederlage wird das ganze Wort rot aufgedeckt (`.platz.verpasst`).
- Überschrift, Fehlerzähler und das gesuchte Wort im Orange `#d2691e` der
  Hangman-Kachel — jedes Spiel führt seine Kachelfarbe fort (Quiz türkis,
  Memory rosa `#c2557a`, Hangman orange).
- Konfetti bei Gewinn.

**Neu gelernt beim Galgenmännchen:** `<svg>` (zeichnen im Browser),
`includes` (ist etwas in einer Liste / in einem Wort?), `push` (etwas zur Liste
dazutun), `disabled` (Knopf sperren), Buchstaben eines Wortes einzeln durchgehen.
- Keine Bibliotheken, kein Framework, kein Build. Doppelklick auf `index.html` genügt.
- **Nicht** weiter aufteilen (z.B. eine Datei pro Frage): das ginge nur mit
  einem lokalen Server, weil der Browser bei `file://` keine weiteren
  HTML-Schnipsel nachladen darf.
- Editor: **VS Code**. Testen: Datei im Browser öffnen, mit `F5` neu laden.
- Alle Namen im Code sind **deutsch** (`pruefe`, `weiter`, `fehler`, `aktuelleFrage`).
  Das bitte beibehalten — sie versteht den Code dann besser.

## Aufbau des Quiz

Jede Frage ist ein `<fieldset>` mit durchnummerierten Namensschildern:

```html
<fieldset id="frage3" class="frage">
  <p>Die Frage?</p>
  <button onclick="pruefe(this, false)">Falsche Antwort</button>
  <button onclick="pruefe(this, true)">Richtige Antwort</button>
  <button onclick="pruefe(this, false)">Noch eine falsche</button>
  <p class="rueckmeldung" id="antwort3"></p>
  <div class="pfeilzeile">
    <button class="pfeil" id="zurueck3" onclick="zurueck()">&#8592; Zurück</button>
    <button class="pfeil" id="pfeil3" onclick="weiter()">Weiter &#8594;</button>
  </div>
</fieldset>
```

**Beim Hinzufügen einer Frage muss die Zahl an vier Stellen stimmen:**
`frage3`, `antwort3`, `zurueck3`, `pfeil3`.

Am JavaScript muss dafür **nichts** geändert werden — die Anzahl Fragen wird
automatisch gezählt (`anzahlFragen`).

### Ablauf

1. Es ist immer nur **eine** Frage sichtbar (`.frage { display: none; }`).
2. Falsche Antwort → Knopf wird rot (`.falsch`), Rückmeldung in der Karte,
   der Kasten bekommt die Klasse `verpatzt`, Frage bleibt stehen.
3. Richtige Antwort → Knopf wird grün (`.richtig`), der Kasten bekommt die
   Klasse `erledigt`.
   **Einen Punkt gibt es nur, wenn vorher nichts Falsches geklickt wurde** —
   also nur bei einer Antwort auf Anhieb.
4. Der Weiter-Pfeil ist **immer** sichtbar. Man darf eine Frage überspringen
   und kommt so auch ohne richtige Antwort bis zur Auswertung.
5. Der Punktestand steht laufend oben (`<p id="punktestand">`, Befehl
   `zeigePunkte()`).

### Der Smiley in der Frage

Oben rechts in jedem Fragekasten sitzt ein **um 35° im Uhrzeigersinn gekippter**
Smiley (so von Hanna gewünscht):

- **Unsichtbar, solange nicht geklickt wurde** (`opacity: 0`), dann
  **grün + lachend** = richtig · **rot + traurig** = falsch. So von Hanna
  gewünscht — er soll erst als Rückmeldung erscheinen.
- Selbst gezeichnetes `<svg>`, **kein Emoji** — ein Emoji liesse sich nicht
  einfärben. Kopf, Augen und Mund benutzen `stroke: currentColor`, darum
  genügt eine einzige Farbänderung an `.smiley`.
- Beide Münder (`.mund.froh`, `.mund.traurig`) stecken im SVG, das CSS zeigt
  den passenden.
- Die `.erledigt`-Regeln stehen in `quiz.css` **nach** den `.verpatzt`-Regeln,
  damit «erst falsch, dann richtig» grün endet.
- Eingebaut wird er von `smileysEinbauen()` in `quiz.js`, nicht im HTML —
  so bekommt jede neue Frage automatisch einen.

Die Klassen `erledigt` und `verpatzt` merken sich den Zustand **pro Frage**
direkt am `<fieldset>`. Nur so stimmt es auch beim Zurückblättern — sonst
könnte man eine Frage zweimal punkten oder einen Fehlklick vergessen machen.
Sie haben absichtlich kein CSS, sie sind reine Merkzettel.
4. Klick auf den Weiter-Pfeil → `weiter()` blättert zur nächsten Frage.
5. Ab Frage 2 gibt es unten links einen Zurück-Pfeil → `zurueck()`.
6. Nach der letzten Frage → `auswertung()` zeigt das Ergebnis je nach Fehlerzahl.
   Das leere `<p id="ergebnis">` bekommt dabei die Klasse `ergebnis-karte`,
   damit erst dann ein Rahmen sichtbar wird (sonst stünde ein leerer Kasten da).
7. Unter den Fragen steht immer der Knopf «Quiz neu laden»
   (`onclick="location.reload()"`) — lädt die Seite neu und setzt alles zurück.
8. **Ab `anzahlFragen - 2` Punkten** (also 8 von 10) regnet es Konfetti über
   die ganze Seite: `konfetti()` in `quiz.js` erzeugt 90 `<div class="konfetti">`
   mit zufälliger Farbe, Startposition und Falltempo und räumt sie nach
   8 Sekunden wieder weg. Schwelle bewusst relativ, damit sie bei mehr
   Fragen weiter stimmt.

Die beiden Pfeile werden mit `visibility` (nicht `display`) ein- und
ausgeblendet. So bleibt ihr Platz reserviert und das Layout springt nicht.

### Die Befehle (Funktionen)

| Befehl | Aufgabe |
|---|---|
| `pruefe(knopf, istRichtig)` | Antwort beurteilen, Knopf einfärben, Rückmeldung anzeigen |
| `zeigeFrage(nummer)` | Eine Frage einblenden, Pfeile richtig setzen |
| `weiter()` | Zur nächsten Frage blättern |
| `zurueck()` | Zur vorherigen Frage zurück |
| `auswertung()` | Schlussergebnis anzeigen |

Grundsatz: **ein Befehl, eine Aufgabe.**

## Farben

**Grundsatz: alle Flächen pastell, Schrift darauf dunkel.** So von Hanna
gewünscht. Nichts Knalliges mehr — kräftige Farben nur noch dort, wo Schrift
Kontrast braucht (Überschriften, Zähler), und beim Konfetti.

| Farbe | Code | Wo |
|---|---|---|
| Seitenhintergrund | `#ffffff` | `body` |
| Türkis | `#2a9d8f` | Quiz-Überschrift, Rahmen, Startseiten-Akzent |
| Hellblau | `#bcdcea` | Antwort-Knöpfe **und** Pfeile im Quiz |
| Dunkelblau | `#16323d` | Schrift auf hellen Flächen |
| Pastellgrün | `#bfe6cd` + Schrift `#1e5b3a` | «richtig» in Quiz und Hangman |
| Pastellrot | `#f7cfc9` + Schrift `#8c3125` | «falsch» in Quiz und Hangman |
| Rosa | `#c2557a`, Karten `#f7d9e3` | Memory |
| Orange | `#d2691e`, hell `#e8a76b`, pastell `#fde8d7` | Hangman |

Pastellgrün und Pastellrot sind in Quiz und Hangman **absichtlich identisch** —
richtig und falsch sollen überall gleich aussehen. Wer eine davon ändert,
muss beide Dateien anpassen (`quiz.css` und `galgen.css`).

## Was Hanna schon gelernt hat

| Thema | Wo im Code |
|---|---|
| HTML-Tags, öffnen und schliessen | `<h1>`, `<p>`, `<button>` |
| CSS: Selektor, Eigenschaft, Wert | der ganze `<style>`-Teil |
| `id` (Einzelname) vs. `class` (Gruppe) | `id="frage1"`, `class="frage"` |
| Auf Klicks reagieren | `onclick` |
| Variablen («Schubladen») | `let fehler = 0;` |
| `=` heisst «wird zu», `===` heisst «ist gleich?» | überall |
| Eigene Befehle schreiben | `function pruefe(...)` |
| Bedingungen | `if` / `else if` / `else` |
| `true` und `false` | `pruefe(true)` |
| `return` = sofort aufhören | in `pruefe` |
| Text zusammenkleben mit `+` | `"frage" + aktuelleFrage` |
| Ein- und Ausblenden | `style.display = "none"` / `"block"` |
| Farben: `#rrggbb` und `rgba(r,g,b,alpha)` | im CSS |

**Noch nicht behandelt:** Schleifen (`for`), Listen/Arrays, mehrere Dateien.

## Wichtiger Hinweis zum Inhalt

Das Quiz ist ein **Lernprojekt für die Schule**. Es ist keine medizinische
Beratung und ersetzt keine Ausbildung. Bei Pflege-Fachfragen: Hanna kennt sich
in dem Bereich besser aus — im Zweifel nachfragen statt behaupten.

## Stand am Ende von Tag 2 (17.08.2026)

**Fertig und spielbar:** Startseite, Quiz (10 Fragen), Memory (8 Paare),
Hangman (55 Wörter, 9 Fehler), Rennen (Belohnung), Anmelden mit Punktekonto,
Konfetti, Smileys, einheitliches Pastell-Farbkonzept.

**Sicherung:** `C:\Users\danie\mein-quiz-sicherung-2026-08-17.zip`

**Zuletzt offen geblieben:**

1. Hanna hat gemeldet, dass man mit **3× Enter** Spiele gratis freischalten
   kann. `starten()` im Rennen ist inzwischen gegen Doppelstart abgesichert
   (`laeuft`-Wache, `clearInterval`, `blur()`). **Noch nicht bestätigt, ob das
   die richtige Lücke war** — zuerst nachfragen, auf welcher Seite und nach
   welchem Schritt es passiert, bevor weiter geraten wird.
2. Punkte lassen sich unbegrenzt farmen (dasselbe Quiz mehrfach spielen).
   Ist so gewollt; Hanna weiss davon und könnte es begrenzen wollen.

**Tag 3 ist der Präsentationstag** — Zeit dafür reservieren, nicht mehr
beliebig Neues anfangen. Gute Erzählpunkte für die Präsentation:

- Warum es drei Dateien pro Spiel gibt (HTML / CSS / JavaScript)
- Warum `grund.css`, `konfetti.js` und `punkte.js` geteilt werden
- Das Farbkonzept: jede Farbe hat eine Bedeutung
- Warum ein echtes Login einen Server bräuchte
- Der gelenkte Zufall bei den Sternen («fühlte sich unfair an»)
- Der Fehler mit dem fehlenden `</fieldset>` und wie sie ihn gefunden hat

## Offene Ideen für den Rest der Zeit

- Mehr Fragen (sie schreibt eigene aus ihrem Berufsfeld)
- Fortschrittsanzeige («Frage 2 von 5»)
- Knopf «Nochmal von vorne»
- Erklärung zur richtigen Antwort einblenden
- Präsentation für den dritten Tag vorbereiten
