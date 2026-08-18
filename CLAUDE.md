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

## WO GEARBEITET WIRD — bitte zuerst lesen

Ab **18.08.2026** ist der einzige richtige Ordner:

```
C:\Projects\hannaSchule
```

Dieser Ordner ist ein **git-Repository** und hängt an GitHub und Azure.

- GitHub: `https://github.com/dwintsch/hannaSchule.git`, Branch **`main`**
- Azure: **Static Web Apps**, Name `witty-water-0c6d8c31e`, Plan **Free**
- Workflow: `.github/workflows/azure-static-web-apps-witty-water-0c6d8c31e.yml`
- **Die Website läuft hier:**
  `https://witty-water-0c6d8c31e.7.azurestaticapps.net/`

Achtung bei der Adresse: die **`.7.`** in der Mitte gehört dazu (7 = Region
Westeuropa). Ohne sie antwortet Azure mit 404. Hat mich einmal in die Irre
geführt — ich musste 1 bis 7 durchprobieren.

Prüfen, ob ein Deploy durch ist, geht ohne Browser:

```powershell
Invoke-WebRequest -Uri "https://witty-water-0c6d8c31e.7.azurestaticapps.net/blitz.html" -UseBasicParsing
```

HTTP 200 = Datei ist online, 404 = nicht da.

**Erledigt am 18.08.2026:** Die Punkte liegen jetzt auf einem Server, nicht
mehr nur im Browser. Konto mit Name **und Passwort**, überall derselbe
Punktestand. Siehe Abschnitt «Der Server-Teil (api/)».

**Wichtig:** `C:\Users\danie\mein-quiz` ist der **alte** Ordner. Dort wurde
bis zum 18.08.2026 vormittags gearbeitet. Sein Inhalt wurde hierher kopiert.
Nicht mehr dort arbeiten — sonst gibt es zwei Versionen, die auseinanderlaufen.
Er darf als Sicherung stehen bleiben.

### Wie eine Änderung ins Internet kommt

1. Datei hier in `C:\Projects\hannaSchule` ändern
2. `git add` + `git commit`
3. `git push` auf `main`
4. Der Workflow läuft auf GitHub automatisch los und lädt alles zu Azure
5. Nach 1–2 Minuten ist die Website neu

**Erst ein `push` macht die Änderung öffentlich.** Speichern allein genügt
nicht — anders als früher, wo die Datei direkt im Browser geöffnet wurde.
Vor jedem Push nachfragen: es ist die einzige Aktion, die nach aussen geht.

### Was im Workflow steht (und warum)

- `app_location: "/"` — die `index.html` liegt im Wurzelverzeichnis
- `skip_app_build: true` und `skip_api_build: true` — reines HTML/CSS/JS,
  kein Build. Oryx (Azures Build-Werkzeug) wird komplett übersprungen.
- `api_location: "api"` und `skip_api_build: false` — der Server-Teil im
  Ordner `api/`. Für **ihn** läuft Oryx bewusst: er muss dort `npm install`
  machen, weil `@azure/data-tables` gebraucht wird. Für die Website davor
  bleibt Oryx abgeschaltet (`skip_app_build: true`).
- Der Kommentar im Workflow warnt: ein `npm install` im Schritt «Get Id
  Token» legte eine `package.json` an, worauf Oryx fälschlich ein
  Node-Projekt vermutete. Darum dort **kein** npm.
- `git push` auf `main` löst den Deploy aus, ein Pull Request baut eine
  Vorschau-Umgebung.

## Technisches

Aus dem Quiz ist eine **Lernwelt** geworden: eine Startseite, von der aus
sechs Spiele erreichbar sind.

```
mein-quiz/
├── index.html      ← Startseite mit den Spiel-Kacheln + Code-Feld
├── quiz.html       ← das Quiz (hiess früher index.html)
├── memory.html     ← das Abkürzungs-Memory
├── galgen.html     ← das Hangman
├── blitz.html      ← die Blitzrunde (richtig/falsch auf Zeit)
├── rennen.html     ← Belohnungsspiel, KOSTET Punkte
├── dach.html       ← Belohnungsspiel Dachheldin, KOSTET Punkte
├── css/
│   ├── grund.css   ← gilt auf ALLEN Seiten (Farben, Schrift, Knöpfe,
│   │                  .neustart, .zurueck-zur-startseite,
│   │                  #spielerleiste, .punkte-marke, .muenzen-marke,
│   │                  .frei-marke, .konfetti)
│   ├── start.css   ← nur Startseite (inkl. #geheimfeld)
│   ├── quiz.css    ← nur Quiz
│   ├── memory.css  ← nur Memory
│   ├── galgen.css  ← nur Hangman
│   ├── blitz.css   ← nur Blitzrunde
│   ├── rennen.css  ← nur Rennen
│   └── dach.css    ← nur Dachheldin
├── staticwebapp.config.json  ← sagt Azure: der Server-Teil ist Node 20
├── api/            ← der Server-Teil (Azure Functions)
│   ├── host.json
│   ├── package.json      ← hier steht, welches Paket gebraucht wird
│   ├── gemeinsam.js      ← Helfer für alle fünf Befehle
│   ├── registrieren/     ← neues Konto anlegen
│   ├── anmelden/         ← Name + Passwort prüfen, Ausweis ausstellen
│   ├── konto/            ← «wie steht es um mich?»
│   ├── aendern/          ← Punkte, Münzen und Rekorde nachführen
│   └── rangliste/        ← wer hat am meisten Punkte?
└── js/
    ├── punkte.js   ← Anmelden + Punkte + Münzen + Code, auf ALLEN Seiten
    ├── rangliste.js ← die Rangliste links, auf ALLEN Seiten
    ├── konfetti.js ← wird von MEHREREN Spielen gebraucht
    ├── quiz.js     ← die Befehle vom Quiz
    ├── memory.js   ← die Befehle vom Memory
    ├── galgen.js   ← die Befehle vom Hangman
    ├── blitz.js    ← die Befehle von der Blitzrunde
    ├── rennen.js   ← die Befehle vom Rennen
    └── dach.js     ← die Befehle von der Dachheldin
```

