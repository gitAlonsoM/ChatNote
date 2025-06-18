# ======================================================================================
# OVERVIEW IONIC

Qué hace Ionic en esta aplicación
Interfaz híbrida (móvil + web):
Usa Ionic Framework junto con Angular para construir una SPA que funciona en navegador y en dispositivos nativos (Android/iOS) vía Capacitor.

Autenticación y sincronización:
Integra Firebase Auth (con @angular/fire) para manejar el registro, login y estado de sesión del usuario.

Comunicación con el backend Django:
A través de HTTP (Angular HttpClient en navegador y @capacitor-community/http en dispositivos móviles), envía mensajes y datos (UID, email, chat) a los endpoints /api/register/ y /api/llm/.

Almacenamiento local de chats:
Con @ionic/storage-angular, guarda y recupera el historial de mensajes para continuidad de la conversación incluso sin red.

Funcionalidades nativas vía Capacitor:

Geolocalización: @capacitor/geolocation para obtener coordenadas.

Cámara, Haptics, Keyboard, App, StatusBar… plugins listados pero de uso futuro (ej. adjuntar archivo, enviar audio).

Ruteo y protección de rutas:
Define rutas lazy-loaded para login, register, chat, recover-key, quienes-somos, con un AuthGuard donde corresponde.

Dependencias principales (extracto de package.json)
Paquete	Propósito
@ionic/angular (^8.0.0)	Componentes UI nativos híbridos
@angular/core, @angular/router, etc.	Framework web, ruteo y lógica de la SPA
@capacitor/core, @capacitor/android…	Ecosistema Capacitor para acceder a APIs nativas
@ionic/storage-angular (^4.0.0)	Almacenamiento clave-valor en dispositivos
@angular/fire (^18.0.1)	Integración con Firebase App y Auth
rxjs (~7.8.0)	Manejo reactivo de datos y eventos
socket.io (^4.8.0), express (^4.21.0)	Instalados pero no referenciados directamente en el código

Archivos más relevantes y su rol
(Todas las rutas son relativas al directorio raíz de ChatNote_IONIC)

package.json

URL: /package.json

Lista dependencias, scripts (start, build, test, lint) y versiones usadas en el frontend.

capacitor.config.ts

URL: /capacitor.config.ts

Define la appId (io.ionic.starter), appName (Quaderna) y el directorio web de compilación (www).

src/app/app.module.ts

URL: /src/app/app.module.ts

Imports globales:

IonicModule.forRoot()

IonicStorageModule.forRoot() (persistencia local)

HttpClientModule (API REST)

Firebase (provideFirebaseApp, provideAuth)

BrowserAnimationsModule

Providers:

IonicRouteStrategy para reuse de rutas.

src/app/app-routing.module.ts

URL: /src/app/app-routing.module.ts

Define rutas lazy-loaded para páginas clave:

/register → RegisterPageModule

/login → LoginPageModule

/chat → ChatPageModule

/recover-key, /quienes-somos

Redirección por defecto a /login.

src/environments/environment.ts

URL: /src/environments/environment.ts

Configuración de Firebase para desarrollo (API key, projectId, etc.).

src/environments/environment.prod.ts

URL: /src/environments/environment.prod.ts

Misma configuración de Firebase para producción, con production: true.

src/app/chat/chat.page.ts

URL: /src/app/chat/chat.page.ts

Lógica de la UI de chat:

Inyección de ChatService, AuthService, ChatStorageService, GeolocationService.

Envía/recibe mensajes, despliega notificaciones, desplaza scroll.

Usa el storage para persistir y recuperar el historial de chat.

Obtiene coordenadas con GeolocationService y las envía al LLM.

src/app/chat/chat.service.ts

URL: /src/app/chat/chat.service.ts

Orquesta llamadas al backend Django:

En navegador via HttpClient.post(...).

En dispositivo híbrido via @capacitor-community/http.

Construye payload con uid, email y system prompt para el LLM.

Endpoint hardcodeado: http://127.0.0.1:8000/api/llm/.

Interdependencias y conexiones
Ionic UI ↔ Angular: todo el routing y módulos se gestionan con Angular, Ionic aporta componentes visuales (ion-button, ion-input, etc.).

AppModule ↔ Plugins nativos: IonicModule, IonicStorageModule y los plugins de Capacitor se configuran en el módulo raíz.

ChatService ↔ AuthService: obtiene uid y email del usuario actual para incluirlos en cada petición al LLM.

ChatPage ↔ ChatStorageService: persiste mensajes localmente para offline y recarga de la app.

Capacitor plugins ↔ Código Angular:

GeolocationService invoca el plugin nativo para coordenadas.

En futuro, podrían usarse Camera, Haptics, etc., desde la UI.


# ======================================================================================

## Estructura del Proyecto
El proyecto sigue una estructura típica de una aplicación Angular con Ionic. A continuación, se detalla la estructura principal del proyecto:

