# 🐝 BeeTeacher — Documentación de Problema, Objetivo, Alcance MVP, Configuración, Colecciones y Datos de Demostración

## 1. Definición del Problema

En la **División de Ingenierías Campus Irapuato-Salamanca (DICIS)** de la **Universidad de Guanajuato**, los estudiantes que requieren apoyo académico en materias de alta reprobación o complejidad (`#Cálculo`, `#Probabilidad`, `#EcuacionesDiferenciales`, `#Física`, `#Programación`, `#Circuitos`, etc.) enfrentan cuatro obstáculos principales:

1. **Dispersión de la oferta de tutores:** Los anuncios de tutores pares (`#TutorPar` del programa de *Beca de Comunidad Universitaria UG*), compañeros de semestres avanzados (`#DICIS`) y asesores particulares (`#Externo`) se pierden en grupos de WhatsApp, publicaciones de Facebook o carteles impresos sin un catálogo centralizado ni buscador por materia.
2. **Desconocimiento de espacios físicos disponibles:** Cuando un tutor y un alumno acuerdan una sesión presencial en el campus (Salamanca o Yuriria), pierden tiempo recorriendo los edificios para encontrar un salón desocupado donde no interrumpan una clase oficial.
3. **Falta de referencias, precios claros y choque de horarios:** Los estudiantes no cuentan con un lugar donde consultar de antemano las tarifas por 30 minutos o 1 hora, saber si el tutor ofrece horas gratuitas bajo la modalidad `#TutorPar`, revisar reseñas de otros alumnos y verificar si el horario del tutor se empalma con sus propias materias del semestre.
4. **Control manual de bitácoras y costos de infraestructura:** Los tutores pares deben entregar bitácoras de asistencia para comprobar sus horas de beca, mientras que los proyectos estudiantiles suelen abandonarse cuando requieren pagar servidores o bases de datos mensuales.

## 2. Objetivo del Proyecto

