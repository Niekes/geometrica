# Geometrica

Interaktiver Generator für geometrische LineArt: Formen werden auf der Zeichenfläche wiederholt, eingefärbt und als SVG exportiert.

## Language

### Komposition

**Kunstwerk**:
Alles, was auf der Zeichenfläche komponiert ist: der Hintergrund und alle Layer in ihrer Z-Ordnung. Ein Kunstwerk wird als SVG exportiert und als Link geteilt.
_Avoid_: Szene, Scene, Artwork, Bild, Effekt

**Export**:
Die SVG-Datei, die aus einem Kunstwerk entsteht: der Hintergrund und alle sichtbaren Layer. Transparenzmuster, Raster, Drehpunkt und Begrenzungsrahmen sind Arbeitshilfen und gehören nie dazu.
_Avoid_: Download, Speichern

**Zeichenfläche**:
Die quadratische Fläche, auf der Layer komponiert werden. Exportiert wird alles, was auf ihr gezeichnet ist; Transparenzmuster und Raster sind reine Arbeitshilfen.
_Avoid_: Canvas, Stage, Artboard, Bearbeitungsfläche, Zeichenunterlage

**Hintergrund**:
Farbe, Deckkraft und Eckradius der Zeichenfläche. Er gehört zu keinem Layer und ist Teil des Exports; Instanzen werden an seiner Form abgeschnitten.
_Avoid_: bgColor, Canvas-Hintergrund

**Hintergrund-Opacity**:
Deckkraft des Hintergrunds, stufenlos von 0 (transparent) bis 1.
_Avoid_: Alpha, Hintergrund-Transparenz

**Transparenzmuster**:
Das Schachbrettmuster hinter der Zeichenfläche, das transparente Stellen des Exports sichtbar macht. Es wird nicht exportiert.
_Avoid_: Checkerboard, Schachbrett

**Raster**:
Hilfslinien und Keylines über der Zeichenfläche zum Ausrichten von Formen. Es skaliert mit der Zeichenfläche und wird nicht exportiert.
_Avoid_: Gitter

**Keyline**:
Eine Hilfsform des Rasters nach den Material-Icon-Richtlinien: Kreis, Innenkreis, Quadrat, Hochformat- oder Querformat-Rechteck.
_Avoid_: Hilfsform, Schlüssellinie

**Einrasten**:
Das Ausrichten der Position oder des Drehpunkts eines Layers an den Rasterlinien, während er auf der Zeichenfläche verschoben wird. Der Drehpunkt rastet zusätzlich auf der Position ein. Es lässt sich unabhängig vom Raster ein- und ausschalten.
_Avoid_: Snapping, Snap

**Form**:
Eine Pfadgeometrie (Rect, Circle, Polygon oder eine eigene Form aus eingefügten SVG-Pfaden). Mehrere eingefügte Pfade bilden zusammen eine Form. Die Form selbst ist nur die Geometrie, ohne Wiederholungs- oder Stilparameter.
_Avoid_: Shape, Figur, Objekt

**Position**:
Der Versatz des Form-Mittelpunkts vom Mittelpunkt der Zeichenfläche. Alle Instanzen eines Layers teilen ihn.
_Avoid_: Offset, Koordinate

**Drehpunkt**:
Der Punkt, um den sich die Instanzen eines Layers entlang der Wiederholung drehen. Jeder Layer hat seinen eigenen. Er ist ein Versatz von der Position und wandert mit, wenn der Layer verschoben wird. Liegt er auf der Position, dreht sich jede Instanz um ihren eigenen Mittelpunkt; liegt er daneben, kreisen die Instanzen um ihn. Auf der Zeichenfläche ist er zu sehen und zu ziehen, solange er eingeblendet ist, unabhängig vom Raster; exportiert wird er nie.
_Avoid_: Rotation Center, Pivot, Ursprung, Ankerpunkt

**Begrenzungsrahmen**:
Das Rechteck um alle Instanzen des ausgewählten Layers samt ihrer Kontur. Es zeigt an, dass der Layer gerade verschoben werden kann. Es ist eine Arbeitshilfe und wird nie exportiert.
_Avoid_: Bounding Box, Auswahlrahmen, Selection

**Instanz**:
Eine einzelne gezeichnete Wiederholung einer Form auf der Zeichenfläche.
_Avoid_: Kopie, Iteration

**Wiederholung**:
Die Sequenz von Instanzen einer Form, gesteuert durch amount, distance und rotation.
_Avoid_: Loop, Serie

**Layer**:
Eine vollständige Konfiguration aus Form, Wiederholung, Farbe und Füllung. Layer stapeln sich in Z-Ordnung auf der Zeichenfläche; beliebig viele sind möglich.
_Avoid_: Ebene, Schicht

**Preset**:
Eine fertige Formauswahl innerhalb eines Layers. Rect, Circle und Polygon sind Presets, keine eigenständigen Modi mehr.
_Avoid_: Formtyp

### Farbe & Füllung

**Verlauf**:
Ein Farbgradient, der eine Instanzfläche füllt (linear oder radial), mit Farbstopps aus einem Color-Interpolator.
_Avoid_: Gradient, Farbschema

**Sequenz-Verlauf**:
Die Farbverläufe entlang der Wiederholung: die Instanzposition bestimmt die Farbe über den Color-Interpolator.
_Avoid_: Farbinterpolation über Instanzen

**Color-Interpolator**:
Eine benannte d3-Farbramppen-Funktion, die eine Position [0..1] auf eine Farbe abbildet.
_Avoid_: Farbschema, Palette

**Fill-Opacity**:
Deckkraft der Füllung einer Instanz, stufenlos von 0 (keine Füllung) bis 1. Fill und Stroke teilen sich dieselbe Farbe.
_Avoid_: Fill-Modus, Zeichenmodus

**Stroke-Opacity**:
Deckkraft der Kontur einer Instanz, stufenlos von 0 (keine Kontur) bis 1. Unabhängig von der Fill-Opacity einstellbar.
_Avoid_: Fill-Modus, Zeichenmodus

**Layer-Opacity**:
Deckkraft eines ganzen Layers, die Fill-Opacity und Stroke-Opacity gemeinsam abschwächt. Sich überlappende Instanzen desselben Layers addieren sich dabei.
_Avoid_: Layer-Opazität

### Bedienung

**Agent**:
Ein Programm, das das Kunstwerk auf Zuruf liest und ersetzt, statt dass jemand die Regler bedient.
_Avoid_: Bot, KI, Assistent

**Galerie**:
Die kuratierte Sammlung fertiger Kunstwerke, von denen man eines öffnet, um daran weiterzuarbeiten.
_Avoid_: Gallery, Vorlagen, Beispiele, Presets

### Architektur

**Zone**:
Eine Schicht der App-Architektur mit festgelegten Importrechten. Abhängigkeiten zeigen nur nach innen (types → config → lib → composables → components → views); die Grenzen werden von fallow erzwungen.
_Avoid_: Schicht (im Architektursinne), Layer (kollidiert mit dem Bild-Layer)