Zwei Sorten Spiele — das ist das Konzept (wie bei Anton):

| Sorte | Spiele | Punkte |
|---|---|---|
| **Lernspiele** | Quiz, Memory, Hangman, Blitzrunde | **verdienen** |
| **Belohnung** | Rennen, Dachheldin | **kosten** |

**Drei Sorten Zahlen — nicht verwechseln:**

| Was | Wo verdient | Wofür |
|---|---|---|
| **Punkte** ⭐ | Lernspiele | bezahlen die Belohnungsspiele |
| **Münzen** 🪙 | nur in der Dachheldin | pro 100 Münzen gibt es **1 Punkt** geschenkt |
| **Gratis-Runden** 🔓 | Code-Feld auf der Startseite | ersetzen die Punkte |

**Anmelden und Punkte** (`js/punkte.js`, CSS `#spielerleiste` in `grund.css`):

Seit 18.08.2026 ein **echtes Konto**: Name **und Passwort**, gespeichert auf
einem Server. Damit ist es egal, an welchem Computer man spielt — das war
die ausdrückliche Anforderung.

**Achtung, geänderter Entscheid:** Hier stand lange «keine Rangliste (von
Hanna so gewählt)». Am 18.08.2026 hat Daniel eine gewünscht — damals gab es
allerdings auch noch keinen Server, auf dem so etwas möglich gewesen wäre.
Sie ist gebaut (siehe «Die Rangliste»), aber **mit Hanna noch nicht
besprochen**. Falls sie sie nicht will: `js/rangliste.js`, den Block in
`grund.css`, `api/rangliste/` und die sieben `<script>`-Zeilen entfernen.

Der `localStorage` ist geblieben, aber nur noch als **Abschrift**. Der Server
ist das Original. Grund: eine Frage ans Internet dauert einen Moment, die
Spiele sollen aber sofort weiterlaufen. Also erst lokal schreiben, dann im
Hintergrund dem Server Bescheid geben.

- Schlüssel: `lernwelt-spieler` (wer ist angemeldet),
  `lernwelt-punkte-<name>` (Abschrift), `lernwelt-token` (der Ausweis) und
  `lernwelt-warteschlange` (was noch nicht beim Server angekommen ist).
- **Ohne `lernwelt-token` gilt man als nicht angemeldet**, auch wenn der Name
  noch dasteht. Das ist die einzige Stelle, an der `angemeldeterSpieler()`
  anders funktioniert als früher.
- Die Leiste steht in **keiner** HTML-Datei — `leisteEinbauen()` setzt sie
  oben in den Body. Neue Seiten brauchen nur `<script src="js/punkte.js">`.
- Abmelden löscht nur, *wer* angemeldet ist. Die Punkte bleiben stehen.
- **Münz-Bonus:** Für je `MUENZEN_PRO_PUNKT` (= 100) gesammelte Münzen gibt
  es **1 Punkt** geschenkt. Gerechnet wird in `muenzenDazu()` über den
  Sprung der Hunderterstufe:
  `floor(nachher / 100) - floor(vorher / 100)`. So funktioniert es auch,
  wenn jemand mit einem Schlag 250 Münzen bekäme (dann zwei Punkte), und
  es kann **nicht** doppelt auslösen, wenn man von 100 auf 101 weiterzählt.
  Dazu erscheint eine Tafel.
  **Ehrlich dazusagen:** Gerechnet wird im Browser, nicht auf dem Server.
  Wer gleichzeitig an zwei Computern genau über die Hundertergrenze
  kommt, könnte den Bonus zweimal bekommen. Bei diesem Projekt egal.
- Punkte: Quiz mit ≥ `anzahlFragen - 2` richtigen **1**, Memory gelöst **1**,
  Blitzrunde ab `zielPunkte` richtigen **1**,
  Hangman gewonnen **2**. Jedes Mal neu, nicht nur beim ersten Mal.
