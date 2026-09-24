# Fundamentos de la Restauración · Instituto

Guion interactivo para Religión 225 (experiencia **Teleprompter sagrado**).

Varias clases en el mismo sitio: elige en el inicio o pasa `?clase=11-12` / `?clase=9-10`.

- Vista **maestro** (celular): qué decir, tip, escrituras y citas.
- Vista **alumnos / TV**: tipografía grande para transmitir al televisor.

## Abrir en local

```bash
cd fundamentos-restauracion-lecciones-9-10
python3 -m http.server 8765
```

- Inicio: http://127.0.0.1:8765/
- Lecciones 11–12 (60 min) maestro: http://127.0.0.1:8765/clase.html?clase=11-12&vista=maestro
- Lecciones 11–12 TV: http://127.0.0.1:8765/clase.html?clase=11-12&vista=alumnos
- Lecciones 9–10 (90 min): `?clase=9-10`

## Controles

- Flechas ← → o botones Atrás / Siguiente
- `T` inicia/pausa el temporizador (60:00 en 11–12)
- `M` / `A` cambian vista maestro / alumnos

## Añadir otra clase

1. Crea `data/clases/<id>.js` con `COURSE` + `SLIDES` (mismo formato).
2. Agrégala en `data/catalog.js`.