C:\USERS\ALONM\DESKTOP\CHATNOTE_IONIC\SRC\APP
|   app-routing.module.ts
|   app.component.html
|   app.component.scss
|   app.component.spec.ts
|   app.component.ts
|   app.module.ts
|
+---carpeta
|       carpeta-routing.module.ts
|       carpeta.module.ts
|       carpeta.page.html
|       carpeta.page.scss
|       carpeta.page.spec.ts
|       carpeta.page.ts
|
+---carpeta-create
|       carpeta-create.module.ts
|       carpeta-create.page.html
|       carpeta-create.page.scss
|       carpeta-create.page.ts
|
+---chat
|   |   chat-routing.module.ts
|   |   chat-storage.service.spec.ts
|   |   chat-storage.service.ts
|   |   chat.module.ts
|   |   chat.page.html
|   |   chat.page.scss
|   |   chat.page.spec.ts
|   |   chat.page.ts
|   |   chat.service.spec.ts
|   |   chat.service.ts
|   |
|   \---custom-instruction
|           custom-instruction-routing.module.ts
|           custom-instruction.module.ts
|           custom-instruction.page.html
|           custom-instruction.page.scss
|           custom-instruction.page.spec.ts
|           custom-instruction.page.ts
|           custom-instruction.service.spec.ts
|           custom-instruction.service.ts
|
+---connection-status
|       connection-status.component.html
|       connection-status.component.scss
|       connection-status.component.spec.ts
|       connection-status.component.ts
|
+---guards
|       auth.guard.spec.ts
|       auth.guard.ts
|
+---home
|       home-routing.module.ts
|       home.module.ts
|       home.page.html
|       home.page.scss
|       home.page.spec.ts
|       home.page.ts
|
+---login
|       login-routing.module.ts
|       login.module.ts
|       login.page.html
|       login.page.scss
|       login.page.spec.ts
|       login.page.ts
|
+---modals
|   +---invitations-manager
|   |       invitations-manager-routing.module.ts
|   |       invitations-manager.module.ts
|   |       invitations-manager.page.html
|   |       invitations-manager.page.scss
|   |       invitations-manager.page.spec.ts
|   |       invitations-manager.page.ts
|   |
|   +---workspace-create
|   |       workspace-create-routing.module.ts
|   |       workspace-create.module.ts
|   |       workspace-create.page.html
|   |       workspace-create.page.scss
|   |       workspace-create.page.spec.ts
|   |       workspace-create.page.ts
|   |
|   +---workspace-invite
|   |       workspace-invite-routing.module.ts
|   |       workspace-invite.module.ts
|   |       workspace-invite.page.html
|   |       workspace-invite.page.scss
|   |       workspace-invite.page.spec.ts
|   |       workspace-invite.page.ts
|   |
|   +---workspace-members
|   |       workspace-members-routing.module.ts
|   |       workspace-members.module.ts
|   |       workspace-members.page.html
|   |       workspace-members.page.scss
|   |       workspace-members.page.spec.ts
|   |       workspace-members.page.ts
|   |
|   \---workspace-rename
|           workspace-rename-routing.module.ts
|           workspace-rename.module.ts
|           workspace-rename.page.html
|           workspace-rename.page.scss
|           workspace-rename.page.spec.ts
|           workspace-rename.page.ts
|
+---quienes-somos
|       quienes-somos-routing.module.ts
|       quienes-somos.module.ts
|       quienes-somos.page.html
|       quienes-somos.page.scss
|       quienes-somos.page.spec.ts
|       quienes-somos.page.ts
|
+---recover-key
|       recover-key-routing.module.ts
|       recover-key.module.ts
|       recover-key.page.html
|       recover-key.page.scss
|       recover-key.page.spec.ts
|       recover-key.page.ts
|
+---register
|       register-routing.module.ts
|       register.module.ts
|       register.page.html
|       register.page.scss
|       register.page.spec.ts
|       register.page.ts
|
+---services
|       archivo-adjunto.service.ts
|       auth.service.spec.ts
|       auth.service.ts
|       carpeta.service.ts
|       geolocation.service.ts
|       invitation.service.ts
|       nota.service.ts
|       task.service.spec.ts
|       workspace-chat.service.ts
|       workspace-folder.service.ts
|       workspace.service.spec.ts
|       workspace.service.ts
|
+---workspace-detail
|       workspace-detail-routing.module.ts
|       workspace-detail.module.ts
|       workspace-detail.page.html
|       workspace-detail.page.scss
|       workspace-detail.page.spec.ts
|       workspace-detail.page.ts
|
\---workspace-folder
        workspace-folder-routing.module.ts
        workspace-folder.module.ts
        workspace-folder.page.html
        workspace-folder.page.scss
        workspace-folder.page.spec.ts
        workspace-folder.page.ts

PS C:\Users\alonm\Desktop\ChatNote_IONIC>

# ======================================================================================
# DESCRIPCION MODULOS Y ARCHIVOS CLAVES DEL PROYECTO

carpeta/
carpeta-routing.module.ts – Ruteo de la vista de notas dentro de una carpeta.

carpeta.module.ts – Declara el módulo de la página Carpeta.

carpeta.page.ts – Lógica para listar y CRUD de notas dentro de una carpeta.

carpeta.page.html – Template de la UI de la carpeta (input + listado de notas).

carpeta-create/

carpeta-create.page.ts – Modal para crear nuevas carpetas (prototipo).

carpeta-create.page.html – Formulario de nombre de nueva carpeta.

chat/

chat-routing.module.ts – Ruteo de la página de chat principal.

chat.module.ts – Declara el módulo de la página Chat.

chat.page.ts – Lógica de envío/recepción de mensajes y geolocalización.

chat.page.html – Template del chat (mensajes + input).

chat.service.ts – Servicio que comunica con el backend Django/OpenAI.

chat-storage.service.ts – Persistencia local del historial de chat.

connection-status/

connection-status.component.ts – Componente que muestra indicador de estado (online/offline).

guards/

auth.guard.ts – Protege rutas que requieren usuario autenticado.

home/

home.module.ts – Módulo de la página de bienvenida/landing.

login/

login.module.ts – Módulo de la página de login.

login.page.ts – Lógica de autenticación con Firebase.

quienes-somos/

quienes-somos.module.ts – Módulo de la sección “Quiénes somos”.

recover-key/

recover-key.module.ts – Módulo de la página de recuperación de contraseña.

register/

register.module.ts – Módulo de la página de registro de usuarios.

services/

auth.service.ts – Maneja Firebase Auth y estado de sesión.

carpeta.service.ts – Mock de CRUD de carpetas y notas (prototipo).

geolocation.service.ts – Envuelve el plugin de geolocalización de Capacitor.

app-routing.module.ts – Define todas las rutas lazy-loaded de la app.

app.component.ts/html – Contiene el menú lateral global y lógica de logout.

app.module.ts – Módulo raíz que importa IonicModule, Firebase, y declara los modales.

PS C:\Users\alonm\Desktop\ChatNote_IONIC>

# ======================================================================================


# ======================================================================================

## Dependencias Clave
Ionic: Framework para construir aplicaciones móviles y web híbridas.
Angular: Framework para desarrollo de aplicaciones web.
Capacitor: Herramienta para acceder a APIs nativas en aplicaciones móviles.
Ionic Storage: Para la persistencia de datos localmente.
Capacitor Preferences: Utilizado para manejar el almacenamiento clave-valor en Capacitor 6.
SQLite: Base de datos ligera para almacenamiento local en dispositivos móviles.

## Archivos Importantes
angular.json: Configuración del proyecto Angular.
ionic.config.json: Configuración específica de Ionic.
capacitor.config.ts: Configuración de Capacitor para integrar funcionalidades nativas.
src/app: Contiene todos los componentes y páginas de la aplicación.
package.json: Listado de todas las dependencias y scripts del proyecto.

### Módulos y Librerías Clave

- **@angular/common/http**: Facilita las solicitudes HTTP a la API de OpenAI.
- **rxjs**: Permite gestionar de manera reactiva la comunicación asíncrona con la API.


### Versiones usadas en el Proyecto
- **IONIC**: ionic --version "7.2.0"
- **ANGULAR**: ng --version "18.2.3"
--**FIREBASE**: firebase --version "10.14.0"
--**EXPRESS**: express --version "4.21.0"
--**SOCKET.IO**: socket.io --version "4.8.0"
--**TSLIB**: tslib --version "2.3.0"
--**ZONE.JS** zone.js --version "0.14.10"

- **CAPACITOR**:
   @capacitor/core: 6.1.2
   @capacitor/preferences: 1.2.5

## Firebase
   @angular/fire@18.0.1