- `punkteDazu(n)` gibt `false` zurück, wenn niemand angemeldet ist — die
  Spiele zeigen dann den Hinweis «Melde dich oben an».
  **Seit 18.08.2026 kommt man aber gar nicht mehr so weit:** ohne Anmeldung
  sind die Spielkacheln auf der Startseite weggeblendet (siehe «Erst
  anmelden, dann spielen»). Die Rückfalllogik in den Spielen bleibt
  trotzdem drin — sie ist die zweite Sicherung, falls jemand eine
  Spielseite direkt über die Adresszeile aufruft.
- Der eingegebene Name wird von `<` und `>` befreit, sonst würde er als
  HTML gelesen.
- Die Leiste hat **zwei** Knöpfe und **zwei Zustände**, gemerkt in
  `leistenModus` (`"anmelden"` / `"registrieren"`) — ein Merkzettel wie
  `erledigt`/`verpatzt` beim Quiz:

  | Modus | links | grosser Knopf | kleiner Knopf |
  |---|---|---|---|
  | `anmelden` | «Wer spielt?» | **Anmelden** | Neu hier? |
  | `registrieren` | «Neues Konto» | **Registrieren** | Zurück |

  «Neu hier?» legt also **nichts** an, es schaltet nur um. Erst
  «Registrieren» legt an. So von Daniel gewünscht, und es ist auch besser:
  ein Konto anlegen soll kein Versehen sein.
- `modusWechseln()` muss Name und Passwort **vor** dem Neuzeichnen merken
  und danach zurückschreiben — `leisteZeichnen()` baut die Leiste über
  `innerHTML` neu auf, sonst wäre das Getippte weg.
- `hauptknopfDruecken()` entscheidet nach `leistenModus`. Die Enter-Taste
  ruft denselben Befehl, damit Enter immer das tut, was der Knopf sagt,
  der gerade dasteht.
- Nach erfolgreichem Registrieren und beim Abmelden geht `leistenModus`
  auf `"anmelden"` zurück.
- Dazu eine Meldungszeile `.leiste-meldung`, die über die ganze Breite geht
  (`flex-basis: 100%`) und mit `:empty { display: none }` verschwindet,
  solange nichts dasteht.
- Beim **Konto erstellen** werden die Punkte mitgenommen, die auf diesem
  Computer schon unter demselben Namen herumliegen. Sonst wäre alles
  Gesammelte auf einen Schlag weg.

### Der Server-Teil (api/)

Fünf Azure Functions, alle im **klassischen Modell** (ein Ordner mit
`function.json` + `index.js` pro Befehl). Bewusst nicht das neuere
v4-Modell — das klassische läuft auf Static Web Apps garantiert.

| Befehl | Was er tut |
|---|---|
| `registrieren` | neues Konto anlegen, Ausweis ausstellen |
| `anmelden` | Name + Passwort prüfen, Ausweis ausstellen |
| `konto` | aktuellen Stand abholen |
| `aendern` | Punkte/Münzen dazu oder weg, Rekorde nachführen |
| `rangliste` | die zehn Besten, absteigend nach Punkten |

**Wo die Konten liegen:** Azure **Table Storage**, Speicherkonto
`hannalernwelt` (Ressourcengruppe `Hanna`, Region Schweiz Nord), Tabelle
`spieler`. Eine Zeile pro Person, `RowKey` = Name in Kleinbuchstaben.
Kostet praktisch nichts (Rappen im Monat).

**Zwei Einstellungen** müssen bei der Static Web App gesetzt sein, sonst
antwortet der Server mit 500:

- `SPEICHER_VERBINDUNG` — der Verbindungstext zum Speicherkonto
- `TOKEN_GEHEIMNIS` — womit die Ausweise unterschrieben werden

Sie stehen **nirgends im Code** und dürfen nie ins Repository.

**Das Passwort** wird nie im Klartext gespeichert, sondern nur sein
Fingerabdruck (`crypto.scryptSync`) mit einem eigenen Zufalls-«Salz» pro
Person. Verglichen wird mit `timingSafeEqual` — so verrät die Antwortzeit
nicht, ab welchem Buchstaben es nicht mehr stimmt.

**Der Ausweis (Token)** ist bewusst *stateless*: Inhalt ist
`name|ablaufdatum`, dahinter eine HMAC-Unterschrift. Der Server muss sich
also nichts merken — und man kann sich auf **beliebig vielen Geräten
gleichzeitig** anmelden. Gültig ein Jahr.

**Warum Veränderungen und keine Endstände** (wichtig!): Der Browser schickt
«gib mir 1 Punkt dazu», nicht «ich habe jetzt 7». Sonst würde der Laptop den
Stand des PCs überschreiben. `aendern` liest, rechnet, schreibt — und
wiederholt das bis zu viermal, falls Azure mit `412` meldet, dass ein
anderes Gerät schneller war (`etag`).

**Die Warteschlange** in `punkte.js`: Jede Veränderung kommt zuerst auf einen
Stapel im `localStorage`. Klappt das Schicken, ist der Stapel leer; klappt es
nicht (Internet weg), bleibt sie liegen und wird beim nächsten Seitenaufruf
nachgereicht. Darum geht kein Punkt verloren.

