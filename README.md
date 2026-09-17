# Fundamentos de la Restauración · Lecciones 9–10

Guion interactivo para Instituto (Religión 225), experiencia **Teleprompter sagrado**.

- Vista **maestro** (celular): qué decir, tip, escrituras completas y citas oficiales.
- Vista **alumnos / TV**: tipografía grande, versículos completos en pantalla, pensada para transmitir al televisor.

## Abrir en local

```bash
cd fundamentos-restauracion-lecciones-9-10
python3 -m http.server 8765
```

- Inicio: http://127.0.0.1:8765/
- Maestro: http://127.0.0.1:8765/clase.html?vista=maestro
- TV: http://127.0.0.1:8765/clase.html?vista=alumnos

## Controlo

- Flechas ← → o botones Atrás / Siguiente
- `T` inicia/pausa el temporizador de 90:00
- `M` / `A` cambian vista maestro / alumnos