### Capacitor plugins for android:
       @capacitor-community/http@1.4.1
       @capacitor/app@6.0.1
       @capacitor/camera@6.1.0
       @capacitor/geolocation@6.0.1
       @capacitor/haptics@6.0.1
       @capacitor/keyboard@6.0.2
       @capacitor/preferences@6.0.2
       @capacitor/status-bar@6.0.1


## Instalaciones Más importantes Realizadas
Para soportar las nuevas funcionalidades, se realizaron las siguientes instalaciones, entre otras:

Angular Animations:
npm install @angular/animations

Ionic Storage:
npm install @ionic/storage-angular

Capacitor Preferences:
npm install @capacitor/preferences

Módulo HTTP de Angular: permite hacer solicitudes HTTP (como POST) al servidor de OpenAI.
npm install @angular/common/http


## Posibles errores de inicio y solucion
"Node packages may not be installed. Try installing with 'npm install'."
npm install firebase @angular/fire


## Sincroniza los plugins de Capacitor
Siempre despues de modificar algun plugins de Capacitor sincronizar los cambios antes de usar ionic serve para que se reflejen los cambios.
npx cap sync



## =========================================================================================
### Uso de APIs Nativas mediante Capacitor

## Comando relacionados con capacitor y uso de la Camara
npm install @capacitor/camera   Instala el plugin de la cámara
npx cap sync                    Sincroniza las dependencias de Capacitor con las plataformas nativas.

ionic build      compila la aplicación, generando archivos 
npm run build    compila la aplicación, generando scripts en packege.json


## Comandos y archivos relacionados con capacitor y uso de Geolocalizacion
npm install @capacitor/geolocation
npx cap sync 

src\app\services\geolocation.service.ts  Archivo del servicio de geolocalizacion


## =========================================================================================
### Android Studio
npm install @capacitor/android
npx cap add android     (Estructura compatible con Android en la carpeta android/. Se usa una sola vez. )


##  Reconstruir, Sincronizar y emular con android studio ##  
ionic build
npx cap sync android
npx cap open android 
*Medium phone API TyramisuPrivacySandbox -->Run app.
 
 
## Generacion de APK Sin Firmar (1)
npx cap sync
ionic capacitor build android
npx cap open android
*En Android Studio, selecciona Build > Build APK.
Esto generará la APK sin firmar, y Android Studio te proporcionará la ruta donde se guarda.


## Generacion de APK Sin Firmar (2) <Best>
ionic build
npx cap sync android
cd android
.\gradlew.bat assembleDebug

Localiza la APK generada:
android/app/build/outputs/apk/debug/app-debug.apk


## Archivo clave de android studio
AndroidManifest.xml

##
poder ver los logs en la terminal de arranque
ionic serve --consolelogs





