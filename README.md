# AWS Cert Simulator

Simulador de exámenes de certificación AWS. Permite practicar preguntas de múltiple opción para distintas certificaciones directamente en el navegador, sin instalaciones ni backend.

## Certificaciones disponibles

- **Cloud Practitioner** (CLF-C02) — Foundational
- **Solutions Architect Associate** (SAA-C03) — Associate *(próximamente)*

## Cómo correr el proyecto

Es un proyecto HTML estático puro, no requiere Node, Python ni ningún servidor especial.

### Opción 1 — Abrir directo en el navegador

Abre el archivo `index.html` en cualquier navegador moderno (Chrome, Firefox, Edge):

```bash
# En Linux / WSL
xdg-open index.html

# En macOS
open index.html

# En Windows
start index.html
```

> **Nota:** Algunos navegadores bloquean la carga de archivos JSON locales por políticas de CORS. Si las preguntas no cargan, usa la opción 2.

### Opción 2 — Servidor local con Python (recomendado)

```bash
# Python 3
python3 -m http.server 8080

# Python 2 (si aplica)
python -m SimpleHTTPServer 8080
```

Luego abre [http://localhost:8080](http://localhost:8080) en el navegador.

### Opción 3 — Servidor local con Node.js

```bash
npx serve .
```

### Opción 4 — Extensión VS Code

Instala la extensión **Live Server** y haz clic en *Go Live* desde `index.html`.

## Estructura del proyecto

```text
aws-cert-simulator/
├── index.html       # App completa (UI + lógica)
└── questions.json   # Banco de preguntas por certificación
```

## Agregar preguntas

Las preguntas viven en `questions.json`. Cada pregunta sigue esta estructura:

```json
{
  "id": "cp001",
  "text": "Enunciado de la pregunta",
  "options": [
    { "letter": "A", "title": "Opción A", "desc": "" },
    { "letter": "B", "title": "Opción B", "desc": "" },
    { "letter": "C", "title": "Opción C", "desc": "" },
    { "letter": "D", "title": "Opción D", "desc": "" }
  ],
  "answer": "A",
  "explanation": "Explicación de por qué A es correcta."
}
```

Agrega el objeto dentro del array `questions` del nivel correspondiente en `levels`.