**Kein Preflight:** Alle Anfragen sind `POST` mit `Content-Type: text/plain`
und dem Ausweis **im Text**, nicht im Header. Das ist eine «einfache»
Anfrage — der Browser fragt vorher nicht extra um Erlaubnis. Darum
funktioniert das Anmelden auch, wenn man `index.html` per Doppelklick
öffnet (`file://`). Genau dafür steht `SERVER` oben in `punkte.js` bei
`file:` auf die volle Azure-Adresse.

**Was NICHT auf den Server geht:** die Gratis-Runden. Die gehören zum
Computer, an dem der Code eingetippt wurde, nicht zum Konto — sonst könnte
man mit einem Code auf allen Geräten gleichzeitig gratis spielen.

**Passwort vergessen** gibt es nicht. Es führt kein Weg zurück, weil nur der
Fingerabdruck gespeichert ist. Zurücksetzen geht nur über das Azure-Portal
(Zeile in der Tabelle löschen, dann neu registrieren).

**Testen ohne Deploy:** Es gibt ein kleines Testskript, das die vier Befehle
direkt gegen die echte Tabelle laufen lässt (17 Prüfungen, inkl. Aufräumen
des Testkontos). Es braucht die beiden Einstellungen als Umgebungsvariablen.

### Erst anmelden, dann spielen

Ohne Anmeldung sieht man auf der Startseite nur den Kopf, die Anleitung und
den Kasten «Melde dich zuerst oben an». Die Spielkacheln, das Code-Feld und
die Rangliste sind weg.

**Wie das gemacht ist — bewusst ohne eigene JavaScript-Datei:**

`anmeldeStatusZeigen()` in `punkte.js` schreibt eine Klasse an den `<body>`:
`angemeldet` oder `nicht-angemeldet`. Den Rest macht allein das CSS:

```css
body.nicht-angemeldet #spielbereich { display: none; }
body.nicht-angemeldet #geheimfeld   { display: none; }
body.nicht-angemeldet #rangliste    { display: none; }   /* in grund.css */
body.angemeldet       #willkommen   { display: none; }
```

- Aufgerufen wird es aus `leisteZeichnen()`. Das läuft sowieso bei jeder
  Änderung des Anmeldestands — so steht der Aufruf an **einer** Stelle
  statt an fünf.
- In **allen sieben** HTML-Dateien steht `<body class="nicht-angemeldet">`.
  Das ist Absicht: so ist von Anfang an nichts zu sehen, was man noch nicht
  sehen darf. Stünde dort nichts, blitzten die Kacheln kurz auf, bevor das
  JavaScript läuft. **Neue Seiten brauchen diese Klasse ebenfalls.**
- Auf der Startseite umschliesst `<div id="spielbereich">` beide
  `.spiele`-Blöcke. `#anleitung` und `#willkommen` liegen **ausserhalb** —
  sonst würden sie sich selber wegblenden.

**Ehrlich dazusagen:** Das ist eine Anzeige-Sperre, kein Schloss. Wer
`quiz.html` direkt in die Adresszeile tippt, kann weiterhin spielen — nur
ohne Punkte. Für ein echtes Schloss müsste jede Spielseite beim Server
nachfragen und sonst zur Startseite zurückschicken.

**Zwei Kästen auf der Startseite:**

| Kasten | wann sichtbar | Inhalt |
|---|---|---|
| `#anleitung` | **immer** | «So läuft es»: Punkte, Münzen, Server |
| `#willkommen` | nur ausgeloggt | die drei Anmelde-Schritte |

`#willkommen` ist gold gehalten wie der «Neu hier?»-Knopf, auf den er
zeigt. Der Pfeil `↑` wippt per CSS-`animation` nach oben zur Leiste.

### Die Rangliste (linker Rand)

Ein Kasten, der am **linken Fensterrand** klebt und die zehn Besten zeigt.
Auf allen Seiten, gebaut von `js/rangliste.js`.

**Nur für Angemeldete.** Ohne Ausweis blendet das CSS den Kasten weg und
`ranglisteLaden()` fragt den Server gar nicht erst — vorher stand da für
Nichtangemeldete eine Liste, in der man selber nicht vorkommen konnte.

- Der Kasten steht in **keiner** HTML-Datei — `ranglisteEinbauen()` hängt ihn
  unten in den Body, genau wie `leisteEinbauen()` bei der Spielerleiste.
  `position: fixed` klebt ihn ans Fenster; darum verschiebt er den Inhalt in
  der Mitte **nicht**.
- `rangliste.js` braucht `serverFragen()` und `token()` aus `punkte.js` und
  muss darum **nach** ihm geladen werden. Steht das `<script>` davor, gibt es
  eine Fehlermeldung. Die sieben HTML-Dateien haben dazu einen Kommentar.