## =================================================================
I. Principios Fundamentales del Flujo de Datos:
Ionic (Frontend - Interfaz de Usuario):
Captura de Datos: El usuario interactúa con componentes de UI (ej. <ion-input>, botones) en una página o modal (ej. carpeta.page.ts, carpeta-create.page.ts).
Enlace de Datos (ngModel y Eventos):
[(ngModel)]="propiedadTS" es la forma estándar para enlace bidireccional.
Lección Clave: En modales o componentes cargados dinámicamente, [(ngModel)] puede no actualizar la propiedad del componente de forma fiable.
Solución Robusta: Complementar o reemplazar [(ngModel)] con el manejador de eventos del input (ej. (ionInput)="manejadorEvento($event)") y realizar la asignación manual en el .ts: this.propiedadTS = event.target.value ?? '';. Esto asegura que la propiedad del componente siempre tenga el valor más reciente del input.
Llamada al Servicio: El componente (página/modal) invoca un método en un servicio Angular dedicado cuando se requiere una operación de backend.
Ionic (Servicios *.service.ts - La Capa de Comunicación):
Responsabilidad: Encapsulan toda la lógica de comunicación HTTP con el backend Django. Un servicio por entidad o conjunto de funcionalidades relacionadas (ej. CarpetaService, NotaService, AuthService).
Dependencias: Inyectan HttpClient (de @angular/common/http) y AuthService (para obtener el uid del usuario autenticado).
Construcción del Payload: Preparan los datos en formato JSON que espera el backend (ej. { uid: "...", carpeta_id: ..., contenido: "..." }).
Peticiones HTTP: Utilizan los métodos de HttpClient (.get(), .post(), .put(), .delete()) para interactuar con los endpoints específicos de Django.
POST/PUT: Envían el payload en el cuerpo y configuran HttpHeaders ({ 'Content-Type': 'application/json' }).
GET/DELETE (con parámetros): Usan HttpParams para construir query strings (ej. ?uid=...&carpeta_id=...).
Manejo de Respuestas y Errores: Usan pipe(), tap() (para logs), map() (para transformar respuestas) y catchError() (para manejar errores HTTP y de red de forma centralizada).
Django (Backend - Vistas views.py - La Puerta de Entrada):
Rutas (urls.py): Cada operación CRUD generalmente tiene un endpoint definido.
Colecciones (ej. /api/notes/): Para GET (listar todo/filtrado) y POST (crear nuevo).
Recursos Individuales (ej. /api/notes/<int:nota_id>/): Para GET (detalle), PUT (actualizar), DELETE (eliminar).
@csrf_exempt: Usado en desarrollo para simplificar. En producción, implementar protección CSRF.
Lógica de la Vista:
Determina el método HTTP (request.method).
Parsea el payload JSON: json.loads(request.body.decode('utf-8')).
Extrae datos del request.GET para query parameters o de la URL para path parameters.
Valida los datos recibidos.
Llama a las funciones correspondientes en la capa de servicio de Django (data_service.py).
Retorna JsonResponse con los datos o mensajes de éxito/error y el código de estado HTTP apropiado (200 OK, 201 Created, 204 No Content, 400 Bad Request, 404 Not Found, 500 Internal Server Error).
Django (Backend - Servicios de Datos services/data_service.py - Lógica de Negocio y BD):
Interfaz con Oracle: Utiliza from django.db import connection.
Ejecución de Procedimientos Almacenados:
with connection.cursor() as cur:
Para llamar procedimientos: cur.callproc("NOMBRE_PROCEDIMIENTO_PLSQL", [param1, param2, ...]).
Para llamar funciones que devuelven SYS_REFCURSOR (para leer datos): out_cursor = cur.callfunc("NOMBRE_FUNCION_PLSQL", oracledb.CURSOR, [param1, ...]). Luego iterar sobre out_cursor.
Mapeo de Datos: Transforma los resultados de la base de datos a diccionarios/listas Python.
Manejo de Excepciones de BD: Captura oracledb.Error o excepciones más específicas.
Oracle (Base de Datos - Procedimientos y Funciones PL/SQL):
Lógica de Negocio Centralizada: Contienen las sentencias SQL (INSERT, SELECT, UPDATE, DELETE).
Transaccionalidad: COMMIT explícito después de operaciones DML exitosas. ROLLBACK en caso de error.
Parámetros: IN para datos de entrada, OUT si se necesita devolver valores (ej. el ID de un nuevo registro).
Funciones con SYS_REFCURSOR: Para devolver conjuntos de resultados (listas) a Django.
Seguridad y Validación: Pueden incluir validaciones de datos o verificaciones de permisos a nivel de base de datos.
II. Archivos y Elementos Clave (Resumen):
Ionic:
Componente (*.page.ts / *.component.ts): Lógica de UI, captura de eventos, llamada a servicios.
Plantilla (*.page.html / *.component.html): <ion-input (ionInput)="...">, <ion-button (click)="...">.
Módulo (*.module.ts): Importación de FormsModule y IonicModule.
Servicio (*.service.ts): HttpClient, AuthService, URLs de API, métodos para GET/POST/PUT/DELETE.
AuthService: Crucial para obtener el uid del usuario y para la sincronización inicial del usuario con el backend.
AppRoutingModule: Definición de rutas para la navegación (ej. /carpeta/:id).
AppComponent: A menudo maneja la lógica del menú principal y la carga inicial de datos globales (como la lista de carpetas del usuario).
Django:
urls.py (proyecto y aplicación): Definición de endpoints.
views.py: Funciones que manejan las peticiones HTTP.
services/data_service.py: Interacción con la base de datos.
services/user_service.py: Manejo de la lógica de creación/validación de usuarios.
Oracle:
Script SQL (*.sql): Definición de tablas, secuencias, y procedimientos/funciones PL/SQL para las operaciones CRUD.
III. Depuración y Lecciones Aprendidas Clave:
¡console.log() es tu SUPERPODER en Ionic! (F12 en el Navegador):
Verifica Variables: console.log('Valor de this.nombre:', this.nombre); dentro de los métodos del componente.
Inspecciona Payloads: console.log('Payload para Django:', payload); en el servicio antes del http.post().
Analiza Respuestas y Errores: console.log('Respuesta de Django:', response); console.error('Error HTTP:', error); en los subscribe().
Pestaña "Network" (Red): Indispensable para ver la petición real que sale de Ionic y la respuesta cruda del servidor. Verifica URL, método, headers, cuerpo de la petición y código de estado de la respuesta.
ngModel en Modales/Componentes Dinámicos:
Problema: Puede no actualizar la propiedad del componente.
Solución Definitiva: Usar (ionInput)="manejadorEvento($event)" en el <ion-input> y en el método manejadorEvento, actualizar la propiedad del componente explícitamente: this.propiedad = event.target.value;.
Sincronización Inicial del Usuario:
Asegurar que el uid (y email) de Firebase se envíe a Django y se registre en la tabla Usuario de Oracle inmediatamente después del login/registro exitoso en Ionic. Esto es vital para evitar errores de integridad referencial al crear datos asociados al usuario (como carpetas o notas). AuthService es el lugar ideal para esta lógica.
Errores CORS:
Si ves errores CORS en la consola del navegador, configura django-cors-headers en settings.py de Django. Para desarrollo: CORS_ALLOW_ALL_ORIGINS = True. Para producción: especifica los orígenes permitidos.
Manejo de Errores HTTP en Servicios Ionic:
Utiliza catchError en los pipe() de HttpClient para capturar errores y, si es posible, transformarlos en mensajes más amigables para el usuario o para la lógica del componente.
Actualización de la UI "en Tiempo Real" (Después de CRUD):
Tras una operación exitosa de Crear, Actualizar o Eliminar, vuelve a cargar los datos relevantes desde el backend para refrescar la vista. Por ejemplo, después de crear una nota, llama de nuevo al método que lista las notas de esa carpeta.
Consistencia en Nombres y Tipos de Datos:
Asegúrate de que los nombres de los campos en los payloads JSON, los parámetros de las funciones de Django y los parámetros de los procedimientos PL/SQL coincidan.
Presta atención a los tipos de datos (ej. carpeta_id como number en Ionic, int en Python, NUMBER en Oracle).
Devolución de Datos desde el Backend tras Creación/Actualización:
Para una mejor UX, es ideal que los endpoints POST (crear) y PUT (actualizar) de Django devuelvan el objeto completo recién creado o actualizado. Esto permite a Ionic actualizar la UI directamente con el objeto recibido, sin necesidad de una segunda petición GET para recargar. Esto requiere que los procedimientos PL/SQL y las funciones de data_service.py estén diseñados para devolver esta información.
## =================================================================

## ARCHIVOS CLAVES
src\app\app.component.ts
src\app\app.component.html

## =================================================================
UPDATE 31.05.2025

Durante la sesión de desarrollo y depuración reciente, se implementaron varias mejoras y correcciones clave en la aplicación Ionic:

1.  **Carga Inicial de Carpetas en el Menú Lateral:**
    *   **Problema Solucionado:** Las carpetas personales del usuario no se mostraban en el menú lateral inmediatamente después de iniciar sesión; solo aparecían tras crear una nueva carpeta.
    *   **Solución:** Se ajustó la lógica en `src/app/app.component.ts` para que, además de reaccionar a los cambios de estado de autenticación (`isLoggedIn$`), también se suscriba a los eventos de navegación del router (`NavigationEnd`). Esto asegura que `cargarCarpetasPersonales()` se llame cuando el usuario está logueado y navega a una ruta principal (ej. `/chat`), garantizando que las carpetas se muestren en el menú desde el inicio.
    *   **Archivos Clave Modificados:** `src/app/app.component.ts`.

2.  **Eliminación de Persistencia Local del Historial de Chat:**
    *   **Requisito Implementado:** Se eliminó el guardado del historial de mensajes del chat en el almacenamiento local (`@ionic/storage-angular`).
    *   **Comportamiento Actual:** El chat ahora comienza siempre con el mensaje por defecto "Hola, ¿En qué puedo ayudarte?". Los mensajes solo persisten durante la sesión activa en la vista del chat. Al cerrar sesión, cambiar de usuario o recargar la página de chat, el historial anterior no se carga.
    *   **Archivos Clave Modificados:** Principalmente `src/app/chat/chat.page.ts` (se eliminaron las interacciones con `ChatStorageService` para guardar/cargar mensajes). `ChatStorageService` se mantiene pero sus métodos de guardado/carga de historial ya no se utilizan desde la página de chat.