Desarrollar **BeeTeacher**, una aplicación web progresiva (PWA) con arquitectura **Zero-DB ($0 MXN/mes de costo operativo)** que conecte a la comunidad estudiantil con tutores verificados (`#DICIS`, `#TutorPar`) y asesores independientes (`#Externo`), integrando:
* El motor de detección de **salones vacíos en tiempo real** basado en los horarios oficiales de [CAECIS UG](http://www.caecis.ugto.mx/caecis/pages/horarios.aspx).
* Un flujo automatizado de alta y evaluación mediante **Google Forms + Google Sheets (CSV)** sin necesidad de capturar datos manualmente en código.
* Herramientas locales de organización estudiantil y docente (**Mi Agenda** semanal con detección de choques y **Mi Bitácora** exportable a CSV/Excel).

## 3. Alcance del MVP (Producto Mínimo Viable)

El MVP implementado cubre de extremo a extremo los siguientes módulos funcionales:

| Módulo del MVP | Funcionalidades Incluidas | Estado |
| :--- | :--- | :--- |
| **1. Catálogo y Buscador de Tutores** | Búsqueda difusa tolerante a acentos y errores tipográficos; filtros combinables por etiquetas de materia (`#Cálculo`, `#Probabilidad`, etc.), origen (`#DICIS`, `#Externo`), programa institucional (`#TutorPar`), modalidad (`#Presencial`, `#Virtual`), sede (`Salamanca`, `Yuriria`) y ordenamiento por calificación o tarifa. | ✅ Completado |
| **2. Perfiles Visuales y Identidad Académica** | Tarjetas y modal de perfil con foto cuadrada (1:1) y portada horizontal (16:9) vía proxy de Google Drive (`/api/v1/image`), **NUA de 6 dígitos como ID único** con bloqueo de duplicados, insignia de **Carrera (`🎓`)**, **Correo Institucional visible (`@ugto.mx`)**, tarifas de 30 min / 1 hora y reseñas con promedio de estrellas. | ✅ Completado |
| **3. Cruce con Salones Vacíos y Agendado Directo** | Al elegir un bloque horario presencial en el perfil del tutor, el sistema cruza automáticamente `rooms.json` y `classes.json` para sugerir aulas vacías en ese horario y genera mensajes prellenados para **WhatsApp (`wa.me`)** y **Correo Institucional (`mailto:`)**. | ✅ Completado |
| **4. Alta Verificada y Evaluación sin Base de Datos** | Modal *"¿Quieres ser Tutor?"* con acceso a 2 Google Forms diferenciados (`#DICIS`/`#TutorPar` y `#Externo`) y botón *"Calificar a este tutor"* con URL prellenada hacia un 3er Google Form, sincronizados en vivo mediante CSV publicados en Google Sheets. | ✅ Completado |
| **5. Módulo "📅 Mi Agenda" Semanal** | Horario visual de lunes a sábado (08:00 a 20:00) con registro de **Materias Fijas del Semestre** (recurrentes cada semana), **Eventos de la Semana** (asesorías, exámenes, entregas), selector de 8 colores y **detector automático de choques de horario** dentro del perfil del tutor. | ✅ Completado |
| **6. Módulo "📋 Mi Bitácora" y Favoritos** | Registro de sesiones de tutoría en `localStorage`, envío directo en 1 clic desde *Mi Agenda* (*"Pasar a Bitácora"*) y exportación a archivo **CSV compatible con Excel** (con BOM UTF-8). | ✅ Completado |

## 4. Tecnologías Utilizadas

| Categoría | Tecnología / Herramienta | Versión / Detalle |
| :--- | :--- | :--- |
| **Framework Web** | [Next.js](https://nextjs.org/) (App Router + Route Handlers) | `16.x` |
| **Librería UI** | [React](https://react.dev/) + [Lucide React](https://lucide.dev/) (Iconografía) | `19.x` |
| **Lenguaje Principal** | [TypeScript](https://www.typescriptlang.org/) | `5.x` |
| **Estilos y Diseño** | [Tailwind CSS](https://tailwindcss.com/) (Diseño responsivo + Dark Mode) | `4.x` |
| **Ingesta y CMS Gratuito** | Google Forms + Google Sheets (Publicación en la web como CSV) | Sincronización HTTP con revalidación cada 30 s |
| **Extracción de Horarios UG** | [Python](https://www.python.org/) (`pdfplumber`, `requests`, `beautifulsoup4`) | `3.12` |
| **Persistencia en Cliente** | Web Storage API (`localStorage`) | Colecciones locales sin servidor |

## 5. Pasos para Configurar el Proyecto

### Paso 1: Clonar o descomprimir el proyecto e instalar dependencias
1. Abre la carpeta raíz del proyecto en **Visual Studio Code**.
2. Abre una terminal integrada y sitúate en la carpeta `frontend`:
   ```bash
   cd frontend
   npm install
   ```

### Paso 2: Configurar los 3 Formularios de Google Forms y Google Sheets
El proyecto ya viene preconfigurado con los enlaces reales de producción en `frontend/src/components/tutors/RegisterTutorModal.tsx`, `frontend/src/lib/tutors.ts` y `frontend/src/lib/csv_sync.ts`. Si deseas conectar tus propios formularios desde cero, sigue estos pasos:

1. **Crear los 3 Google Forms:**
   * **Formulario 1 (Comunidad `#DICIS` / `#TutorPar`):** Solicita Correo `@ugto.mx`, Nombre completo, **NUA (6 dígitos)**, Carrera, Semestre, participación en `#TutorPar`, Modalidad (`Presencial` / `Virtual`), Sede (`Salamanca` / `Yuriria`), WhatsApp (10 dígitos), Tarifas (30 min y 1 hora), Materias, Horarios (Lunes a Sábado de 08:00 a 18:00), Foto de perfil y Foto de portada.
   * **Formulario 2 (Asesores `#Externo`):** Mismas preguntas de perfil y materias, sin NUA ni `#TutorPar` (usa su WhatsApp de 10 dígitos como ID único).
   * **Formulario 3 (Evaluación y Comentarios):** Preguntas de *ID del Tutor*, *Nombre del Tutor*, *Calificación (1 a 5)*, *Materia tomada*, *Modalidad* y *Comentario*. Usa la opción **"Obtener enlace prellenado"** de Google Forms para obtener los identificadores `entry.XXXXXX` de ID y Nombre.
2. **Vincular respuestas a un libro de Google Sheets con 3 pestañas:**
   * Vincula los 3 formularios a un mismo archivo de Google Sheets en las pestañas `Tutores_DICIS`, `Tutores_Externos` y `Comentarios`.
3. **Publicar las pestañas como CSV en la web:**
   * En Google Sheets, ve a **Archivo → Compartir → Publicar en la web**, elige cada pestaña individualmente en formato **Valores separados por comas (`.csv`)** y coloca las 3 URLs en `frontend/src/lib/csv_sync.ts` (`SHEET_CSV_URLS`).
4. **Configurar permisos públicos de las carpetas de imágenes en Google Drive:**
   * En Google Drive, abre las carpetas donde los formularios guardan las fotos subidas por los tutores, haz clic derecho en **Compartir** y selecciona **"Cualquier persona con el enlace → Lector"**.

## 6. Documentación de las Colecciones y Datos de Demostración

BeeTeacher utiliza una arquitectura híbrida compuesta por **3 colecciones estáticas/remotas (JSON + Google Sheets CSV)** y **3 colecciones persistentes en el navegador (`localStorage`)**:

### 6.1 Colecciones de Datos del Servidor (`frontend/src/data/` y Google Sheets CSV)

| Colección | Ubicación / Origen | Llave Primaria (`id`) | Descripción y Campos Principales |
| :--- | :--- | :--- | :--- |
| **`tutors` (Tutores)** | `frontend/src/data/tutors.json` + Pestañas CSV `Tutores_DICIS` y `Tutores_Externos` | `id` (NUA de 6 dígitos en `#DICIS` o `ext_<whatsapp>` en `#Externo`) | Almacena el perfil completo de cada tutor: `fullName`, `nua`, `institutionalEmail`, `career`, `academicProfile`, `communityTag` (`DICIS` / `Externo`), `isTutorPar`, `modalities`, `headquarters`, `whatsapp`, `pricing` (`halfHour`, `fullHour`, `tutorParNote`), `subjectTags`, `avatarUrl`, `coverUrl`, `availability` y `reviews`. |
| **`reviews` (Reseñas)** | `frontend/src/data/reviews.json` + Pestaña CSV `Comentarios` | `id` (`rev_csv_<n>`) vinculado por `tutorId` | Almacena las evaluaciones de los alumnos: `tutorId`, `subjectTag`, `modality`, `stars` (1 a 5), `comment`, `authorName` y `date`. |
| **`rooms` y `classes` (Salones y Horarios UG)** | `frontend/src/data/rooms.json` y `frontend/src/data/classes.json` | `id` de aula (`salamanca-salon-a104`, etc.) | Catálogo de salones por sede (`Salamanca` y `Yuriria`) y bloques de clases oficiales extraídos de CAECIS UG (`day`, `start`, `end`, `subject`, `professor`) usados para calcular qué salones están vacíos. |

### 6.2 Colecciones en el Navegador del Usuario (`localStorage`)

| Clave en `localStorage` | Módulo que la administra | Estructura de cada registro |
| :--- | :--- | :--- |
| **`beeteacher_agenda_v1`** | `WeeklySchedule.tsx` (*Mi Agenda*) | Arreglo de bloques `AgendaEvent`: `{ id, title, kind: "SEMESTER" \| "WEEKLY", day, start, end, location, tutorOrProf, colorId, weekKey, createdAt }`. Las entradas `"SEMESTER"` se repiten todas las semanas; las `"WEEKLY"` pertenecen a una semana ISO (`weekKey`). |
| **`dicis_tutor_bitacora_v1`** | `TutorBitacora.tsx` (*Mi Bitácora*) | Arreglo de sesiones `BitacoraEntry`: `{ id, studentOrTutorName, nuaOrId, subjectTag, modality, durationMinutes, date, roomOrLink, notes }`. Exportable a CSV/Excel. |
| **`beeteacher_fav_tutors_v1`** | `BeeTeacherApp.tsx` (*Favoritos*) | Arreglo de identificadores (`string[]`) de los tutores marcados con corazón por el estudiante. |

### 6.3 Datos de Demostración Incluidos (`Demo Seed Data`)

El proyecto incluye datos de demostración listos para probar todas las funciones desde el primer arranque sin requerir configuración adicional:

1. **4 Tutores Semilla en `frontend/src/data/tutors.json`:**
   * **Alejandro Morales Rivera (`#DICIS` · `#TutorPar` · Ing. en Sistemas Computacionales · Sede Salamanca):** Imparte `#Cálculo`, `#Probabilidad`, `#Programación` y `#Álgebra Lineal` en modalidad `#Presencial` y `#Virtual` ($45/30m · $80/1h + horas de beca sin costo).
   * **Mariana Fernanda Soto Campos (`#DICIS` · `#TutorPar` · Ing. Mecatrónica · Sede Salamanca):** Imparte `#Ecuaciones Diferenciales`, `#Física`, `#Circuitos` y `#Control Discreto` ($50/30m · $90/1h).
   * **Diego Alejandro Vázquez Luna (`#DICIS` · Ing. Mecánica · Sede Salamanca):** Imparte `#Termodinámica`, `#Física`, `#Cálculo` y `#Estática` en modalidad `#Presencial` ($60/30m · $100/1h).
   * **Mtro. Roberto Carlos Pineda (`#Externo` · Maestro en Matemáticas Aplicadas):** Asesor particular independiente para demostrar la separación visual de perfiles `#Externo` ($80/30m · $140/1h).
2. **Perfiles reales sincronizados desde Google Sheets CSV:**
   * Al levantar `npm run dev`, el endpoint `/api/v1/tutors` descarga además los registros reales capturados en tus Google Forms (como los perfiles de prueba con NUA `148508`, `148509`, etc., y sus calificaciones reales) y los fusiona con los datos semilla.
3. **Catálogo completo de Salones y Clases (`rooms.json` y `classes.json`):**
   * Incluye los salones y laboratorios reales de las sedes **Salamanca** y **Yuriria** para probar en tiempo real el buscador de salones vacíos y el cruce automático dentro del perfil de cada tutor.

## 7. Comandos de Ejecución

### Ejecución del servidor de desarrollo (Frontend + API)
```bash
cd frontend
npm install
npm run dev
```
* **URL local obligatoria para pruebas:** `http://localhost:3000`

### Compilación y ejecución en modo producción
```bash
cd frontend
npm run build
npm run start
```

### Ejecución manual de los scripts de Python (Opcional)
```bash
cd scrapper
pip install -r requirements.txt

# Actualizar horarios oficiales de salones desde los PDFs de CAECIS UG
python src/main.py

# Sincronizar manualmente las hojas CSV de Google Sheets hacia JSON local
python src/sync_forms.py
```