- Umgekehrt kennt `punkte.js` die Rangliste **nicht** fest: es ruft
  `ranglisteAuffrischen()`, und das schaut zuerst mit `typeof … === "function"`
  nach, ob es sie überhaupt gibt. So läuft `punkte.js` auch ohne. Derselbe
  Trick wie beim Code-Feld ganz unten in der Datei.
- Aufgefrischt wird sie beim Anmelden, beim Registrieren, beim Abmelden und
  jedes Mal, wenn der Server eine Punkteänderung bestätigt hat.
- **Kein Passwort verlässt je die Tabelle.** Der Server zählt in
  `queryOptions.select` genau auf, welche Spalten geholt werden dürfen —
  `salz` und `fingerabdruck` sind nicht dabei. Ein Test prüft das eigens.
- Der Ausweis ist beim Abfragen **freiwillig**. Ist einer dabei, markiert der
  Server die eigene Zeile mit `ich: true` (Klasse `.rang-zeile.ich`, gold
  hinterlegt). Der Server selber würde auch ohne Ausweis antworten — die
  Anzeige verlangt ihn, nicht die Schnittstelle.
- Sortiert wird nach Punkten, bei Gleichstand nach Münzen, dann nach Name —
  der Name zuletzt, damit die Reihenfolge nicht bei jedem Aufruf anders ist.
- Plätze 1–3 bekommen 🥇🥈🥉, ab Platz 4 die Zahl. `PLAETZE = 10` und
  `HOECHSTENS = 500` (Notbremse beim Lesen) stehen zuoberst in
  `api/rangliste/index.js`.
- `.rang-zeile` hat von Anfang an einen **durchsichtigen** Rahmen. Sonst
  würde die eigene Zeile beim Einfärben plötzlich 2px höher und die Liste
  würde zucken.
- **Unter 1250px Fensterbreite wird sie ausgeblendet** (`@media` in
  `grund.css`). Sonst fiele sie über den Inhalt. Das Spiel in der Mitte ist
  wichtiger als die Liste am Rand.
- `z-index: 40` — weniger als die 50 vom Konfetti, damit es davor regnet.
- Sie ist **280px breit** und in grösserer Schrift gehalten (von Daniel so
  gewünscht). Beim Verbreitern muss die `@media`-Grenze mitwachsen, sonst
  überlappt sie den Inhalt.

**Die Meldung «Platz 1»** (`platzPruefen()` in `rangliste.js`):

Wer neu auf den ersten Platz steigt, bekommt eine Tafel und Konfetti.
Der letzte Platz steht unter `lernwelt-letzter-platz` im `localStorage`.

Drei Bedingungen müssen stimmen — **alle drei sind nötig**:

1. jetzt Platz 1
2. der frühere Platz ist überhaupt bekannt (`!== null`)
3. der frühere Platz war nicht schon 1

Ohne Nummer 2 poppte die Meldung bei **jedem Seitenwechsel** wieder auf,
solange man vorne liegt — das ist der Fehler, auf den man hier hereinfällt.
Beim Abmelden wird der Merkzettel gelöscht, damit nach dem nächsten
Anmelden sauber von vorne gezählt wird.

Konfetti gibt es nur auf Seiten, die `konfetti.js` geladen haben. Darum
`if (typeof konfetti === "function")` — derselbe Trick wie bei
`ranglisteAuffrischen()`.

### Die Tafeln (`tafelZeigen`, `#tafeln` in `grund.css`)

Kurze Einblendungen oben in der Mitte, die nach ein paar Sekunden von
selbst verschwinden. Zwei Stellen brauchen sie: die Meldung «Platz 1» und
der Münz-Bonus. Der Befehl steht in `punkte.js`, weil das auf allen Seiten
geladen ist.

- Alle Tafeln kommen in **denselben Behälter** `#tafeln` (flex, Spalte).
  Ohne ihn lägen zwei gleichzeitige Tafeln exakt übereinander.
- `z-index: 60` — **über** dem Konfetti (50), sonst liest man sie nicht.
- `pointer-events: none`, damit man hindurchklicken kann.
- `setTimeout` räumt jede Tafel wieder weg. Ohne das stapeln sie sich,
  bis die Seite neu geladen wird.

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

### Das Code-Feld (index.html unten rechts, `#geheimfeld`)

Ein kleines Feld unten in der Ecke der Startseite. Wer den PIN kennt,
bekommt **fünf Gratis-Runden** für die Belohnungsspiele.

- `PIN` und `GRATIS_PRO_CODE` stehen zuoberst in `js/punkte.js`.
  Aktuell `"8590"` und `5`. Nur dort ändern.
- Gespeichert als **Zahl** unter `lernwelt-gratis-rennen`, nicht als «ja».
  `punkteAbziehen()` knipst pro Start eine Runde ab (Fünferkarte).
  Ist der Schlüssel bei 0, kostet es wieder Punkte.
- `codeIstFrei()` ist nur `gratisRennen() > 0` — ein Einzeiler, damit die
  Spiele nicht überall `> 0` schreiben müssen.
- `type="password"` versteckt die Eingabe, `autocomplete="off"` verhindert
  Chromes «Passwort speichern?». **Ehrlich dazusagen:** versteckt ≠ geheim,
  der PIN steht im Klartext in `punkte.js`.