3.  **Mejora en la Persistencia de Sesión al Refrescar la Página (F5):**
    *   **Problema Solucionado:** Al refrescar la página (F5) en rutas protegidas (ej. `/chat`, `/carpeta/ID`), el usuario era redirigido incorrectamente a la página de `/login` a pesar de tener una sesión de Firebase activa.
    *   **Solución:**
        *   Se introdujo un mecanismo en `src/app/services/auth.service.ts` para señalar explícitamente cuándo la comprobación inicial del estado de autenticación de Firebase (`onAuthStateChanged`) ha finalizado (usando un `ReplaySubject` llamado `authStateChecked$`).
        *   Se modificó `src/app/guards/auth.guard.ts` para que espere la señal de `authStateChecked$` antes de evaluar `isLoggedIn$`. Esto asegura que el `AuthGuard` tome su decisión de permitir o denegar el acceso basándose en el estado de autenticación ya resuelto por Firebase, previniendo redirecciones prematuras.
        *   La lógica en `src/app/app.component.ts` se mantuvo para la carga de datos del menú, pero el `AuthGuard` ahora maneja de forma más robusta la activación de rutas protegidas al recargar.
    *   **Archivos Clave Modificados:** `src/app/services/auth.service.ts`, `src/app/guards/auth.guard.ts`.

4.  **Corrección del "Cuelgue" en la Página de Login con Credenciales Inválidas:**
    *   **Problema Solucionado:** Al ingresar credenciales incorrectas en la página de login, se mostraba un mensaje de error, pero la UI quedaba "cargando" (con el spinner `ion-loading` activo) impidiendo reintentos sin refrescar.
    *   **Solución:** Se ajustó la lógica en el método `login()` y `handleError()` de `src/app/login/login.page.ts` para asegurar que el componente `ion-loading` se cierre (`dismiss()`) correctamente tanto en casos de éxito como de error. También se aseguró que los estados internos (`isConnecting`, `animationState`) se restablezcan adecuadamente.
    *   **Archivos Clave Modificados:** `src/app/login/login.page.ts`.


## =================================================================
## =================================================================
## UPDATE 01.06.2025

> **LA APLICACIÓN HA CAMBIADO SU NOMBRE:** Desde ChatNote a **Quaderna**.
> Aunque muchos directorios y referencias internas aún pueden llamarse ChatNote, el nombre visible en la UI será Quaderna. Progresivamente, se actualizarán las referencias internas.

### Resumen de Cambios Exitosos y Soluciones (Fase 1 - Espacios Colaborativos)

#### Base de Datos (Oracle SQL):

*   **Nuevos Procedimientos/Funciones Implementados y Funcionando:**
    *   `prc_crear_espacio_colaborativo`: Crea espacios, asigna el owner y crea automáticamente una carpeta "General" dentro del nuevo espacio.
    *   `fnc_leer_espacios_colaborativos_usr`: Lista los espacios colaborativos a los que pertenece un usuario (para el menú).
    *   `fnc_obtener_detalle_espacio`: Obtiene los detalles de un espacio colaborativo específico.
    *   `prc_renombrar_espacio_colaborativo`: Permite al owner del espacio cambiarle el nombre.
    *   `prc_eliminar_espacio_colaborativo`: Permite al owner eliminar un espacio y, gracias a las correcciones de constraints, todo su contenido asociado (carpetas, notas, miembros, etc.).
    *   `fnc_listar_miembros_espacio`: Lista los miembros de un espacio colaborativo.
*   **Corrección de Constraints en la Tabla `Carpeta`:**
    *   Se implementaron **índices únicos basados en funciones** (`IDX_UQ_CARPETA_PERSONAL` e `IDX_UQ_CARPETA_ESPACIO`). Esto resolvió el error `ORA-00001` que ocurría al intentar crear una carpeta "General" en múltiples espacios colaborativos, asegurando la unicidad de nombres de manera condicional (diferente para carpetas personales y carpetas de espacio).
    *   Se modificó la Foreign Key `FK_CARP_ESP` (que vincula `Carpeta.espacio_id` con `EspacioColaborativo.espacio_id`) para incluir la cláusula **`ON DELETE CASCADE`**. Esto fue crucial para resolver el error `ORA-02292` (violación de integridad) que impedía eliminar espacios colaborativos que contenían carpetas.

#### Backend (Django):

*   **Nuevos Archivos Creados (Estructura Modular):**
    *   `chatnote/api/services/workspace_service.py`: Encapsula la lógica de negocio y las llamadas a la base de datos para las funcionalidades de espacios colaborativos.
    *   `chatnote/api/views_workspace.py`: Define los nuevos endpoints de la API REST dedicados a los espacios colaborativos.
*   **Funciones Clave en `workspace_service.py` (Corregidas y Funcionando):**
    *   `create_workspace()`
    *   `rename_workspace()`
    *   `delete_workspace()`
    *   Estas funciones fueron refactorizadas para utilizar **bloques PL/SQL anónimos** ejecutados con `cur.execute()`. Este cambio fue la solución definitiva a los persistentes errores `DPY-3002: Python value of type "VariableWrapper" is not supported` y `TypeError` que surgían al intentar usar `cur.callproc()` con parámetros `OUT` y `cur.var()` de forma directa, especialmente con el cursor `FormatStylePlaceholderCursor` de Django.
*   **Actualización de `chatnote/api/urls.py`:**
    *   Se añadieron nuevas rutas que mapean a las vistas en `views_workspace.py` para exponer los endpoints `/api/workspaces/...` necesarios para crear, listar, detallar, renombrar, eliminar espacios y listar sus miembros.

#### Frontend (Ionic/Angular):

*   **Nuevos Archivos/Componentes Creados (Estructura Modular):**
    *   `src/app/services/workspace.service.ts`: Servicio Angular para comunicarse con los nuevos endpoints de espacios colaborativos del backend.
    *   Modales:
        *   `src/app/modals/workspace-create/`: Para el formulario de creación de nuevos espacios.
        *   `src/app/modals/workspace-rename/`: Para el formulario de renombrado de espacios.
        *   `src/app/modals/workspace-members/`: Para mostrar la lista de miembros de un espacio.
    *   Página:
        *   `src/app/workspace-detail/`: Página dedicada para la visualización y gestión de un espacio colaborativo específico, incluyendo su propio menú de opciones.
*   **Mejoras Clave en `src/app/app.component.ts` y `app.component.html`:**
    *   Se integró la sección "Mis Espacios Colaborativos" en el menú lateral principal.
    *   La lógica para cargar (`cargarEspaciosColaborativos`) y actualizar la lista `userWorkspaces` en el menú ahora funciona correctamente, reflejando los espacios creados y eliminados, y permitiendo la visualización de múltiples espacios.
    *   Se implementó la navegación hacia y desde los espacios colaborativos.
