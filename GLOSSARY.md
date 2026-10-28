# Geometrica

Interaktiver Generator für geometrische LineArt: Formen werden auf der Zeichenfläche wiederholt, eingefärbt und als SVG exportiert.

## Language

### Komposition

**Zeichenfläche**:
Die quadratische Fläche, auf der Layer komponiert werden. Was auf ihr sichtbar ist, ist genau das, was exportiert wird.
_Avoid_: Canvas, Stage, Artboard

**Hintergrund**:
Farbe und Eckradius der Zeichenfläche. Er gehört zu keinem Layer und ist Teil des Exports; Instanzen werden an seiner Form abgeschnitten.
_Avoid_: bgColor, Canvas-Hintergrund

**Form**:
Eine Pfadgeometrie (Rect, Circle, Polygon oder eigene SVG-Path-Eingabe). Die Form selbst ist nur die Geometrie, ohne Wiederholungs- oder Stilparameter.
_Avoid_: Shape, Figur, Objekt

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

**Fill-Modus**:
Pro Layer wählbare Darstellung einer Instanz: Stroke, Fill oder Fill+Stroke.
_Avoid_: Zeichenmodus

### Architektur

**Zone**:
Eine Schicht der App-Architektur mit festgelegten Importrechten. Abhängigkeiten zeigen nur nach innen (types → config → lib → composables → components → views); die Grenzen werden von fallow erzwungen.
_Avoid_: Schicht (im Architektursinne), Layer (kollidiert mit dem Bild-Layer)
