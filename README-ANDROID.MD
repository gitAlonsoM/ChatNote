

## ====================================================================
## ====================================================================

# Informe de Progreso: Conectividad Emulador Android + Django Local (Quaderna App)

**Fecha:** 01 de Junio de 2025

**Objetivo General:** Lograr que todas las funcionalidades de la aplicación Ionic (Quaderna) que operan correctamente en la web (`ionic serve`) también lo hagan sin errores en el emulador de Android Studio, interactuando con el backend Django que se ejecuta localmente.

---

## I. Logros Significativos de la Sesión Actual

### 1. Comunicación Exitosa con el LLM (OpenAI) desde el Emulador Android
   - **Estado Anterior:** Las llamadas al endpoint `/api/llm/` de Django desde la aplicación en el emulador fallaban consistentemente.
   - **Diagnóstico de Errores Superados:**
      1.  **Resolución de IP:** Inicialmente, el emulador no podía resolver `127.0.0.1` como la máquina host.
      2.  **Django `DisallowedHost`:** Django rechazaba las peticiones provenientes de la IP `10.0.2.2` (alias del host para el emulador) porque no estaba en `ALLOWED_HOSTS`.
      3.  **`NullPointerException` en Plugin Capacitor:** El plugin `@capacitor-community/http` generaba un NPE al procesar las opciones de la solicitud HTTP nativa.
   - **Soluciones Implementadas:**
      *   **URL Dinámica en `chat.service.ts`:**
          - Se modificó `src/app/chat/chat.service.ts` para detectar la plataforma.
          - Usa `http://10.0.2.2:8000/api/llm/` cuando la app se ejecuta en Android nativo.
          - Mantiene `http://127.0.0.1:8000/api/llm/` para ejecuciones web (`ionic serve`).
      *   **Actualización de `ALLOWED_HOSTS` en Django:**
          - Se añadió `'10.0.2.2'` a la lista `ALLOWED_HOSTS` en el archivo `ChatNote_DJ/chatnote/chatnote/settings.py`.
      *   **Ajuste en `HttpOptions` para Capacitor:**
          - En `chat.service.ts`, al construir el objeto `HttpOptions` para la llamada nativa `Http.post`, se incluyó explícitamente `params: {}`. Esto resolvió el `NullPointerException` que ocurría en el método `setUrlParams` del plugin `@capacitor-community/http`.
   - **Resultado Actual:**
      - Las peticiones `POST` al endpoint `/api/llm/` desde el emulador ahora llegan correctamente al servidor Django.
      - El servidor Django procesa estas peticiones (como se evidencia en los logs de Django con códigos `200 OK`) y la aplicación en el emulador puede recibir y mostrar las respuestas del LLM.

### 2. Funcionamiento Correcto del Flujo LLM -> Django -> Oracle para Acciones de Datos
   - **Observación Clave:** Se ha confirmado mediante logs que las acciones que el LLM delega al backend Django para interactuar con la base de datos (Oracle) funcionan como se espera.
      - **Lectura de Datos (`READ`):** Cuando el usuario pide un "read", el `llm_service.py` de Django interpreta la acción, llama a `data_service.py` (específicamente `get_user_folders_and_notes`), que consulta Oracle y devuelve los datos. El LLM luego formatea esta información para el usuario.
      - **Creación de Notas:** Cuando el usuario pide crear una nota, el `llm_service.py` primero obtiene la lista de carpetas (`list_personal_folders` desde `data_service.py`), permite al LLM seleccionar una carpeta, y luego llama a `create_note_in_folder` (en `data_service.py`) para insertar la nota en Oracle.
   - **Explicación del Flujo:**
      - El LLM (OpenAI) actúa como un intérprete de lenguaje natural y un orquestador de intenciones, devolviendo JSON estructurados.
      - El backend Django (principalmente `llm_service.py`) es el que recibe estos JSON, determina la acción a realizar, y ejecuta la lógica de negocio llamando a los servicios de datos (`data_service.py`).
      - Los servicios de datos de Django son los únicos que se comunican directamente con la base de datos Oracle para realizar operaciones CRUD.

---

## II. Problemas Pendientes y Próximos Pasos