*   **Funcionalidad Lograda en la Fase 1 de Espacios Colaborativos:**
    1.  **Creación:** Los usuarios pueden crear nuevos espacios colaborativos.
    2.  **Listado y Navegación:** Los espacios se listan correctamente en el menú principal, la lista se actualiza dinámicamente, y los usuarios pueden navegar a la página de detalle de cada espacio.
    3.  **Renombrado:** El owner de un espacio puede renombrarlo.
    4.  **Eliminación:** El owner de un espacio puede eliminarlo, y esta acción se propaga correctamente en la base de datos (eliminando carpetas y contenido asociado) y se refleja en la UI.
    5.  **Visualización de Miembros:** Se puede ver una lista de los miembros del espacio (actualmente solo el owner).
    6.  **Retorno al Espacio Individual:** Los usuarios pueden navegar desde un espacio colaborativo de vuelta a su espacio individual.

#### Puntos Críticos de Estancamiento y Sus Soluciones Durante la Sesión:

1.  **Error `DPY-3002` / `TypeError` con `cur.var()` y `callproc` en Django:**
    *   **Síntoma:** Imposibilidad de ejecutar procedimientos PL/SQL con parámetros `OUT` desde Django usando `cur.callproc()`, generando errores como `DPY-3002: Python value of type "VariableWrapper" is not supported` o `TypeError: FormatStylePlaceholderCursor.var() got an unexpected keyword argument 'arraysize'`.
    *   **Iteraciones:** Se intentó ajustar cómo se pasaban las variables `OUT` a `callproc`, incluyendo la eliminación del argumento `arraysize` de `cur.var(str, ...)`.
    *   **Solución Definitiva:** Se refactorizaron todas las funciones de servicio de Django que involucraban parámetros `OUT` (`create_workspace`, `rename_workspace`, `delete_workspace`) para utilizar **bloques PL/SQL anónimos** ejecutados mediante `cur.execute()`. Las variables Python para los parámetros `OUT` se crean con `cur.var()` y se pasan en el diccionario de `bind_params`. Este enfoque proporcionó un control más explícito y resolvió los problemas de compatibilidad con el cursor de Django.

2.  **Error `ORA-00001: unique constraint ... violated` al Crear Carpeta "General":**
    *   **Síntoma:** Al crear un segundo espacio colaborativo (o subsiguientes), la creación de su carpeta "General" por defecto fallaba con un error de violación de constraint única (`UQ_CARPETA_USER_NOMBRE`), aunque el espacio en sí se creaba.
    *   **Análisis:** La constraint `UNIQUE (user_id, nombre)` en la tabla `Carpeta` no manejaba correctamente los casos donde `user_id` era `NULL` (como en las carpetas de espacio).
    *   **Solución:** Se modificó la estrategia de unicidad en `Carpeta`. Se eliminó la constraint original problemática y se crearon dos **índices únicos basados en funciones** (`IDX_UQ_CARPETA_PERSONAL` y `IDX_UQ_CARPETA_ESPACIO`). Estos índices aseguran la unicidad de `(user_id, nombre)` solo para carpetas personales y de `(espacio_id, nombre)` solo para carpetas de espacio.

3.  **Error `ORA-02292: integrity constraint ... violated` al Eliminar Espacio Colaborativo:**
    *   **Síntoma:** No se podían eliminar espacios colaborativos si contenían carpetas (como la carpeta "General").
    *   **Análisis:** La Foreign Key `FK_CARP_ESP` en la tabla `Carpeta` (que referencia a `EspacioColaborativo`) no tenía la cláusula `ON DELETE CASCADE`.
    *   **Solución:** Se modificó la constraint `FK_CARP_ESP` para incluir `ON DELETE CASCADE`, permitiendo que la eliminación de un espacio propague la eliminación a sus carpetas y, consecuentemente, a las notas y archivos dentro de esas carpetas.
## =================================================================
## =================================================================
## UPDATE 05.06.2025

Resumen de la Sesión: Implementación del Módulo de Invitaciones EN ESPACIOS COLABORATIVOS.
SE IMPLEMENTO con éxito el sistema completo de gestión de invitaciones para los espacios colaborativos. El objetivo era permitir a los dueños de espacios invitar a otros usuarios y que estos pudieran gestionar dichas invitaciones, todo de forma interna en la aplicación.
Funcionalidad Lograda:
Invitar Usuarios: El propietario (owner) de un espacio colaborativo puede, desde el menú de dicho espacio, abrir un modal e invitar a otros usuarios registrados en la plataforma introduciendo su dirección de email.
Gestión de Invitaciones: Los usuarios invitados ven una nueva sección "Mis Invitaciones" en el menú principal, con un contador de notificaciones pendientes. Desde allí, pueden abrir un modal para ver, aceptar o rechazar las invitaciones.
Unirse a Espacios: Al aceptar una invitación, el espacio colaborativo correspondiente aparece en la lista "Mis Espacios Colaborativos" del usuario, otorgándole rol de MEMBER.
Abandonar Espacios: Un miembro (MEMBER) de un espacio puede abandonarlo en cualquier momento a través de una opción en el menú del espacio. El owner no puede abandonar su propio espacio, solo eliminarlo.
Componentes Técnicos Clave Implementados:
Base de Datos (Oracle):
Se reutilizó la tabla EspacioUsuario para gestionar el ciclo de vida de una invitación a través de la columna estado (PENDIENTE, ACEPTADO, RECHAZADO).
Se crearon procedimientos almacenados cruciales con validaciones robustas:
prc_invitar_usuario_a_espacio: Verifica permisos de owner, existencia del invitado y previene invitaciones duplicadas.
prc_responder_a_invitacion: Actualiza el estado de la invitación de PENDIENTE a ACEPTADO o elimina el registro si es rechazada.
prc_abandonar_espacio_colaborativo: Permite a un miembro eliminarse de EspacioUsuario, pero bloquea la acción para el owner.


Se añadió la función fnc_leer_invitaciones_pendientes_usr para obtener la lista de invitaciones de un usuario.

Backend (Django):
Se creó un nuevo servicio invitation_service.py para encapsular toda la lógica de negocio de las invitaciones, actuando como puente entre las vistas y los procedimientos de la base de datos.
Se crearon nuevas vistas en views_invitation.py para manejar las peticiones HTTP.
Se añadieron nuevos endpoints en api/urls.py para exponer estas funcionalidades, por ejemplo: POST /api/workspaces/<id>/invitations/ para invitar y PUT /api/invitations/<id>/ para responder.

Frontend (Ionic):
Se creó el servicio invitation.service.ts para comunicarse con la nueva API de invitaciones.
Se desarrollaron dos nuevos modales: WorkspaceInvitePage para que el owner envíe invitaciones y InvitationsManagerPage para que el usuario gestione las suyas.
Se modificó workspace-detail.page para añadir los botones de "Invitar Usuario" y "Abandonar Espacio" en el menú contextual.
Se actualizó app.component para mostrar la sección "Mis Invitaciones" y su contador correspondiente en el menú principal, recargando los datos dinámicamente.

