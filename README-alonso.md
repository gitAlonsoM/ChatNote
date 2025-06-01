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
## Estructura del Proyecto
Listado de rutas de carpetas para el volumen Alonso
El número de serie del volumen es CE3D-452B
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
\---services
        auth.service.spec.ts
        auth.service.ts
        carpeta.service.ts
        geolocation.service.ts
        nota.service.ts
        task.service.spec.ts

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


## Reconstruir, Sincronizar y emular con android studio
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


## Generacion de APK Sin Firmar (2)
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
UPDATE 01.06.2025

>LA APLICACION A CAMBIADO SU NOMBRE, desde ChatNote a Quaderna.
Aun muchos directorios siguen llamandose ChatNote, pero el nombre visible en la UI sera Quaderna y poco a poco se iran cambiando las referencias a ChatNote por el nuevo nombre Quaderna. 

>