- Das Feld ist mit `opacity: 0.6` blass und wird bei `:hover` /
  `:focus-within` deutlich. Vorher stand 0.3 — da hat Hanna es nicht
  gefunden. Nicht wieder blasser machen.
- Wünsche von Hanna in dieser Reihenfolge: erst Enter-Cheat, dann Feld
  statt Enter, dann «Code» statt «Geheimcode», dann PIN 8590, dann Ziffern
  verstecken, dann fünf Runden statt einer. Der Verlauf zeigt: sie
  präzisiert gerne schrittweise — kleine Schritte anbieten, nicht alles
  auf einmal fertig bauen wollen.

### Blitzrunde (blitz.html)

Richtig oder falsch in **60 Sekunden**. Von Hanna aus vier Vorschlägen
gewählt. Farbe: **Gold** (`#a8760a`, Flächen `#fdf3d3`, Rahmen `#e8c96b`).

- Die 30 Aussagen stehen **nur** in `aussagen` zuoberst in `js/blitz.js`,
  gruppiert nach Themen. `startZeit` 60, `zielPunkte` 8.
- **Regel für neue Aussagen** (von Hanna eingefordert): Keine zwei Aussagen
  dürfen über dieselbe Sache das Gegenteil behaupten. Ich hatte zuerst
  «ss heisst selbstständig» *und* «ss heisst mit Hilfe» drin, nur damit
  15:15 aufgeht — das hat sie sofort reklamiert. Jede Sache genau einmal.
- **15 richtig, 15 falsch.** Wichtig, sonst gewinnt man durch stures
  Drücken auf einen Knopf. Vorher war es 15:7.
- Steuerung mit `←` / `→` **und** Knöpfen. Die Karte blinkt 300 ms grün
  oder rot (`#karte.gut` / `.schlecht`), gleiche Pastelltöne wie im Quiz.
- Die Aussagen sind **fachlich noch nicht von Hanna geprüft**.

### Dachheldin (dach.html)

Belohnungsspiel im Stil eines Endless Runners, von Dach zu Dach springen
und **Münzen** sammeln. Kostet 2 Punkte. Farbe: **Pastell-Flieder**
(`#5a63b8`) — von Hanna gewählt. Vorher war es dasselbe Lila wie beim
Rennen; sie wollte eine eigene Farbe. Flieder liegt bewusst nah beim
Lila, damit man beide noch als Belohnungsspiele erkennt.

- Steuerung: **Leertaste** oder Knopf. `springen()` geht nur, wenn
  `amBoden === true` — so gibt es keinen Doppelsprung.
- Kein Doppelsprung heisst: `preventDefault()` bei der Leertaste ist
  Pflicht, sonst scrollt die Seite *und* der fokussierte Knopf feuert nochmal.
- **Die wichtigste Erkenntnis:** Absprung und Schwerkraft müssen mit dem
  Tempo mitwachsen (`sprungKraft * faktor`, `schwerkraft * faktor * faktor`,
  `faktor = tempo / startTempo`). Sonst fliegt der gleiche Sprung bei hohem
  Tempo immer weiter und irgendwann über jedes Dach hinweg — dann ist kein
  Sprung mehr zu schaffen. Ich habe das mit einer Simulation in Node
  gefunden: ein Test-Spieler, der den besten Absprungpunkt sucht, starb
  ohne Skalierung reproduzierbar bei Tempo ≈ 9,5 an einer Hauswand.
- Dazu `maxTempo = 8`. Mit Deckel schafft der Test-Spieler 60'000 Takte in
  allen Durchläufen, ohne Deckel stirbt er. **Nicht erhöhen ohne neu
  durchzurechnen.**
- Dächer 90–150 px breit (breiter als der 70 px lange Sprungbogen),
  Lücken **40–57 px**, Höhenwechsel **-40 bis +30** — nach oben weniger, weil
  der Sprung nur etwa 60 px hoch geht.
- Landung: `alteFuesse <= dachOben && neueFuesse >= dachOben`. Die alte
  Fussposition ist nötig, sonst würde die Figur auf ein höheres Dach
  «hochschnappen», statt an die Wand zu knallen.
- `dachUnter()` darf das erste Treffer-Dach zurückgeben, weil die Lücke
  (≥ 40) immer breiter ist als die Figur (26) — sie kann nie auf zwei
  Dächern gleichzeitig stehen.

**Das Ziel bei Strecke 800** (von Hanna gewünscht):

- `ziel = 800`, `zielVorlauf = 100`, `zielBelohnung = 1` — alles oben in
  `dach.js`. 800 Takte × 20 ms = **16 Sekunden** pro Runde, Tempo am Ziel
  4,1 (Deckel 8). 16 Sekunden ist die von Hanna gewählte Rundenlänge
  (zuerst 1000 = 20 s, dann auf 800 gekürzt) — beim Ändern nachrechnen.
