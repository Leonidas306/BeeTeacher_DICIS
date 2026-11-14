<h1 align="center">🐝 BeeTeacher — Sistema de Tutores, Salones Vacíos, Agenda y Bitácora (DICIS / UG)</h1>

<p align="center">
<strong>Plataforma web y PWA 100% gratuita para conectar estudiantes con tutores pares y asesores académicos, consultar salones vacíos en tiempo real y gestionar horarios y bitácoras en la División de Ingenierías Campus Irapuato-Salamanca (DICIS) de la Universidad de Guanajuato.</strong>
</p>

<p align="center">
<img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
<img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19" />
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5" />
<img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
<img src="https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white" alt="Python 3.12" />
<img src="https://img.shields.io/badge/Cost-\$0%2Fmes\_(Zero--DB)-10B981" alt="Zero-DB $0/mes" />
</p>

## ¿Qué es y qué NO es este proyecto?

**BeeTeacher** es una evolución directa de la arquitectura de [DICIS-Tracker](https://github.com/moraxh/DICIS-Tracker/tree/main). Combina un directorio interactivo de tutores académicos (`#DICIS`, `#TutorPar` y `#Externo`) con el detector de **salones vacíos en tiempo real** a partir de los horarios oficiales publicados por [CAECIS UG](http://www.caecis.ugto.mx/caecis/pages/horarios.aspx), además de integrar una **Agenda Semanal estudiantil/docente** y una **Bitácora de Asistencia** para el programa institucional de *Asesorías Entre Pares (Beca de Comunidad Universitaria UG)*.

* **Qué SÍ es:** Una herramienta comunitaria, rápida, instalable como aplicación móvil (PWA) y de **costo operativo \$0**, donde los tutores se dan de alta mediante **Google Forms** verificados, sus perfiles se sincronizan en tiempo real desde **Google Sheets (CSV)** y los estudiantes agendan asesorías en un clic vía **WhatsApp** o **Correo Institucional (`@ugto.mx`)** viendo qué aulas están desocupadas en ese mismo bloque horario.

* **Qué NO es:** No es un sistema oficial administrado por la Universidad de Guanajuato ni almacena contraseñas o cuentas bancarias. La agenda personal, los favoritos y las bitácoras se guardan de forma privada en el navegador de cada usuario (`localStorage`).

## Infraestructura y costos (\$0 / mes — Arquitectura Zero-DB)

El proyecto está diseñado para operar **sin pagar servidores ni bases de datos relacionales**, delegando cada capa a servicios gratuitos:

| Capa | Servicio / Tecnología | Costo | Función en BeeTeacher | 
| ----- | ----- | ----- | ----- | 
| **Frontend y API Edge** | **Next.js 16 (App Router) + Vercel** | **\$0 / mes** | Renderizado de interfaz, buscador difuso, cruce de horarios con salones vacíos y proxy local de imágenes de Google Drive (`/api/v1/image`). | 
| **Ingesta de Tutores y Reseñas** | **Google Forms + Google Sheets (CSV)** | **\$0 / mes** | Captura de tutores `#DICIS`/`#TutorPar`, asesores `#Externo` y calificaciones de alumnos con enlace prellenado. | 
| **Automatización de Horarios UG** | **Python + GitHub Actions** | **\$0 / mes** | Extracción de los PDFs oficiales de horarios de [CAECIS UG](http://www.caecis.ugto.mx/caecis/pages/horarios.aspx) (`rooms.json` y `classes.json`). | 
| **Persistencia Personal del Usuario** | **Web `localStorage` (Cliente)** | **\$0 / mes** | Almacenamiento privado de Favoritos, **Mi Agenda** (materias del semestre + eventos semanales) y **Mi Bitácora** con exportación a CSV/Excel. | 

## Características principales

* **Directorio de Tutores con Perfiles Estilo Red Social:**

  * Tarjetas y modales con **foto de perfil cuadrada (1:1)** y **banner de portada horizontal (16:9)** cargados automáticamente desde Google Drive mediante un proxy propio (`/api/v1/image`) que evita bloqueos de permisos o cookies.

  * Identificación visual por origen: **`#DICIS`** (comunidad universitaria verificada mediante **NUA de 6 dígitos** como ID único irrepetible) y **`#Externo`** (asesores particulares independientes identificados por su teléfono de 10 dígitos).

  * Insignia **`#TutorPar`** para becarios del programa institucional de *Asesorías Entre Pares UG*, coexistiendo con tarifas base por **30 minutos** y **1 hora** para sesiones particulares o fuera de cuota de beca.

  * Visualización de **etiqueta de Carrera (`🎓 Ing. en Sistemas...`)** y **Correo Institucional (`@ugto.mx`)** tanto en la tarjeta como en el perfil completo, con botón de contacto directo por correo además de WhatsApp.

* **Cruce Inteligente de Tutores + Salones Vacíos en Tiempo Real:**

  * Al abrir el perfil de un tutor con modalidad **`#Presencial`** y elegir un bloque horario (ej. *Miércoles 12:00 - 14:00*), BeeTeacher consulta automáticamente los horarios oficiales de la sede (**Salamanca** o **Yuriria**) y sugiere qué salones están vacíos durante al menos 1 hora continua.

  * El botón **"Agendar por WhatsApp"** y el botón **"Contactar por Correo"** redactan automáticamente el mensaje prellenado con la materia, modalidad, horario y salón vacío seleccionado.

* **Módulo "📅 Mi Agenda" (Horario Semanal + Eventos):**

  * Permite registrar **Materias Fijas del Semestre** (se repiten automáticamente todas las semanas con selección de múltiples días `Lun`–`Sáb` y selector de 8 colores) y **Eventos de la Semana** (asesorías confirmadas, exámenes o entregas en una semana específica).

  * **Detector automático de choques de horario** dentro del perfil del tutor: avisa en tiempo real si el bloque de un tutor está libre en tu agenda (`✅ Tienes este horario libre en Mi Agenda`) o si se empalma con una de tus clases (`⚠️ Choca con tu agenda: ...`).

* **Módulo "📋 Mi Bitácora" (Control de Asesorías y Exportación CSV):**

  * Registro local de sesiones tomadas o impartidas y botón **"📋 Pasar a Bitácora"** desde cualquier asesoría de *Mi Agenda* para autocompletar fecha, duración y materia, exportable en un clic a **CSV compatible con Excel** para reportes de beca UG.

* **Evaluación y Reseñas Verificadas por Enlace Prellenado:**

  * El botón **"⭐ Calificar a este tutor"** inyecta automáticamente el ID/NUA y el nombre del tutor en la URL del Google Form de evaluación, promediando sus estrellas y mostrando sus comentarios en tiempo real.

## Stack Tecnológico

* **Frontend:** [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/), [Tailwind CSS 4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/).

* **Backend Ligero (Next.js Route Handlers):**

  * `/api/v1/tutors`: Sincronizador híbrido que combina la base local (`tutors.json`) con las 3 hojas CSV publicadas de Google Sheets (`Tutores_DICIS`, `Tutores_Externos`, `Comentarios`), aplicando validación de NUA único de 6 dígitos y cálculo de promedios.

  * `/api/v1/rooms`: Consulta de salones libres y ocupados por sede (`Salamanca` / `Yuriria`), día, hora y duración mínima (`30m`, `1h`, `2h`).

  * `/api/v1/image`: Puente de descarga de imágenes públicas de Google Drive para renderizar avatares y portadas sin bloqueo CORS/403.

* **Scraper y Automatización:** [Python 3.12](https://www.python.org/), `pdfplumber`, `requests`, `beautifulsoup4` y flujos programados en **GitHub Actions**.

## Arquitectura del Proyecto

```
DICIS-Tracker-main/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/v1/
│   │   │   │   ├── tutors/route.ts       # API que fusiona tutors.json + Google Sheets CSV en vivo
│   │   │   │   ├── rooms/route.ts        # API de salones libres/ocupados por sede y horario
│   │   │   │   └── image/route.ts        # Proxy local para fotos de perfil y portada de Google Drive
│   │   │   ├── page.tsx                  # Entrada principal de BeeTeacher
│   │   │   └── layout.tsx                # Metadatos PWA, fuentes y proveedores de tema
│   │   ├── components/
│   │   │   ├── BeeTeacherApp.tsx         # Shell principal con 4 vistas: Tutores, Salones, Mi Agenda, Mi Bitácora
│   │   │   └── tutors/
│   │   │       ├── TutorCard.tsx         # Tarjeta con banner, avatar, #DICIS/#TutorPar/#Externo, carrera y correo
│   │   │       ├── TutorModal.tsx        # Perfil completo, cruce de salones vacíos, detector de choques y WhatsApp/Correo
│   │   │       ├── RegisterTutorModal.tsx# Ventana "¿Quieres ser Tutor?" con reglas y enlaces a los Google Forms
│   │   │       ├── WeeklySchedule.tsx    # Módulo "Mi Agenda" (Materias del semestre + Eventos semanales + 8 colores)
│   │   │       └── TutorBitacora.tsx     # Módulo "Mi Bitácora" con persistencia localStorage y exportación CSV
│   │   ├── data/
│   │   │   ├── tutors.json               # Colección semilla de tutores de demostración
│   │   │   ├── reviews.json              # Colección semilla de reseñas de demostración
│   │   │   ├── rooms.json                # Catálogo oficial de aulas y laboratorios (Salamanca y Yuriria)
│   │   │   └── classes.json              # Bloques horarios de asignaturas extraídos de CAECIS UG
│   │   ├── lib/
│   │   │   ├── csv_sync.ts               # Parser RFC-4180 y normalizador de Google Sheets CSV a objetos Tutor/Review
│   │   │   └── tutors.ts                 # Filtros difusos, cruce de horarios con salones vacíos y generadores de enlaces
│   │   └── types/
│   │       └── index.ts                  # Contratos TypeScript (Tutor, TutorReview, Room, ClassSession)
│   └── package.json
└── scrapper/
    ├── src/
    │   ├── main.py                       # Scraper de PDFs de horarios oficiales de CAECIS UG
    │   └── sync_forms.py                 # Script opcional para consolidar CSVs de Google Sheets por CLI/CI
    └── requirements.txt

```

## Desarrollo Local

### 1. Prerrequisitos

* **Node.js** `>= 20.x` y `npm`.

* **Python** `>= 3.10` (únicamente si deseas ejecutar manualmente el scraper de horarios PDF en `scrapper/`).

* Abrir la aplicación en el navegador mediante **`http://localhost:3000`** (evitar abrir la IP de red virtual como `192.168.56.1:3000` si algún bloqueador del navegador restringe scripts locales).

### 2. Instalación y ejecución del Frontend

```
# 1. Entrar a la carpeta del frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev

```

Abre **`http://localhost:3000`** en tu navegador.

## Sincronización con Google Forms / Sheets y Scraper

BeeTeacher incluye sincronización en tiempo real en `frontend/src/lib/csv_sync.ts` conectada a las 3 pestañas publicadas como CSV en Google Sheets:

1. **Formulario 1 (`Tutores_DICIS`):** Registra tutores de la comunidad UG usando su **NUA de 6 dígitos** como ID único irrepetible, correo `@ugto.mx`, carrera, modalidad (`#Presencial` / `#Virtual`), participación en `#TutorPar`, tarifas (30m / 1h), etiquetas de materias, horarios y fotos en Google Drive.

2. **Formulario 2 (`Tutores_Externos`):** Registra asesores independientes con la etiqueta **`#Externo`**, usando los 10 dígitos de su WhatsApp como identificador único.

3. **Formulario 3 (`Comentarios`):** Recibe calificaciones de 1 a 5 estrellas y reseñas vinculadas mediante parámetros prellenados (`entry.192251025` para ID/NUA y `entry.1150356660` para Nombre del Tutor).

### Propiedades recomendadas para las imágenes de perfil y portada

* **Foto de Perfil:** Relación **1:1 (cuadrada)**, recomendado `400 × 400 px` o `500 × 500 px` en `.jpg`, `.png` o `.webp` (máx. 5 MB).

* **Imagen de Portada (Banner):** Relación **16:9 (horizontal)**, recomendado `1200 × 400 px` o `1280 × 720 px` en `.jpg`, `.png` o `.webp` (máx. 5 MB).

* **Permisos en Google Drive:** La carpeta de Drive donde el Google Form guarda las fotos debe tener permisos **"Cualquier persona con el enlace puede ver (Lector)"** para que `/api/v1/image` las muestre al instante.

## Scripts Disponibles

En la carpeta `frontend/`:

| Comando | Descripción | 
| ----- | ----- | 
| `npm run dev` | Levanta el servidor de desarrollo con recarga en vivo en `http://localhost:3000`. | 
| `npm run build` | Compila la aplicación Next.js optimizada para producción. | 
| `npm run start` | Inicia el servidor de producción tras ejecutar `npm run build`. | 
| `npm run lint` | Ejecuta el verificador de código ESLint sobre los componentes TypeScript. | 

En la carpeta `scrapper/`:

| Comando | Descripción | 
| ----- | ----- | 
| `python src/main.py` | Descarga y procesa los horarios oficiales desde [CAECIS UG](http://www.caecis.ugto.mx/caecis/pages/horarios.aspx) hacia `rooms.json` y `classes.json`. | 
| `python src/sync_forms.py` | Sincroniza por línea de comandos los CSV de Google Sheets hacia `tutors.json` y `reviews.json`. | 

## Contribuir

1. Haz un *fork* del repositorio y crea una rama descriptiva (`git checkout -b feature/nueva-mejora`).

2. Verifica que el proyecto compile limpiamente con `npm run build`.

3. Abre un *Pull Request* describiendo los cambios realizados.