### 1. Errores de Conexión en Otros Endpoints desde el Emulador
   - **Síntoma:** Al intentar realizar acciones que involucran otros endpoints (ej. crear carpetas, listar workspaces) desde el emulador, la aplicación Ionic muestra errores de red (Status 0, Unknown Error).
   - **Logs de Capacitor (Ejemplo para Workspaces):**
     ```
     DEBUG: [WorkspaceService] createWorkspace - Sending POST to: http://127.0.0.1:8000/api/workspaces/ ...
     DEBUG: [WorkspaceService] handleError: Server error: 0. Http failure response for http://127.0.0.1:8000/api/workspaces/: 0 Unknown Error...
     ```
   - **Causa Raíz:** Los servicios de Ionic (`CarpetaService`, `WorkspaceService`, `NotaService`, `AuthService` para `/register`, etc.), **excepto `ChatService`**, aún no han sido actualizados para usar la URL dinámica `http://10.0.2.2:8000/...` cuando la app se ejecuta en el emulador de Android. Siguen intentando conectarse a `http://127.0.0.1:8000/...`, lo cual falla desde el entorno del emulador.
   - **Confirmación:** No se observan errores `DisallowedHost` en Django para estas peticiones fallidas, lo que indica que las peticiones ni siquiera están llegando al servidor Django.

### 2. Plan de Acción Inmediato
   - **Modificar TODOS los Servicios Restantes de Ionic:**
      - **Objetivo:** Implementar la lógica de URL dinámica (usando `Platform` para detectar Android nativo y cambiar la URL base a `http://10.0.2.2:8000/api`) en todos los servicios que interactúan con el backend Django.
      - **Archivos Afectados (lista no exhaustiva):**
         - `src/app/services/auth.service.ts` (para el endpoint `/api/register/`)
         - `src/app/services/carpeta.service.ts`
         - `src/app/services/nota.service.ts`
         - `src/app/services/workspace.service.ts`
         - `src/app/services/archivo-adjunto.service.ts` (si aplica)
      - **Metodología:**
         1. Inyectar `Platform` en el constructor del servicio.
         2. Definir una propiedad `backendBaseUrl` en el servicio.
         3. En el constructor, asignar `http://10.0.2.2:8000/api` o `http://127.0.0.1:8000/api` a `backendBaseUrl` según la plataforma.
         4. Construir las URLs completas de los endpoints del servicio usando `this.backendBaseUrl`.
         5. Para las llamadas HTTP nativas con `@capacitor-community/http` (si se usan en otros servicios), asegurar que se pasa `params: {}` en `HttpOptions` para los POST/PUT/DELETE si se sigue observando el NPE, o simplemente construir el objeto `HttpOptions` de forma limpia como se hizo en `ChatService`.
   - **Verificación de la Configuración de Red de Android:**
      - Los archivos `network_security_config.xml` y `AndroidManifest.xml` ya están correctamente configurados para permitir tráfico HTTP a `10.0.2.2` y `localhost`. Esta configuración debe mantenerse.
   - **Proceso de Reconstrucción y Pruebas Iterativas:**
      - Tras modificar cada servicio o grupo de servicios:
         1. Ejecutar `ionic build`.
         2. Ejecutar `npx cap sync android`.
         3. En Android Studio: Limpiar proyecto (`Clean Project`), luego reconstruir (`Rebuild Project`).
         4. Probar exhaustivamente la funcionalidad correspondiente en el emulador.
         5. Monitorear Logcat en Android Studio (filtrando por `DEBUG:` y `Capacitor`) y la consola del servidor Django para verificar el flujo de peticiones y identificar errores.

---

## III. Resumen de Errores Clave de la Sesión y Sus Soluciones

1.  **Error:** `NullPointerException` en `setUrlParams` del plugin `@capacitor-community/http` al llamar a `/api/llm/`.
    *   **Solución:** Se añadió `params: {}` explícitamente al objeto `HttpOptions` en la llamada `Http.post()` dentro de `chat.service.ts` para la plataforma híbrida.