Desafíos y Soluciones de la Sesión:
Errores de Compilación Iniciales: La primera implementación resultó en múltiples errores de compilación en Ionic. El diagnóstico reveló tres causas principales:
Falta de Archivos: El archivo invitation.service.ts no había sido creado, causando una cascada de errores Cannot find module. La solución fue simplemente crear el archivo con el código correcto.
Decoradores  Varias clases de páginas (.page.ts) carecían del decorador @Component, lo que provocaba el error NG6001. Se solucionó añadiendo el decorador a cada clase afectada.
Tipado Implícito  La configuración estricta de TypeScript requería tipos explícitos para los parámetros en los callbacks de subscribe. Se corrigió añadiendo los tipos correspondientes (ej. (data: Invitation[]) => ...).


Estructura HTML Incorrecta: Un error NG5002 persistió debido a etiquetas mal anidadas y duplicadas en el menú de workspace-detail.page.html. Se solucionó reestructurando y limpiando el código HTML para que fuera válido y semánticamente correcto.
Llamadas Múltiples a la API: Se observó que las acciones del usuario (como el login) provocaban múltiples recargas de los datos del menú. Para solucionar esta ineficiencia, se refactorizó la lógica en app.component.ts, utilizando operadores de RxJS como distinctUntilChanged y debounceTime para asegurar que la carga de datos se realice solo una vez y de manera eficiente tras un cambio de estado o navegación

## =================================================================
# Resumen de Sesión Técnica: Implementación de Chat Colaborativo Sincrónico
**Fecha:** 07-06-2025
**Objetivo Principal:** Implementar y depurar la comunicación en tiempo real para los espacios de trabajo colaborativos, permitiendo a múltiples usuarios chatear de forma sincrónica.

---

### **1. Hitos de Arquitectura e Implementación**

- **Migración a Arquitectura ASGI:**
  - Se abandonó el servidor de desarrollo estándar de Django (`runserver`) en favor de un servidor ASGI (`daphne`).
  - Esto permite al backend manejar simultáneamente peticiones HTTP tradicionales y conexiones WebSocket persistentes, requisito indispensable para el chat en tiempo real.
  - Se configuró `chatnote/asgi.py` como el punto de entrada para `daphne`.

- **Integración de `django-channels` y `redis`:**
  - Se instalaron las librerías `channels`, `channels-redis` y `daphne`.
  - Se configuró **Redis**, ejecutándose en **WSL (Ubuntu)**, como el `channel layer` (message broker). Redis gestiona la distribución de mensajes entre diferentes instancias del servidor y consumidores.
  - El backend ahora depende de que el servicio de Redis esté activo para operar.

- **Implementación del WebSocket Consumer:**
  - Se creó un `WorkspaceChatConsumer` en `chatnote/api/consumers.py` para manejar el ciclo de vida de las conexiones WebSocket.
  - **`connect()`:** Acepta la conexión en la ruta `ws/chat/<workspace_id>/`, extrae el `workspace_id`, y suscribe al cliente al grupo de chat correspondiente (`chat_<workspace_id>`).
  - **`receive()`:** Procesa los mensajes JSON entrantes, los persiste en la base de datos a través de `workspace_service.save_workspace_message`, y los retransmite al grupo usando `self.channel_layer.group_send()`.
  - **`chat_message()`:** Es el manejador que recibe los mensajes del grupo (enviados por `group_send`) y los envía finalmente al cliente a través de su conexión WebSocket.

- **Adaptación del Frontend (Ionic):**
  - Se creó un `WorkspaceChatService` en `src/app/services/workspace-chat.service.ts` para encapsular la lógica del WebSocket.
  - La página `workspace-detail.page.ts` ahora utiliza este servicio para:
    1.  Obtener el historial inicial del chat vía HTTP.
    2.  Establecer una conexión WebSocket al entrar en un espacio (`connect()`).
    3.  Suscribirse a los mensajes en tiempo real.
    4.  Enviar nuevos mensajes a través del socket (`sendMessage()`).
    5.  Cerrar la conexión al salir del espacio (`disconnect()` en `ngOnDestroy`).

---

### **2. Problemas Críticos Detectados y Soluciones Aplicadas**

1.  **Problema: `redis.exceptions.ConnectionError`**
    - **Síntoma:** El servidor Daphne fallaba al iniciarse porque no podía conectarse a Redis.
    - **Causa Raíz:** El servicio de Redis no estaba en ejecución dentro de la instancia de WSL (Ubuntu).
    - **Solución:** Se estableció como requisito del flujo de trabajo de desarrollo verificar (`redis-cli ping`) e iniciar (`sudo service redis-server start`) el servicio de Redis en WSL **antes** de ejecutar `daphne`.

2.  **Problema: El WebSocket "moría" al navegar entre espacios.**
    - **Síntoma:** El chat funcionaba en el primer espacio visitado, pero dejaba de funcionar al navegar a un segundo espacio.
    - **Causa Raíz:** El `WorkspaceChatService` en Angular, al ser un singleton, mantenía un estado corrupto. El método `disconnect()` completaba el `WebSocketSubject` y el `messagesSubject`, dejándolos en un estado terminal. Al llamar a `connect()` de nuevo, no se creaban nuevos `Subjects`, por lo que los nuevos componentes no podían suscribirse a un flujo activo.
    - **Solución:** Se refactorizó `WorkspaceChatService`:
      - El método `connect()` ahora siempre llama a `disconnect()` primero para una limpieza completa.
      - **Crucialmente**, `connect()` ahora crea una **nueva instancia** de `messagesSubject` (`new Subject<WorkspaceChatMessage>()`) en cada llamada, asegurando un flujo de datos fresco para cada nueva conexión.

3.  **Problema: Fuga de contexto del LLM entre espacios.**
    - **Síntoma:** La IA recordaba conversaciones de un espacio de trabajo al ser consultada en otro.
    - **Causa Raíz:** El método `handle_llm_interaction` en `consumers.py` construía el payload del LLM basándose en un historial de mensajes que el cliente enviaba, en lugar de usar el historial aislado del `workspace_id` actual.
    - **Solución:** Se reescribió `handle_llm_interaction` para que **ignore por completo el historial del cliente**. Ahora, el método primero obtiene el historial aislado de la base de datos usando `await self.get_chat_history_for_llm()` y construye el payload para el `llm_service` exclusivamente con esa información.