- Wer das Ziel erreicht: Konfetti + **1 Gratis-Runde** gutgeschrieben.
  Der Knopf heisst danach von selbst «Nochmal (noch 1 gratis)».
- Das Zielband ist ein `<div class="ziel">` (schwarz-weiss gestreift via
  `repeating-linear-gradient`) mit Schild `.ziel-band`. `zielBandSetzen()`
  stellt es bei `x = figurX + (ziel - strecke) * tempo` hin, damit es
  **genau bei Strecke 800** bei der Heldin ist. Das Tempo wächst dabei
  leicht weiter, die Abweichung ist ~6 px — vernachlässigbar.
- Das Konfetti fiel **schon immer** von oben nach unten (`top: -20px`,
  `translateY(105vh)` in `grund.css`). Für die Dachheldin musste nur
  `konfetti.js` in `dach.html` dazugeladen werden.
- `gratisRundenDazu(n)` in `punkte.js` ist der gemeinsame Befehl für
  Code-Feld und Ziel. Braucht **keine** Anmeldung: Gratis-Runden gehören
  zum Browser, nicht zu einem Namen.
- Der Rekord ist jetzt der **Münz-Rekord** (`rekordSpeichern("dach-muenzen",
  muenzen)`). Vorher war es die Strecke — die ist bei 800 gedeckelt und
  taugt nicht mehr als Bestleistung.
- `nochmalKnopf()` und `muenzHinweis()` sind ausgelagert, weil beide
  Schlusstafeln (Absturz und Ziel) sie brauchen.

**Die Heldin** (von Hanna gewünscht: Frau mit Superhelden-Umhang):

- Sie ist ein **`<svg>` direkt in `dach.html`**, kein Emoji. Grund: ein Emoji
  lässt sich nicht umfärben und nicht spiegeln — 🏃 schaut nach links, sie
  läuft aber nach rechts. Gezeichnet ist sie nach rechts schauend.
- Teile mit eigener Klasse: `.umhang` `.anzug` `.hose` `.stern` `.haare`
  `.stiefel` `.haut` `.auge`. Die Farben stehen gebündelt unter
  «HIER ZIEHST DU DIE HELDIN AN» in `dach.css` — dort ändern, nicht verstreut.
  Umfärben ist ausdrücklich als *ihr* Spielplatz gedacht.
- Reihenfolge im SVG zählt: später gezeichnet = liegt oben. Umhang zuerst
  (liegt hinten), Kopf nach dem Anzug, vorderer Arm zuletzt.
- Der Umhang flattert per CSS-`animation` mit `transform-origin: 12px 11px`
  (die Schulter). Ohne origin würde er um die Bildmitte kippen.
- Beim Absturz wird die Zeichnung nur **versteckt**
  (`figur.classList.add("abgestuerzt")`, CSS blendet `.knall` 💥 ein).
  Vorher stand dort `figur.innerHTML = "..."` — das hätte das SVG zerstört.
- **Name:** «Dachheldin». Hanna schlug «Superman Rennen» vor; Superman und
  Supergirl sind geschützte Namen, darum ein eigener. Dateien heissen weiter
  `dach.*` — passt zum Namen, anders als bei galgen/Hangman.
- **Titelbild** auf der Startseite: ebenfalls ein `<svg>` (Heldin springt
  über die Lücke zwischen zwei Dächern), kein Emoji. Klassen dort mit
  `k-` vorne (`.k-umhang`, `.k-dach` …), damit sie nicht mit `.dach`
  aus `start.css` oder mit `dach.css` kollidieren. Farben in `start.css`.

- Münzen: `muenzenDazu(1)` sofort beim Einsammeln, damit die Leiste oben
  live mitzählt. Ohne Anmeldung nicht gespeichert (wird auf der Tafel
  ehrlich gesagt).
- Seit 18.08.2026 sind die Münzen **nicht mehr nur eine Sammelzahl**: für
  je 100 gibt es 1 Punkt geschenkt. Damit lohnt sich die Dachheldin auch
  für Leute, die keine Rekorde jagen. Der Umtausch steckt komplett in
  `muenzenDazu()` in `punkte.js` — `dach.js` weiss nichts davon und musste
  nicht angefasst werden.

### Startseite (index.html)

Reihenfolge auf der Seite: `.kopf` · `#anleitung` · `#willkommen` ·
`#spielbereich` (beide `.spiele`-Blöcke) · `.fusszeile` · `#geheimfeld`.
Die letzten beiden Kästen und der Spielbereich hängen am Anmeldestand —
siehe «Erst anmelden, dann spielen».

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

Die «kommt bald»-Kacheln stehen absichtlich schon da: so sieht man den
Plan hinter dem Projekt.

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
| Gold | `#a8760a`, pastell `#fdf3d3`, Rahmen `#e8c96b` | Blitzrunde, Knopf «Neu hier?» |
| Lila | `#7b5aa6` / `#5b3f87`, pastell `#ece3f7` / `#ddd2ee`, Rahmen `#b79ddb` | Rennen |
| Flieder | `#5a63b8` / `#414a94`, pastell `#e3e5f7` / `#d4d7f0`, Rahmen `#a8aee0` | Dachheldin |
| Münz-Bronze | `#f7e0cd` + Schrift `#8f5228` | `.muenzen-marke` in der Leiste |