2.  **Error:** `django.core.exceptions.DisallowedHost: Invalid HTTP_HOST header: '10.0.2.2:8000'` en Django.
    *   **Solución:** Se añadió la IP `'10.0.2.2'` a la lista `ALLOWED_HOSTS` en el archivo `settings.py` del proyecto Django.

3.  **Error (Actual):** Llamadas a endpoints distintos de `/api/llm/` (ej. `/api/folders/`, `/api/workspaces/`) desde el emulador fallan con `Status: 0` o `Unknown Error`.
    *   **Causa Identificada:** Estos servicios en Ionic aún usan `http://127.0.0.1:8000/...` en el emulador.
    *   **Siguiente Paso:** Aplicar la lógica de URL dinámica (cambiando a `http://10.0.2.2:8000/...` para Android nativo) a todos los servicios relevantes de Ionic.

---


## ====================================================================
## ====================================================================

Resumen de la Sesión Técnica: Conectividad Nativa con Backend Local
Fecha: 10 de Junio de 2025
Objetivo Principal: Lograr que la aplicación Ionic/Capacitor, ejecutándose como una APK nativa en un dispositivo físico Android, se comunique exitosa y consistentemente con el backend Django que opera localmente en la máquina de desarrollo (laptop), todo a través de una conexión USB y sin depender de una red Wi-Fi.
I. Diagnóstico Inicial y Desafíos Superados
Problema Inicial: La aplicación nativa en el dispositivo físico no podía acceder al backend local. Las peticiones a http://127.0.0.1:8000 o http://localhost:8000 fallaban, y la consola logcat mostraba errores de conexión genéricos (IOException, status: 0), mientras que el servidor Django no registraba ninguna petición entrante.
Causa Raíz Identificada: Se diagnosticaron dos bloqueos fundamentales a nivel del sistema operativo Android:
Aislamiento de Red: Un dispositivo físico no puede resolver el localhost de la máquina anfitriona por defecto a través de USB. La conexión USB es para transferencia de datos y depuración, no para networking.
Política de Seguridad de Android (Cleartext Traffic): Por defecto, Android 9 (API 28) y versiones posteriores prohíben que las aplicaciones realicen peticiones HTTP en texto plano (no encriptadas) a servidores, especialmente cuando la propia app se sirve desde un contexto seguro como https://localhost (el WebView de Capacitor).
II. Soluciones Técnicas Implementadas
Se implementó una solución robusta en tres frentes para superar estos desafíos:
Túnel de Red vía adb reverse:
Mecanismo: Se utilizó el comando adb reverse tcp:8000 tcp:8000 de Android Debug Bridge.
Función: Este comando crea un túnel de red inverso a través de la conexión USB, redirigiendo todo el tráfico que la aplicación en el teléfono envía a su propio localhost:8000 hacia el localhost:8000 de la máquina de desarrollo. Esto eliminó la necesidad de depender de IPs de red Wi-Fi.
Permiso Explícito para Tráfico HTTP (Cleartext):
Implementación: Se creó un archivo de configuración de seguridad de red en android/app/src/main/res/xml/network_security_config.xml.
Contenido: Este archivo define una política que permite explícitamente (cleartextTrafficPermitted="true") el tráfico HTTP no encriptado, pero únicamente hacia los dominios 127.0.0.1 y localhost. Esto mantiene la seguridad para todas las demás conexiones.
Activación: Se vinculó esta política a la aplicación añadiendo el atributo android:networkSecurityConfig="@xml/network_security_config" a la etiqueta <application> en el archivo android/app/src/main/AndroidManifest.xml.
Estandarización de la URL del Backend en el Código Ionic:
Lógica: Se modificó la lógica de detección de plataforma en los servicios de Ionic (empezando por ChatService) para que, en cualquier entorno de desarrollo (web, emulador, o dispositivo físico), la URL del backend apunte consistentemente a http://127.0.0.1:8000. Esto simplifica el código y se apoya en el túnel adb reverse para funcionar universalmente.
III. Resultado Final Exitoso
La combinación de estas tres soluciones resultó en un éxito total. La aplicación instalada en el dispositivo físico ahora puede:
Realizar peticiones GET, POST, PUT, DELETE al backend local.
Interactuar con todos los recursos: LLM, base de datos Oracle (carpetas, notas, archivos), y autenticación de Firebase.
Soportar funcionalidades en tiempo real como el chat colaborativo a través de WebSockets (manejados por Daphne), ya que el túnel de adb reverse reenvía todo el tráfico TCP, incluyendo las conexiones WebSocket.
IV. Consideraciones para Producción (Resumen)
Cuando esta aplicación pase a un entorno de producción, se deberán realizar las siguientes mejoras:
Backend en un Servidor Público: El backend Django deberá ser desplegado en un servidor accesible públicamente (ej. AWS, Heroku, DigitalOcean).
Configuración de HTTPS: El servidor de producción debe estar configurado con un certificado SSL/TLS para servir el tráfico a través de HTTPS.
Actualización de URLs: Las URLs en la aplicación Ionic (api.config.ts) deberán ser actualizadas para apuntar al dominio público del backend (ej. https://api.quaderna.com).
Seguridad de CORS y ALLOWED_HOSTS: ALLOWED_HOSTS en Django se debe restringir al dominio de producción, y CORS_ALLOWED_ORIGINS debe configurarse para permitir solo el origen de la aplicación frontend.
Gestión de Secretos: Las claves de API, contraseñas de base deatos y SECRET_KEY de Django deben gestionarse a través de variables de entorno, no hardcodeadas.
Eliminar networkSecurityConfig: La excepción para tráfico cleartext se debe eliminar, ya que todas las comunicaciones en producción serán a través de HTTPS.


## ====================================================================
## ====================================================================
## Guía Rápida para Replicar el Entorno de Desarrollo Móvil Local

Esta es tu checklist personal para ejecutar la demo en cualquier momento, asumiendo que la APK ya está instalada en tu teléfono y el código no necesita cambios.
Requisitos Previos:
Teléfono Android con "Opciones de desarrollador" y "Depuración por USB" activadas.
Cable USB para conectar el teléfono a tu laptop.
Paso 1: Preparar el Entorno en la PC
Conectar el Teléfono: Conecta tu dispositivo Android a tu laptop con el cable USB.
Abrir la Terminal Principal: Abre una terminal o Símbolo del sistema en tu PC.
Verificar Conexión del Dispositivo: Ejecuta el siguiente comando. Deberías ver tu dispositivo listado con el estado "device".

adb devices

Si aparece como "unauthorized", revisa la pantalla de tu teléfono para aceptar la huella digital de depuración de la PC.
Paso 2: Iniciar el Backend Django
Abrir una Segunda Terminal: Esta será exclusivamente para tu servidor Django.
Activar Entorno Virtual y Ejecutar Servidor: Navega al directorio de tu proyecto Django y ejecuta la secuencia de comandos que ya conoces.

(Opcional) Activar tu entorno virtual si no está activo
C:\Users\alonm\Desktop\ChatNote_DJ\venv\Scripts\Activate.ps1
cd C:\Users\alonm\Desktop\ChatNote_DJ\chatnote
daphne -p 8000 chatnote.asgi:application


Deja esta terminal corriendo. Verás los logs de Django aquí.

Paso 3: Crear el Puente de Red
Volver a la Terminal Principal (la del Paso 1).
Ejecutar el Comando adb reverse: Este es el paso "mágico" que conecta tu teléfono al backend.

adb reverse tcp:8000 tcp:8000


Este comando no muestra ninguna salida si tiene éxito. Puedes verificar que está activo con adb reverse --list.
Paso 4: ¡Usar la Aplicación!

Desbloquea tu Teléfono: Abre la aplicación Quaderna que ya tienes instalada.
¡Listo! A partir de este momento, la aplicación en tu teléfono se comunicará a través del cable USB con el servidor Django que se está ejecutando en tu laptop. Puedes iniciar sesión con diferentes usuarios en la web y en el móvil y probar las funcionalidades colaborativas.

Para Detener Todo:
Cierra la aplicación en tu teléfono.
En la terminal de Django, presiona Ctrl + C para detener el servidor.
En la terminal principal, ejecuta adb reverse --remove-all para cerrar el túnel.
Desconecta el teléfono.

## ====================================================================
## ====================================================================