4.  **Problema: Experiencia de scroll inconsistente y con retardos.**
    - **Síntoma:** El scroll no se activaba al cargar el historial. El scroll para los mensajes del usuario se sentía retardado, ocurriendo solo cuando llegaba la respuesta del servidor.
    - **Causa Raíz:**
        - **Renderizado optimista ausente:** La UI esperaba el "eco" del mensaje desde el servidor para mostrarlo, causando un retardo de red visible.
        - **Condición de carrera en el renderizado:** La llamada a `scrollToBottom()` se ejecutaba antes de que el motor de renderizado del navegador terminara de "pintar" los nuevos elementos en el DOM.
    - **Solución (en `workspace-detail.page.ts`):**
        - Se implementó **renderizado optimista** en `sendMessage()`, añadiendo el mensaje a la UI localmente y activando el scroll **inmediatamente** antes de enviarlo por el WebSocket.
        - Se modificó la suscripción a `messages$` para **filtrar y descartar el eco** de los propios mensajes del usuario (`if (message.authorId !== this.currentUserId && message.role === 'user')`). Esta condición fue refinada para permitir los mensajes del LLM (`role: 'assistant'`) aunque tuvieran el mismo `authorId`.
        - Se ajustó `scrollToBottom()` para usar un `setTimeout` con un delay de `100ms`, dando al navegador tiempo suficiente para renderizar los elementos antes de calcular la altura final para el scroll.

---

### **3. Consideraciones y Posibles Mejoras**

- **Contexto del LLM en Chats Multi-Usuario:**
  - **Observación:** Actualmente, el LLM recibe el historial de chat completo del espacio, pero no tiene una forma explícita de saber quién dijo qué, más allá de `role: 'user'`.
  - **Posible Mejora:** Para que el LLM pueda responder de forma más contextual ("*Alonso, como decías antes...*", "*Respondiendo a la pregunta de Jerome...*"), se podría modificar el `consumer` para que, al construir el historial para el LLM, los mensajes de usuario incluyan el nombre del autor.
    - **Ejemplo de Modificación (en `get_chat_history_for_llm`):**
      ```python
      # En lugar de:
      # "content": "hola"
      # Sería:
      # "content": "Alonso: hola"
      ```
    - Esto requeriría ajustar el prompt del sistema para que el LLM entienda este nuevo formato.

- **Limpieza de Base de Datos:**
  - Se identificaron y eliminaron las tablas obsoletas `Mensaje` y `SesionActiva`, junto con la secuencia `seq_mensaje`, para mantener el esquema de la base de datos limpio y alineado con la funcionalidad actual.
## =================================================================
# ACTA DE SESIÓN TÉCNICA - 08 de Junio de 2025

**Objetivo Principal:** Implementar la gestión de carpetas colaborativas, depurar errores críticos de la base de datos y añadir funcionalidades de visualización de actividad y tareas.

---

### 1. Funcionalidad Implementada (Carpetas Colaborativas y UI)

Se completó con éxito la arquitectura para la gestión de carpetas y notas dentro de los espacios colaborativos (creación, renombrado, eliminación) a través de nuevos procedimientos PL/SQL, servicios y vistas modulares en Django, y una nueva página (`workspace-folder`) en Ionic.

### 2. Problemas Críticos Depurados

#### 2.1. Creación de Carpetas Personales (Fallo Silencioso en UI)
- **Síntoma:** Crear una carpeta personal no actualizaba la UI y el modal de creación no respondía.
- **Causa Raíz:** Conflicto de declaración de módulos en Angular. El componente `CarpetaCreatePage` estaba declarado tanto en `AppModule` como en su propio módulo, creando una instancia "hueca" sin `bindings`.
- **Solución:** Se aplicó el patrón canónico de Angular: el módulo `CarpetaCreatePageModule` ahora exporta el componente, y se eliminó la declaración duplicada de `AppModule`, importando `CarpetaCreatePageModule` donde era necesario.

#### 2.2. Visualización de Carpetas con Tareas (Error `ORA-01805`)
- **Síntoma:** La UI de una carpeta se rompía si contenía una tarea con fecha de vencimiento (`due_date`). El backend devolvía un error `ORA-01805: possible error in date/time operation`.
- **Causa Raíz:** La sesión de Django/`oracledb` no manejaba correctamente el tipo `TIMESTAMP WITH TIME ZONE` de Oracle, fallando al intentar leer el `due_date`.
- **Solución:** Se modificó la función PL/SQL `fnc_leer_contenido_carpeta_espacio` para formatear la fecha como un string ISO 8601 UTC usando `TO_CHAR`. Esto desacopló la conversión de la sesión del cliente, resolviendo el error de raíz.

#### 2.3. Creación de Tareas sin Descripción (Error `ORA-01400`)
- **Síntoma:** La aplicación fallaba al intentar crear una tarea sin descripción.
- **Causa Raíz:** El procedimiento `prc_crear_tarea` intentaba insertar `NULL` en la columna `descripcion`, que está definida como `NOT NULL`.
- **Solución:** Se robusteció el procedimiento `prc_crear_tarea` usando `NVL(p_desc, 'Tarea sin descripción')` en la sentencia `INSERT`, asegurando que siempre se inserte un valor válido.

#### 2.4. Arranque del Servidor (Error `NameError: name 'List' is not defined`)
- **Síntoma:** El servidor Django no podía iniciarse, provocando errores CORS en el frontend.
- **Causa Raíz:** Se omitió la importación de `List` del módulo `typing` en `task_service.py` al usar anotaciones de tipo.
- **Solución:** Se añadió `from typing import List, Dict, Any` al inicio del archivo, resolviendo el `NameError`.

---

### 3. Nuevas Funcionalidades Implementadas

#### 3.1. Modal de Registro de Actividad
- **Implementación:** Se creó un nuevo flujo completo (función PL/SQL `fnc_leer_log_actividad_espacio`, servicio y vista en Django, y modal en Ionic) para consultar la tabla `AuditLog` y mostrar un historial de todas las acciones relevantes del espacio.
- **Mejora:** Se enriqueció la auditoría añadiendo registros a `AuditLog` en los procedimientos de aceptación/rechazo de invitaciones y abandono de espacios para un registro más completo.

#### 3.2. Modal de "Mis Tareas Asignadas"
- **Implementación:** Se creó un flujo similar (función PL/SQL, servicio, vista y modal) para que un usuario pueda ver una lista de todas las tareas que le han sido asignadas dentro del espacio de trabajo actual.
- **Depuración:** Se solucionó un error `404 Not Found` inicial asegurando que la ruta del nuevo endpoint estuviera correctamente registrada en `api/urls.py` y que el servidor se reiniciara para cargarla.

---

### 4. Estado Actual

**Éxito:** La sesión concluye con la corrección exitosa de todos los errores críticos de base de datos y de servidor. Las funcionalidades de "Registro de Actividad" y "Mis Tareas Asignadas" han sido implementadas y están **listas y operativas**, mostrando la información correspondiente en sus respectivos modales desde el menú del espacio de trabajo.


## =================================================================