Jedes Spiel hat **eine** eigene Farbe, die es überall durchzieht: Überschrift,
Zähler, Knöpfe, Neustart-Knopf, Link «Zur Startseite» und die Kachel auf der
Startseite. Beim Umfärben eines Spiels also immer beide Dateien anschauen:
`css/<spiel>.css` **und** den Block in `css/start.css`.

Achtung beim Umfärben mit Suchen-und-Ersetzen: Rennen und Dachheldin hatten
einmal **dieselben** Hex-Werte. In `start.css` stehen beide Blöcke direkt
untereinander — dort nur den richtigen Block ändern, nicht global ersetzen.

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

## Es gibt KEINE Präsentation

Hier stand früher, Tag 3 sei ein Präsentationstag. Das war falsch.
Hanna hat am 18.08.2026 ausdrücklich gesagt, dass sie **keine Präsentation
halten muss** und das ganz aus dem Programm gestrichen haben will.
Also: nicht mehr erwähnen, keine Zeit dafür reservieren, kein Drängen
zum Abschliessen.

## Stand am Dienstag, 18.08.2026

**Fertig und spielbar:** Startseite, Quiz (10 Fragen), Memory (8 Paare),
Hangman (55 Wörter, 9 Fehler), Blitzrunde (30 Aussagen in 60 Sekunden),
Rennen und Dachheldin (Belohnung), Anmelden mit Punktekonto, Münzen,
Code-Feld für Gratis-Runden, Konfetti, Smileys, Pastell-Farbkonzept
mit einer eigenen Farbe pro Spiel.

**Neu am Nachmittag:** richtiges Konto mit **Name und Passwort** auf einem
Server. Punkte, Münzen und Rekorde sind jetzt an jedem Computer dieselben.
Siehe «Der Server-Teil (api/)».

**Sicherungen** (in `C:\Users\danie\`):

- `mein-quiz-sicherung-2026-08-18-0954.zip` ← aktuell: Dachheldin mit
  Ziel bei 800, Superheldin-SVG, Titelbild, Münzen
- `mein-quiz-sicherung-2026-08-18.zip` ← Vormittag: Blitzrunde und
  Dachsprung neu, noch mit Emoji-Figur und ohne Ziel
- `mein-quiz-sicherung-2026-08-17.zip` ← Ende Tag 2

Neue Sicherung mit **Datum und Uhrzeit** im Namen anlegen, die alten
**nicht** überschreiben — so kann man notfalls zurück. Mehrere pro Tag
sind ausdrücklich in Ordnung.

**Geklärt: die «3× Enter»-Sache war gar kein Fehler.** Hanna wollte einen
Cheat-Code *haben*, nicht ein Loch gestopft bekommen. Daraus wurde das
Code-Feld auf der Startseite. Lehre daraus: bei so einer Meldung zuerst
fragen, ob sie einen Fehler **meldet** oder eine Funktion **wünscht** —
ich hatte zuerst lange nach einer Sicherheitslücke gesucht, die es nie gab.

**Noch offen:**

1. Punkte lassen sich unbegrenzt farmen (dasselbe Quiz mehrfach spielen).
   Ist so gewollt; Hanna weiss davon und könnte es begrenzen wollen.
2. Die 30 Aussagen in `js/blitz.js` sind von mir vorgeschlagen und noch
   **nicht von Hanna fachlich durchgesehen**. Sie kennt den Beruf, ich nicht.

**Was sie am Projekt selber erklären kann:**

- Warum es drei Dateien pro Spiel gibt (HTML / CSS / JavaScript)
- Warum `grund.css`, `konfetti.js` und `punkte.js` geteilt werden
- Das Farbkonzept: jede Farbe hat eine Bedeutung
- Warum ein echtes Login einen Server braucht — und warum `type="password"`
  die Zahlen nur **versteckt**, nicht geheim macht
- Warum ein Passwort nie im Klartext gespeichert wird, sondern nur sein
  Fingerabdruck (und warum man daraus nicht zurückrechnen kann)
- Warum der Browser «gib mir 1 dazu» schickt und nicht «ich habe jetzt 7»
- Der gelenkte Zufall bei den Sternen («fühlte sich unfair an»)
- Warum 15 richtige und 7 falsche Aussagen ein kaputtes Spiel wären
- Der Fehler mit dem fehlenden `</fieldset>` und wie sie ihn gefunden hat

## Offene Ideen

- Mehr Fragen (sie schreibt eigene aus ihrem Berufsfeld)
- Eigene Aussagen für die Blitzrunde
- Fortschrittsanzeige («Frage 2 von 5»)
- Knopf «Nochmal von vorne»
- Erklärung zur richtigen Antwort einblenden
- Ein sechstes Spiel: Reihenfolge sortieren, «Wo ist das Organ?»
  oder Buchstabensalat (Vorschläge lagen schon auf dem Tisch)
