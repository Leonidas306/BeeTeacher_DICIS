# Backlog e Historias de Usuario — BeeTeacher: Sistema de Tutores, Asesorías, Salones Vacíos, Agenda y Bitácora (Arquitectura 100% Gratuita Estilo DICIS-Tracker)

## 1. Bases del Proyecto Mejoradas

### 1.1 Descripción General del Proyecto

**BeeTeacher (Sistema de Tutores, Salones Vacíos, Agenda y Bitácora — DICIS / UG)** es una plataforma web y aplicación instalable (PWA) 100% gratuita diseñada para conectar a los estudiantes de la universidad con tutores pares, profesores y asesores académicos, integrando el motor de detección de **salones vacíos en tiempo real** de [DICIS-Tracker](https://github.com/moraxh/DICIS-Tracker/tree/main) junto con una **Agenda Semanal interactiva ("Mi Agenda")** y una **Bitácora de Asistencia ("Mi Bitácora")**.

Para operar **sin pagar alojamiento web ni bases de datos en la nube** y **sin que el desarrollador tenga que capturar datos en código**, el sistema utiliza una arquitectura estática e híbrida automatizada (*Zero-DB*):

* **Perfiles visuales ricos tipo red social con proxy de Google Drive:** Cada tutor cuenta con una tarjeta y página de perfil que muestra su **foto de perfil cuadrada (1:1)**, una **imagen de fondo o portada horizontal (16:9 estilo Facebook)** servidas mediante un puente propio (`/api/v1/image`) para evitar bloqueos de permisos en Google Drive, su **carrera o perfil académico (`🎓`)**, su **correo institucional visible (`@ugto.mx`)**, su **precio base por 30 minutos y por 1 hora** (o indicación de asesoría gratuita), las **etiquetas de materias** que domina (`#Cálculo`, `#Probabilidad`, `#Física`, `#Programación`, etc.), sus horarios disponibles y las **calificaciones y comentarios** dejados por sus alumnos.

* **NUA de 6 dígitos como ID único e irrepetible + Identificador de Comunidad (`#DICIS` vs. `#Externo`) y Modalidad (`#Presencial` / `#Virtual`):** Cada perfil muestra claramente si el tutor pertenece a la comunidad universitaria (**`#DICIS`**, identificado mediante su **NUA de 6 dígitos** como llave única que actualiza su perfil si vuelve a enviar el formulario sin duplicarlo) o si es un asesor **`#Externo`** (personas ajenas a la comunidad UG identificadas por su teléfono de 10 dígitos), así como las etiquetas de modalidad en que imparte sus clases (**`#Presencial`**, **`#Virtual`** o ambas).

* **Etiqueta Especial `"#TutorPar"` (Programa Institucional de Asesorías Entre Pares / Beca de Comunidad Universitaria UG):** En la Universidad de Guanajuato opera formalmente el esquema de **Asesorías Entre Pares** (*Asesores Par / Monitorías Académicas*), gestionado mediante la convocatoria institucional de **Beca de Comunidad Universitaria (modalidad Asesoría Par / Mentoría)** o apoyos divisionales:

  * **Para los alumnos receptores:** El servicio de asesoría y regularización dentro del programa es **completamente gratuito**.

  * **Para el alumno que imparte las clases (Asesor Par):** La universidad le otorga un estímulo económico (beca monetaria mensual o semestral) a cambio de cubrir un número determinado de horas semanales de asesoría y entregar bitácoras de asistencia.

  * **Coexistencia con tarifas por hora/media hora:** Contar con la etiqueta **`#TutorPar`** le indica a la comunidad que el tutor ofrece asesorías gratuitas bajo esta modalidad institucional, **pero no le impide publicar también sus precios base (30 min / 1 hora)** en su perfil, ya que el tutor no está obligado a impartir sesiones extensas (por ejemplo, 3 o 4 horas seguidas) ni horas fuera de su cuota de beca de forma gratuita.

* **Coordinación directa por WhatsApp y Correo Institucional + Salones Vacíos:** Los alumnos no necesitan crear cuentas ni contraseñas. Buscan al tutor filtrando por etiquetas de materia, origen (`#DICIS` o `#Externo`), modalidad (`#Presencial`, `#Virtual`, `#TutorPar`) o precio, consultan qué salón de la sede está vacío en ese horario (para sesiones presenciales en el campus) y presionan el **botón de WhatsApp** o el **botón de Correo Institucional (`@ugto.mx`)**, los cuales abren el mensaje prellenado con todos los detalles de la sesión.

* **Módulos Personales en `localStorage` ("Mi Agenda" y "Mi Bitácora"):** En la barra de navegación principal el alumno o maestro cuenta con **4 secciones**: **Tutores**, **Salones Vacíos**, **Mi Agenda** (horario semanal para registrar sus materias fijas del semestre y eventos puntuales de cada semana con selector de 8 colores, detección automática de choques de horario en el perfil del tutor y envío en 1 clic a la bitácora) y **Mi Bitácora** (registro de sesiones exportable a CSV/Excel).

* **Alta controlada bajo solicitud a Administradores + Sincronización con Google Forms y Google Sheets CSV:** En la ventana **"¿Quieres ser Tutor?"** se muestran las indicaciones de que **el formulario de registro requiere solicitud de acceso a los administradores**. Esto sirve como filtro de verificación inicial: los administradores comprueban si el solicitante pertenece a la comunidad universitaria (dándole acceso al Formulario 1 que asigna `#DICIS`, valida su NUA de 6 dígitos y permite activar `#TutorPar`) o si es ajeno a la universidad (dándole acceso al Formulario 2 que asigna automáticamente `#Externo`). Al enviarse el formulario, la API de BeeTeacher (`/api/v1/tutors`) lee en vivo las hojas CSV publicadas de Google Sheets y actualiza la plataforma al instante.

### 1.2 Alcance Funcional Detallado por Rol

| Rol | Alcance Funcional en el Modelo Automatizado (BeeTeacher) | 
| ----- | ----- | 
| **Estudiantes (Alumnos)** | Buscar tutores por nombre, carrera o materia con tolerancia a errores ortográficos; filtrar tutores por **etiquetas temáticas** (`#Cálculo`, `#Probabilidad`, `#Física`, etc.), **etiqueta de pertenencia** (`#DICIS` o `#Externo`), **etiqueta `#TutorPar`**, **modalidad** (`#Presencial` o `#Virtual`), sede y rango de precio (30 min / 1 h); consultar el perfil completo del tutor (**foto de perfil, foto de portada tipo Facebook, carrera, correo institucional `@ugto.mx`, NUA, tarifas por 30 min y 1 hora, etiquetas, horarios libres, salones vacíos compatibles, detector de choques con su propia agenda y comentarios de otros estudiantes**); agendar en un clic mediante **WhatsApp** o **Correo Institucional**; organizar sus **Materias del Semestre y Eventos Semanales en "Mi Agenda"**; guardar favoritos; y **calificar al tutor mediante un formulario prellenado** desde su perfil. | 
| **Tutores (Comunidad `#DICIS` / UG, `#TutorPar` y `#Externo`)** | Solicitar acceso al formulario de alta correspondiente (`#DICIS`/`#TutorPar` o `#Externo`); registrarse con su **NUA de 6 dígitos** (comunidad UG) o teléfono (externos), carrera, correo `@ugto.mx`, foto de perfil (1:1), foto de portada (16:9), participación en **`#TutorPar`**, precios base de 30 min y 1 hora, modalidad `#Presencial` y/o `#Virtual`, etiquetas de materias y horarios libres; **consultar qué salones de la universidad están vacíos** en tiempo real o por día/hora y duración (`30+ min`, `1+ hora`, `2+ horas`); gestionar su horario de clases y asesorías en **Mi Agenda**; pasar asesorías confirmadas en un clic a **Mi Bitácora** y exportar sus registros a CSV/Excel para sus entregas de beca. | 
| **Administradores / Desarrolladores** | Aprobar el acceso a los formularios de Google Forms según si el solicitante pertenece a la comunidad universitaria (`#DICIS` / `#TutorPar`) o es un asesor independiente (`#Externo`); supervisar el libro de **Google Sheets** con sus 3 pestañas publicadas en CSV (`Tutores_DICIS`, `Tutores_Externos` y `Comentarios`); moderar u ocultar perfiles o comentarios desde Google Sheets; y mantener la actualización automática de horarios y salones oficiales desde los PDFs de [CAECIS UG](http://www.caecis.ugto.mx/caecis/pages/horarios.aspx). | 

### 1.3 ¿Cómo Funciona la Verificación Previa y la Sincronización en Vivo con Google Forms / Sheets?

1. **Paso 1 — Solicitud de Acceso al Formulario y Separación Comunidad / Tutor Par vs. Externo:**
   * En la barra superior de **BeeTeacher** hay un botón **"+ Ser Tutor"** que abre la ventana modal de verificación con acceso a los dos formularios bajo solicitud:
     * **Formulario 1 — Comunidad UG (`#DICIS` y `#TutorPar`):** Requiere **NUA de 6 dígitos** (usado como ID único irrepetible) y **correo institucional `@ugto.mx`**.
     * **Formulario 2 — Asesor Independiente (`#Externo`):** Para asesores particulares ajenos a la UG, asignándoles automáticamente la etiqueta `#Externo`.
2. **Paso 2 — Llenado del Formulario y Carga de Fotos en Google Drive:**
   * El tutor sube su foto de perfil (cuadrada 1:1) y su banner de portada (horizontal 16:9). El endpoint `/api/v1/image?id=...` de BeeTeacher descarga los bytes de la imagen desde Google Drive en el servidor para mostrarla sin errores de permisos ni bloqueo de cookies.
3. **Paso 3 — Formulario de Comentarios y Calificaciones de Alumnos (URL Prellenada):**
   * En el perfil de cada tutor hay un botón **"⭐ Calificar a este tutor"** que abre el Formulario 3 con el ID/NUA (`entry.192251025`) y el Nombre del Tutor (`entry.1150356660`) ya escritos automáticamente en la URL.
4. **Paso 4 — Sincronización Automática en Vivo (`csv_sync.ts`):**
   * El módulo `frontend/src/lib/csv_sync.ts` lee las 3 hojas CSV publicadas de Google Sheets, valida que no se dupliquen perfiles con el mismo NUA, cruza los comentarios por ID o nombre del tutor, recalcula el promedio de estrellas y actualiza la vista en tiempo real.

## 2. Historias de Usuario Adaptadas al Formato Estándar (`user_stories.md`)

Todas las historias de usuario han sido adaptadas al flujo real de **BeeTeacher**, siguiendo el formato Gherkin (`Given` / `When` / `Then` / `And`) de `user_stories.md`.

# APARTADO 1: HISTORIAS DE USUARIO — ESTUDIANTES (ALUMNOS)

# HU-EST-01-Buscar tutores por materia o nombre

**Prioridad:** Alta | **Rol:** Estudiante

## Historia de usuario

Como estudiante, quiero buscar tutores mediante una barra de búsqueda general por nombre de materia, carrera o nombre del tutor, para encontrar rápidamente a alguien que me ayude con los temas que necesito aprender.

## Criterios de aceptación

### CA-001-Búsqueda con coincidencias

Given que existen tutores registrados en el archivo de datos con distintas materias, carreras y etiquetas asignadas
When el estudiante ingresa un término de búsqueda en la barra de búsqueda
Then el sistema debe mostrar las tarjetas de los tutores cuyo nombre, carrera, descripción o etiquetas coincidan con el término
And cada tarjeta debe mostrar su foto de perfil, imagen de portada, nombre, etiqueta de origen (`#DICIS` o `#Externo`), etiqueta `#TutorPar` (cuando aplique), etiqueta de carrera (`🎓`), correo institucional visible (`@ugto.mx`), modalidad (`#Presencial` / `#Virtual`), etiquetas de materias, precio base (30 min y 1 hora) y calificación promedio

### CA-002-Tolerancia a mayúsculas, acentos y errores tipográficos

Given que existe un tutor con la etiqueta "Cálculo" o "Probabilidad"
When el estudiante escribe "calculo" sin acento o con un error menor de escritura como "probalidad"
Then el buscador difuso debe normalizar el texto y mostrar a dicho tutor dentro de los resultados

### CA-003-Búsqueda sin coincidencias

Given que el estudiante ingresa un texto que no coincide con ningún tutor ni etiqueta registrada
When ejecuta la búsqueda
Then el sistema debe mostrar un mensaje indicando que no se encontraron tutores con ese criterio
And debe mostrar un botón para limpiar la búsqueda

### CA-004-Restablecer listado al limpiar búsqueda

Given que el estudiante tiene un texto escrito en la barra de búsqueda
When borra el texto o presiona el botón de limpiar
Then el sistema debe mostrar nuevamente a todos los tutores disponibles

# HU-EST-02-Filtrar tutores mediante etiquetas de materias (Cálculo, Probabilidad, Física, etc.)

**Prioridad:** Alta | **Rol:** Estudiante

## Historia de usuario

Como alumno, quiero que los tutores tengan etiquetas como "Cálculo", "Probabilidad", "Física", "Álgebra Lineal" o "Programación" para poder filtrar la búsqueda al seleccionarlas y que me aparezcan únicamente los tutores que imparten esa materia.

## Criterios de aceptación

### CA-001-Visualizar etiquetas en las tarjetas y perfiles

Given que existen tutores dados de alta con etiquetas de las materias que imparten
When el alumno consulta el catálogo de tutores
Then cada tarjeta de tutor debe mostrar sus etiquetas correspondientes (por ejemplo, `#Cálculo`, `#Probabilidad`, `#Física`)

### CA-002-Filtrar por una etiqueta seleccionada

Given que el alumno visualiza la barra de filtros por etiquetas de materias
When selecciona una etiqueta específica como "Probabilidad"
Then el listado debe actualizarse mostrando únicamente a los tutores que tienen asignada la etiqueta "Probabilidad"
And la etiqueta seleccionada debe mostrarse con estado activo

### CA-003-Filtrar por múltiples etiquetas combinadas

Given que el alumno ya seleccionó la etiqueta "Cálculo"
When selecciona adicionalmente la etiqueta "Física"
Then el sistema debe filtrar y mostrar a los tutores que coincidan con las etiquetas seleccionadas
And debe actualizar el contador total de tutores encontrados

### CA-004-Mantener filtro de etiqueta al buscar por texto o cambiar otros filtros

Given que el alumno tiene activa la etiqueta "Cálculo"
When escribe un término adicional en el buscador o filtra por origen (`#DICIS` / `#Externo`), `#TutorPar` o modalidad (`#Presencial` / `#Virtual`)
Then el sistema debe mostrar solo los tutores que tengan la etiqueta "Cálculo" y cumplan simultáneamente con los demás filtros activos

### CA-005-Etiqueta sin tutores registrados

Given que ningún tutor tiene asignada una etiqueta determinada con los filtros actuales
When el alumno selecciona esa etiqueta
Then debe visualizar un mensaje indicando que por el momento no hay tutores registrados para esa materia

### CA-006-Desactivar filtros de etiquetas

Given que el alumno tiene una o más etiquetas activas como filtro
When presiona nuevamente sobre la etiqueta activa o selecciona "Todas las materias"
Then el sistema debe quitar el filtro y mostrar el listado completo de tutores

# HU-EST-03-Identificar y filtrar tutores por pertenencia (DICIS / UG o Externo) y por modalidad (Presencial o Virtual)

**Prioridad:** Alta | **Rol:** Estudiante / Tutor

## Historia de usuario

Como alumno o tutor, quiero que cada perfil tenga una etiqueta o identificador que distinga si el tutor pertenece a la comunidad universitaria (`#DICIS`, escalable en un futuro a los demás campus y divisiones de la Universidad de Guanajuato) o si es un asesor `#Externo` (ajeno a la comunidad UG), además de una etiqueta que indique si imparte asesoría `#Presencial`, `#Virtual` o ambas, para poder diferenciar y filtrar fácilmente el tipo de asesor y la modalidad del servicio.

## Criterios de aceptación

### CA-001-Distinción visual clara entre tutor de la comunidad (DICIS / UG) y tutor Externo

Given que existen tutores pertenecientes a la comunidad universitaria y tutores independientes ajenos a la universidad
When el usuario visualiza las tarjetas o el perfil de los tutores
Then los tutores de la universidad deben mostrar el identificador institucional `#DICIS` junto con su NUA de 6 dígitos, carrera y correo `@ugto.mx`
And los asesores que no forman parte de la comunidad universitaria deben mostrar claramente la etiqueta `#Externo` con un color ámbar/naranja distintivo que los separe de la comunidad interna

### CA-002-Filtrar tutores por origen (Comunidad DICIS / UG vs. Externos)

Given que el alumno desea buscar únicamente asesores de su propia división/universidad o bien incluir asesores externos
When selecciona el filtro de origen ("Todos", "#DICIS (UG)" o "#Externo")
Then el listado debe mostrar únicamente los tutores que correspondan a la categoría seleccionada

### CA-003-Visualizar y filtrar por modalidad de asesoría (Presencial y Virtual)

Given que los tutores registraron si imparten asesorías en modalidad `#Presencial`, `#Virtual` o ambas (`#Presencial` y `#Virtual`)
When el alumno aplica el filtro de modalidad ("#Presencial" o "#Virtual")
Then el sistema debe mostrar únicamente a los tutores que ofrezcan la modalidad seleccionada
And cada tarjeta debe mostrar los indicadores visuales de `#Presencial` y/o `#Virtual`

### CA-004-Escalabilidad para futuros campus de la Universidad de Guanajuato

Given que la estructura de etiquetas de comunidad soporta identificadores por división o campus
When en el futuro se incorporen tutores de otros campus de la UG (como `#Guanajuato`, `#León` o `#Celaya-Salvatierra`)
Then el filtro de comunidad debe listar automáticamente las nuevas etiquetas de campus sin requerir rediseñar las tarjetas de perfil

# HU-EST-04-Identificar y filtrar tutores con la etiqueta "Tutor Par" (Asesorías Entre Pares UG) coexistiendo con sus precios

**Prioridad:** Alta | **Rol:** Estudiante / Tutor

## Historia de usuario

Como estudiante o tutor, quiero que exista la etiqueta `"#TutorPar"` para identificar a los alumnos asesores que forman parte del programa institucional de *Asesorías Entre Pares (Beca de Comunidad Universitaria UG)* —con quienes los estudiantes saben que cuentan con horas de asesoría gratuita—, sin impedir que el tutor publique también sus precios por 30 minutos o 1 hora en su perfil para sesiones particulares extensas o fuera de su horario de beca.

## Criterios de aceptación

### CA-001-Visualizar la etiqueta "Tutor Par" y su explicación institucional

Given que un tutor de la comunidad universitaria (`#DICIS` / UG) participa en el programa de *Asesorías Entre Pares (Beca de Comunidad Universitaria)*
When el estudiante visualiza su tarjeta o abre su perfil
Then debe mostrarse de forma destacada la etiqueta **`#TutorPar`**
And debe explicarse que bajo la modalidad *Tutor Par* el alumno receptor tiene derecho a asesorías gratuitas dentro de las horas del programa institucional del tutor

### CA-002-Permitir que el perfil "Tutor Par" conserve y muestre sus precios por 30 min y 1 hora

Given que un tutor tiene asignada la etiqueta **`#TutorPar`**
And además registró en el formulario una tarifa base por 30 minutos y/o por 1 hora (porque no impartirá múltiples horas seguidas gratis ni sesiones particulares fuera de su cuota semanal de beca)
When se publica su tarjeta y su perfil en la plataforma
Then el sistema **no debe bloquear ni ocultar sus tarifas**, mostrando tanto la etiqueta **`#TutorPar` (Beca Gratis + Tarifa Extra)** como sus precios regulares para sesiones adicionales o extensas

### CA-003-Filtrar el directorio por la etiqueta "Tutor Par"

Given que el estudiante busca específicamente asesores del programa institucional de apoyo entre pares para recibir regularización gratuita
When selecciona el filtro **`#TutorPar`**
Then el listado debe mostrar únicamente a los tutores que cuentan con la etiqueta **`#TutorPar`** activa

### CA-004-Restringir la etiqueta "Tutor Par" exclusivamente a miembros de la comunidad UG

Given que el programa de *Asesorías Entre Pares* es una beca oficial de la Universidad de Guanajuato
When se procesa el registro de un asesor con etiqueta **`#Externo`**
Then el sistema no debe permitir asignar la etiqueta **`#TutorPar`** a ningún perfil externo

### CA-005-Distinguir en el mensaje de WhatsApp o Correo si se solicita hora de "Tutor Par" o sesión particular

Given que el estudiante abre el perfil de un tutor que tiene la etiqueta **`#TutorPar`** y tarifas publicadas
When elige entre el botón **"Beca #TutorPar (Gratis)"** o **"Particular ($Tarifa)"** y presiona el botón de WhatsApp o Correo Institucional
Then el mensaje prellenado debe indicar claramente la modalidad solicitada

# HU-EST-05-Consultar el perfil completo de un tutor (Fotos, carrera, correo institucional, precios, etiquetas, horarios y reseñas)

**Prioridad:** Alta | **Rol:** Estudiante

## Historia de usuario

Como estudiante, quiero abrir el perfil detallado de un tutor para ver su foto de perfil, su imagen de fondo tipo Facebook, su identificador (`#DICIS` o `#Externo`), si cuenta con la etiqueta `#TutorPar`, su carrera (`🎓`), su correo institucional (`@ugto.mx`), su modalidad (`#Presencial` / `#Virtual`), sus tarifas por 30 minutos y por 1 hora, sus horarios disponibles y los comentarios de otros estudiantes, para decidir con confianza antes de contactarlo.

## Criterios de aceptación

### CA-001-Visualizar diseño completo del perfil con carrera y correo institucional

Given que el estudiante selecciona la tarjeta de un tutor
When se abre el modal de perfil del tutor
Then debe visualizar la imagen de portada (banner superior estilo Facebook), la foto de perfil cuadrada superpuesta, su nombre, su etiqueta de pertenencia (`#DICIS` o `#Externo`), la etiqueta `#TutorPar` (si aplica), su etiqueta de carrera (`🎓`), su correo institucional clicable (`@ugto.mx`), sus etiquetas de modalidad (`#Presencial` / `#Virtual`), sus etiquetas de materias, su tarifa por media hora, su tarifa por una hora y su configurador de asesoría con cruce de salones vacíos

### CA-002-Imagen de portada o perfil por defecto

Given que un tutor se registró en el formulario sin adjuntar foto de perfil o imagen de portada
When el estudiante abre su perfil
Then el sistema debe mostrar un avatar con sus iniciales e imagen de portada con degradado institucional por defecto sin romper el diseño visual

### CA-003-Visualizar comentarios y promedio de estrellas

Given que otros estudiantes han enviado reseñas para ese tutor mediante el formulario de evaluación
When el estudiante revisa la sección de opiniones dentro del perfil
Then debe visualizar la calificación promedio en estrellas, el total de evaluaciones recibidas y la lista de comentarios asignados a ese tutor

# HU-EST-06-Contactar al tutor y agendar asesoría mediante botón directo de WhatsApp o Correo Institucional

**Prioridad:** Alta | **Rol:** Estudiante

## Historia de usuario

Como estudiante, quiero contar tanto con un botón de WhatsApp como con un botón de Correo Institucional (`@ugto.mx`) en el perfil del tutor que abran un mensaje prellenado (incluyendo la materia, la modalidad presencial o virtual, el horario elegido y sugerencias de salones vacíos cuando sea presencial en el campus), para coordinar mi asesoría por el medio que prefiera sin necesidad de crear una cuenta.

## Criterios de aceptación

### CA-001-Abrir chat de WhatsApp con mensaje prellenado para sesión presencial en DICIS

Given que el estudiante está viendo el perfil de un tutor con modalidad `#Presencial` en `#DICIS`
And selecciona una etiqueta de materia (por ejemplo, "Cálculo"), un bloque horario disponible y un salón vacío sugerido
When presiona el botón "Agendar por WhatsApp"
Then el sistema debe abrir `https://wa.me/52...` hacia el número del tutor con un mensaje prellenado que indique el nombre del tutor, la materia, la modalidad presencial, el día/hora propuestos y el salón vacío seleccionado

### CA-002-Contactar al tutor por Correo Institucional (`@ugto.mx`) con asunto y cuerpo prellenados

Given que el tutor cuenta con correo electrónico institucional visible en su tarjeta y modal de perfil
When el estudiante presiona el botón de correo en la tarjeta o el botón "Contactar por Correo (`@ugto.mx`)" dentro del modal del perfil
Then el sistema debe abrir el cliente de correo (`mailto:`) con el destinatario del tutor, el asunto `"Solicitud de asesoría #Materia — BeeTeacher DICIS"` y el cuerpo prellenado con la materia, horario, modalidad y salón sugerido

# HU-EST-07-Reprogramar o cancelar una asesoría directamente con el tutor por WhatsApp

**Prioridad:** Media | **Rol:** Estudiante

## Historia de usuario

Como estudiante, quiero consultar nuevamente los horarios libres del tutor y los salones vacíos en la plataforma para enviarle un mensaje de reprogramación o cancelación por WhatsApp, para ajustar mi asesoría fácilmente si surge un cambio en mi horario escolar.

## Criterios de aceptación

### CA-001-Consultar nuevo horario y salón vacío para reprogramar

Given que el estudiante necesita cambiar la hora de una asesoría previamente acordada con un tutor
When entra al perfil del tutor o al buscador de salones vacíos y elige un nuevo día y hora disponible
Then puede generar un nuevo mensaje rápido de WhatsApp con la propuesta de nuevo horario y el salón disponible correspondiente

# HU-EST-08-Calificar y dejar un comentario al tutor mediante formulario vinculado

**Prioridad:** Media | **Rol:** Estudiante

## Historia de usuario

Como estudiante, quiero calificar a un tutor y escribir un comentario sobre su asesoría a través de un botón en su perfil que abra el formulario de evaluación ya vinculado a ese profesor, para compartir mi experiencia y que mi reseña aparezca en su perfil para ayudar a otros alumnos.

## Criterios de aceptación

### CA-001-Abrir formulario de reseña con el tutor preseleccionado

Given que el estudiante se encuentra en el perfil de un tutor específico
When presiona el botón "Calificar a este tutor"
Then el sistema debe abrir el Google Form de evaluación con el identificador (`entry.192251025`) y nombre de ese tutor (`entry.1150356660`) ya prellenados automáticamente en la URL

### CA-002-Publicación automática del comentario en el perfil del tutor

Given que el estudiante envía su calificación (de 1 a 5 estrellas) y su comentario en el formulario
When la API de BeeTeacher sincroniza el CSV publicado de la pestaña `Comentarios`
Then el comentario debe asociarse al perfil de ese tutor (por ID/NUA o por coincidencia exacta de nombre) y su promedio de calificación debe actualizarse automáticamente

# HU-EST-09-Guardar tutores y salones como favoritos en mi dispositivo

**Prioridad:** Media | **Rol:** Estudiante

## Historia de usuario

Como estudiante, quiero marcar a mis tutores preferidos como favoritos sin necesidad de iniciar sesión, para filtrarlos en un clic cada vez que abra la aplicación desde mi celular o computadora.

## Criterios de aceptación

### CA-001-Agregar y conservar favoritos en el navegador

Given que el estudiante presiona el icono de corazón en la tarjeta de un tutor
When recarga la página o cierra y vuelve a abrir el navegador
Then los tutores marcados deben permanecer guardados en el almacenamiento local (`localStorage`) bajo la clave `beeteacher_fav_tutors_v1` y poder filtrarse con el botón "Favoritos"

### CA-002-Quitar elemento de favoritos

Given que un tutor ya está marcado como favorito
When el estudiante vuelve a presionar el icono de corazón
Then el elemento debe eliminarse inmediatamente de su lista de favoritos

# HU-EST-10-Gestionar mi horario semanal de clases del semestre y eventos puntuales en "Mi Agenda" con detección de choques

**Prioridad:** Alta | **Rol:** Estudiante / Tutor

## Historia de usuario

Como alumno o maestro, quiero contar con una sección llamada **"Mi Agenda"** en la barra de navegación principal donde pueda dar de alta una sola vez mis **Materias Fijas del Semestre** (para que aparezcan automáticamente todas las semanas) y agregar semana con semana mis **Eventos o Asesorías en mis horas libres** con colores personalizados, además de que el perfil de cada tutor me avise automáticamente si su horario está libre en mi agenda o si choca con alguna de mis clases.

## Criterios de aceptación

### CA-001-Registrar Materias Fijas del Semestre en múltiples días a la vez

Given que el usuario entra a la pestaña "Mi Agenda" y selecciona el tipo `"📚 Materia del Semestre (se repite cada semana)"`
When escribe el nombre de la materia, selecciona uno o varios días de la semana (por ejemplo, `Lun`, `Mié` y `Vie`), define la hora de inicio y fin, elige el salón y selecciona uno de los **8 colores disponibles**
Then el sistema debe guardar los bloques en `localStorage` (`beeteacher_agenda_v1`) y mostrarlos de forma permanente en todas las semanas del semestre

### CA-002-Registrar Eventos de la Semana (asesorías confirmadas, exámenes o entregas) y navegar entre semanas

Given que el usuario ya tiene sus materias del semestre cargadas y visualiza sus horas libres en la cuadrícula semanal
When selecciona el tipo `"📅 Evento de esta Semana (Asesoría / Examen / Entrega)"` o hace clic directamente sobre una celda vacía de la cuadrícula
Then el evento debe guardarse asociado únicamente a la semana seleccionada (`weekKey`), permitiendo navegar con los botones `"Semana anterior"`, `"Esta semana"` y `"Siguiente semana"`

### CA-003-Detectar automáticamente choques de horario dentro del perfil del tutor

Given que el alumno tiene materias o eventos registrados en "Mi Agenda"
When abre el perfil de cualquier tutor y selecciona un bloque horario disponible del tutor
Then el modal debe mostrar automáticamente una alerta verde (`"✅ ¡Horario libre en tu Agenda! No choca con tus clases"`) si ese bloque está despejado, o una alerta roja (`"⚠️ Choca con tu Agenda: tienes [Materia] de [Hora] a [Hora]"`) si se empalma con una clase o evento suyo

# APARTADO 2: HISTORIAS DE USUARIO — TUTORES

# HU-TUT-01-Consultar salones vacíos para impartir una asesoría (Motor DICIS-Tracker)

**Prioridad:** Alta | **Rol:** Tutor

## Historia de usuario

Como tutor de la comunidad que imparte asesorías presenciales, quiero consultar qué salones de la universidad están vacíos en este momento o en el día y hora en que acordé una asesoría por WhatsApp, para saber exactamente en qué aula desocupada puedo dar mi sesión sin interrumpir clases oficiales.

## Criterios de aceptación

### CA-001-Visualizar salones libres y ocupados en tiempo real

Given que el tutor ingresa a la sección de "Salones Vacíos" en horario escolar (lunes a sábado de 08:00 a 18:00)
When selecciona su sede activa ("Salamanca" o "Yuriria")
Then el sistema debe separar y mostrar los salones que están "Disponibles" y los que están "Ocupados" en el bloque consultado

### CA-002-Calcular tiempo libre real encadenando clases consecutivas

Given que el sistema evalúa el horario de un salón en el día seleccionado
When calcula por cuánto tiempo estará libre u ocupado
Then para un salón libre debe mostrar cuántas horas faltan para su siguiente clase (o "Libre resto del día" si ya no tiene clases)

### CA-003-Filtrar salones vacíos por día, hora futura y duración mínima

Given que el tutor acordó por WhatsApp dar una asesoría de 2 horas el jueves a las 11:00
When selecciona en el filtro de tiempo "Jueves", "11:00" y duración mínima "2+ horas"
Then el sistema debe mostrar únicamente los salones que estarán vacíos el jueves a partir de las 11:00 durante al menos 120 minutos continuos

# HU-TUT-02-Recibir solicitudes de alumnos en mi WhatsApp o Correo Institucional y coordinar la sesión

**Prioridad:** Alta | **Rol:** Tutor

## Historia de usuario

Como tutor, quiero recibir directamente en mi WhatsApp o en mi correo institucional `@ugto.mx` los mensajes de los alumnos interesados junto con la materia, la modalidad (`#Presencial` o `#Virtual`), si solicitan apoyo bajo modalidad `#TutorPar` o sesión particular y la sugerencia de horario y salón vacío, para responderles al instante y confirmar si se adapta a mi jornada.

## Criterios de aceptación

### CA-001-Recepción de datos claros en el mensaje de WhatsApp o Correo

Given que un alumno presiona el botón de WhatsApp o de Correo Institucional en el perfil del tutor
When se genera el mensaje prellenado
Then el tutor debe recibir claramente el saludo del alumno, la etiqueta de la materia en la que requiere apoyo, la modalidad solicitada, el horario consultado y el salón vacío detectado por BeeTeacher (cuando sea presencial)

# HU-TUT-03-Solicitar acceso al formulario de tutores ante los administradores y registrar mi perfil con NUA único (Comunidad DICIS, Tutor Par vs. Externo)

**Prioridad:** Alta | **Rol:** Tutor

## Historia de usuario

Como aspirante a tutor, quiero ver en la sección de registro de tutores de la plataforma las indicaciones claras para solicitar acceso al formulario de alta a los administradores, de modo que al solicitarlo ellos verifiquen si soy parte de la comunidad universitaria (`#DICIS`), si formo parte del programa institucional `#TutorPar` o si soy un asesor `#Externo`, y pueda registrar mi NUA de 6 dígitos (como ID único), carrera, correo `@ugto.mx`, foto de perfil, portada tipo Facebook, precios (30 min / 1 h), modalidad (`#Presencial` / `#Virtual`), etiquetas de materias y horarios.

## Criterios de aceptación

### CA-001-Mostrar instrucciones de solicitud previa y botones a los 2 formularios en la ventana de registro

Given que un interesado en dar asesorías presiona el botón "+ Ser Tutor" dentro de BeeTeacher
When se despliega la ventana modal "¿Quieres registrarte como Tutor?"
Then el sistema debe mostrar las instrucciones indicando que los formularios operan bajo solicitud de acceso a los administradores y ofrecer los dos botones separados: `"Solicitar Form #DICIS / #TutorPar"` y `"Solicitar Form #Externo"`

### CA-002-Uso del NUA de 6 dígitos como ID único e irrepetible para tutores de la comunidad UG

Given que un tutor de la comunidad `#DICIS` envía el Formulario 1 ingresando su NUA de 6 dígitos
When el sincronizador procesa las respuestas de Google Sheets
Then debe asignar su NUA de 6 dígitos como `id` único del perfil
And si existe más de un envío con el mismo NUA, debe conservar o actualizar el perfil existente sin permitir dos tarjetas duplicadas con el mismo NUA

# HU-TUT-04-Consultar espacios de apoyo y recursos universitarios (Biblioteca, cubículos y material UG)

**Prioridad:** Media | **Rol:** Tutor

## Historia de usuario

Como tutor de la comunidad universitaria, quiero consultar los espacios de estudio y aulas por edificio junto con los horarios de salones vacíos, para elegir el mejor lugar para la enseñanza de mi tutorado.

## Criterios de aceptación

### CA-001-Visualizar espacios y aulas por sede

Given que el tutor busca un espacio para impartir su asesoría presencial
When consulta la pestaña "Salones Vacíos" en su sede activa (`Salamanca` o `Yuriria`)
Then debe visualizar cada salón o laboratorio con su estado en tiempo real, el total de horas libres continuas y la lista completa de clases programadas en ese salón durante el día

# HU-TUT-05-Reportar incidencias con alumnos mediante formulario de seguimiento

**Prioridad:** Media | **Rol:** Tutor

## Historia de usuario

Como tutor, quiero contar con un acceso o canal con los administradores para notificar inasistencias reiteradas o malas situaciones con algún alumno, para dejar antecedente y prevenir abusos.

## Criterios de aceptación

### CA-001-Enviar reporte de incidencia

Given que el tutor tuvo una mala situación o inasistencia sin aviso tras haber acordado una sesión por WhatsApp
When notifica los datos de la sesión y el motivo a los administradores
Then el reporte queda registrado en la hoja de control de los administradores

# HU-TUT-06-Llevar bitácora de asistencia y anotaciones privadas de mis alumnos en mi dispositivo

**Prioridad:** Media | **Rol:** Tutor

## Historia de usuario

Como tutor (especialmente si soy `#TutorPar` y debo entregar reportes de horas y bitácoras de asistencia a la universidad), quiero registrar notas, fecha, duración y asistencia después de cada sesión con mis alumnos (guardadas localmente en mi navegador y exportables a CSV/Excel), para dar seguimiento a cada alumno y facilitar la entrega de mis bitácoras sin depender de una base de datos externa.

## Criterios de aceptación

### CA-001-Crear y conservar nota de seguimiento y asistencia en el dispositivo

Given que el tutor accede a la pestaña "Mi Bitácora" dentro de BeeTeacher
And escribe el nombre del alumno o tutor, NUA/ID, la materia (etiqueta), la modalidad, la duración de la sesión y las observaciones
When guarda la anotación
Then la nota debe almacenarse en el almacenamiento local (`localStorage`) de su dispositivo y conservarse al cerrar y volver a abrir la aplicación

### CA-002-Exportar bitácora a archivo CSV compatible con Excel

Given que el tutor tiene registros de sesiones en su bitácora local
When selecciona el botón "Exportar CSV (Excel)"
Then el sistema debe generar y descargar un archivo `.csv` con codificación UTF-8 BOM que abra directamente en Microsoft Excel con todas sus sesiones y el total de horas acumuladas

# HU-TUT-07-Pasar una asesoría agendada en "Mi Agenda" directamente a "Mi Bitácora" en un clic

**Prioridad:** Media | **Rol:** Tutor / Estudiante

## Historia de usuario

Como tutor o alumno que registró una asesoría confirmada en **"Mi Agenda"**, quiero tener un botón **"📋 Pasar a Bitácora"** dentro del bloque de mi agenda para que, al terminar la clase, los datos de la sesión (materia, nombre del tutor o alumno, salón, fecha y duración en minutos) se copien automáticamente a **"Mi Bitácora"** sin tener que volver a escribirlos a mano.

## Criterios de aceptación

### CA-001-Transferencia automática de evento semanal a Mi Bitácora

Given que el usuario tiene registrado un evento en "Mi Agenda" (por ejemplo, `"Asesoría #Probabilidad"` el miércoles de 12:00 a 14:00 en el Salón B102)
When presiona el botón `"📋 Pasar a Bitácora"` sobre ese bloque en su agenda
Then el sistema debe calcular automáticamente la duración en minutos (120 min), crear el registro correspondiente en `dicis_tutor_bitacora_v1` (`localStorage`) y mostrar una confirmación visual de que fue agregado a "Mi Bitácora"

# APARTADO 3: HISTORIAS DE USUARIO — ADMINISTRADOR / DESARROLLADOR (FLUJO AUTOMATIZADO)

# HU-ADM-01-Sincronizar automáticamente a los tutores desde Google Forms / Sheets CSV hacia la plataforma

**Prioridad:** Alta | **Rol:** Administrador

## Historia de usuario

Como administrador/desarrollador, quiero que el sincronizador de BeeTeacher lea las respuestas publicadas en CSV de los formularios de tutores (tanto de la comunidad `#DICIS` y `#TutorPar` como de asesores `#Externo`), procese sus fotos de perfil y portada desde Google Drive, valide su NUA único, carrera, correo `@ugto.mx`, etiquetas de materia y modalidad (`#Presencial` / `#Virtual`), para no tener que dar de alta tutor por tutor en el código.

## Criterios de aceptación

### CA-001-Publicar nuevos tutores automáticamente con sus etiquetas de origen, Tutor Par, carrera, correo y modalidad

Given que uno o más tutores autorizados llenaron el formulario de registro con datos válidos
When la API `/api/v1/tutors` consulta los CSV publicados de Google Sheets
Then el parser debe transformar las filas en objetos `Tutor` válidos (incluyendo `id` basado en NUA de 6 dígitos o teléfono externo, etiqueta `#DICIS` o `#Externo`, etiqueta `#TutorPar`, carrera, correo `@ugto.mx`, modalidades, tarifas, WhatsApp y URLs de imagen proxy `/api/v1/image?id=...`)

# HU-ADM-02-Asignar y publicar automáticamente los comentarios de alumnos al perfil de cada tutor

**Prioridad:** Alta | **Rol:** Administrador

## Historia de usuario

Como administrador/desarrollador, quiero que el sincronizador lea las respuestas del Google Form de reseñas (`Comentarios`), agrupe los comentarios por el ID/NUA o nombre de cada tutor y calcule su promedio de estrellas automáticamente, para que las opiniones de los alumnos aparezcan en el perfil de su profesor sin capturarlas a mano.

## Criterios de aceptación

### CA-001-Vincular reseñas al tutor correspondiente y calcular promedio

Given que existen nuevas calificaciones y comentarios enviados por alumnos en el formulario de reseñas
When se ejecuta la sincronización de `/api/v1/tutors`
Then cada comentario debe asociarse al tutor cuyo ID/NUA o nombre normalizado coincide con el registro
And debe recalcularse el promedio de estrellas (de 1.0 a 5.0) y el total de reseñas de ese tutor

# HU-ADM-03-Modificar datos o dar de baja tutores y comentarios desde Google Sheets

**Prioridad:** Media | **Rol:** Administrador

## Historia de usuario

Como administrador, quiero poder editar los datos de un tutor, activar o desactivar su etiqueta `#TutorPar`, corregir sus materias o dar de baja un perfil o comentario directamente desde la hoja de Google Sheets, para administrar toda la plataforma sin necesidad de modificar el código fuente.

## Criterios de aceptación

### CA-001-Reflejar edición o baja en la siguiente sincronización

Given que el administrador edita el precio, la columna `TutorPar`, las etiquetas o cambia la columna `Aprobado_Admin` a `"NO"` de un tutor en Google Sheets
When la aplicación consulta nuevamente el CSV publicado
Then los cambios se reflejan automáticamente en la página web

# HU-ADM-04-Actualizar automáticamente los horarios de asignaturas y salones desde los PDFs de la UG

**Prioridad:** Alta | **Rol:** Administrador

## Historia de usuario

Como administrador, quiero que el scraper de Python descargue los PDFs de horarios oficiales del portal de la UG, unifique nombres de aulas y actualice `rooms.json` y `classes.json`, para que el buscador de salones vacíos siempre refleje el semestre actual.

## Criterios de aceptación

### CA-001-Extracción semanal y protección contra datos parciales

Given que el script `scrapper/src/main.py` se ejecuta al inicio o durante el semestre
When descarga y procesa los horarios de las sedes de la DICIS
Then actualiza los archivos `rooms.json` y `classes.json` usados por el motor de salones vacíos

# HU-ADM-05-Verificar solicitantes antes de entregar el formulario de tutores y separar miembros de la comunidad (`#DICIS` / `#TutorPar`) de asesores (`#Externo`)

**Prioridad:** Alta | **Rol:** Administrador

## Historia de usuario

Como administrador/desarrollador, quiero que los formularios de alta de tutores requieran solicitud de acceso, para verificar en ese momento si el solicitante pertenece a la comunidad universitaria (aprobando su acceso al Formulario 1 de `#DICIS` / `#TutorPar`) o si es una persona ajena a la institución (aprobando su acceso al Formulario 2 de `#Externo`).

## Criterios de aceptación

### CA-001-Separación garantizada por pestaña de origen en Google Sheets

Given que las respuestas del Formulario 1 caen en la pestaña `Tutores_DICIS` y las del Formulario 2 caen en la pestaña `Tutores_Externos`
When el sincronizador procesa ambas pestañas
Then asigna obligatoriamente `communityTag: "DICIS"` a los registros de la primera pestaña y `communityTag: "Externo"` (con `isTutorPar: false`) a los registros de la segunda pestaña

## 3. Enlaces de Producción Configurados (Google Forms y Google Sheets CSV)

| Recurso | Propósito | URL Configurada en BeeTeacher |
| :--- | :--- | :--- |
| **Formulario 1 (`#DICIS` / `#TutorPar`)** | Alta de tutores de la comunidad UG con NUA de 6 dígitos y correo `@ugto.mx` | [Abrir Formulario 1](https://docs.google.com/forms/d/e/1FAIpQLSdR6tTjNqU8pc0-CNwON0gYwofGucKZA9UPJXVoJOYqQ7y39w/viewform?usp=sharing&ouid=107964336684634540613) |
| **Formulario 2 (`#Externo`)** | Alta de asesores particulares independientes | [Abrir Formulario 2](https://docs.google.com/forms/d/e/1FAIpQLSdVV-mz7cIXQlAPFq3Tz-2XoYQSuvzEnrXMwNLWvgOQbrQn2A/viewform?usp=sharing&ouid=107964336684634540613) |
| **Formulario 3 (`Comentarios`)** | Evaluación de alumnos con prellenado de ID (`entry.192251025`) y Nombre (`entry.1150356660`) | [Abrir Formulario 3](https://docs.google.com/forms/d/e/1FAIpQLSc95vUo3Uylzu729ytHs-5Y-glEPj_8qFdWKJDoA3k34aQVJg/viewform) |
| **CSV 1 (`Tutores_DICIS`)** | Salida CSV en vivo de la pestaña de tutores UG | [Ver CSV Tutores_DICIS](https://docs.google.com/spreadsheets/d/e/2PACX-1vRZ1dtPdjG1fLpE_aVzKmbW2qiWzJl1IcMqjYcWc5hJGnTw3uNUCj3FG8b30xjhWBZ32vOYTS2wRGRN/pub?gid=1902917026&single=true&output=csv) |
| **CSV 2 (`Tutores_Externos`)** | Salida CSV en vivo de la pestaña de tutores externos | [Ver CSV Tutores_Externos](https://docs.google.com/spreadsheets/d/e/2PACX-1vRZ1dtPdjG1fLpE_aVzKmbW2qiWzJl1IcMqjYcWc5hJGnTw3uNUCj3FG8b30xjhWBZ32vOYTS2wRGRN/pub?gid=1158175325&single=true&output=csv) |
| **CSV 3 (`Comentarios`)** | Salida CSV en vivo de la pestaña de reseñas y calificaciones | [Ver CSV Comentarios](https://docs.google.com/spreadsheets/d/e/2PACX-1vRZ1dtPdjG1fLpE_aVzKmbW2qiWzJl1IcMqjYcWc5hJGnTw3uNUCj3FG8b30xjhWBZ32vOYTS2wRGRN/pub?gid=1285429493&single=true&output=csv) |
