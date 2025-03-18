

# =====================================================================================
# Nueva Funcionalidad: Persistencia y Eliminación de Historial de Chat

Se ha implementado la funcionalidad **NEW CHAT STORE** que permite:

- **Guardar mensajes en local:**  
  - **Archivo:** `src/app/chat/chat-storage.service.ts`
  - **Funciones Clave:**  
    - `saveMessages(messages: ChatMessage[])` – Guarda el historial de mensajes en el almacenamiento local.  
    - `loadMessages(): Promise<ChatMessage[]>` – Carga el historial de mensajes guardados al iniciar la aplicación.  
    - `clearMessages(): Promise<void>` – Elimina los mensajes guardados (reinicia el historial).

- **Restaurar el historial de chat:**  
  - **Archivo:** `src/app/chat/chat.page.ts`
  - **Proceso:**  
    - Durante `ngOnInit()`, se invoca `loadMessages()` para recuperar el historial y asignarlo al array `messages`.

- **Nuevo botón "Eliminar Chat":**  
  - **Archivo:** `src/app/chat/chat.page.html`
  - **Elemento:** Botón con ícono `trash-outline`  
  - **Función Clave:**  
    - `clearChat()` – Reinicia el historial del chat (establece un mensaje inicial y ejecuta `clearMessages()` para borrar el almacenamiento).

**Resumen del Comportamiento:**

- La **persistencia local** asegura que los mensajes del chat se mantengan entre sesiones.
- El **botón de eliminación** borra el historial almacenado, lo que reinicia el contexto de la conversación en la aplicación sin afectar la comunicación con el LLM (ya que éste trabaja por petición, sin estado persistente en la API).
# =====================================================================================


## 2. Custom Instruction para el LLM
- **Funcionalidad de Custom Instruction:**
  - Permite al usuario definir un prompt personalizado para el LLM.
  - **Persistencia:**  
    - Se guarda en almacenamiento local mediante el servicio `CustomInstructionService` (archivo: `src/app/chat/custom-instruction.service.ts`).
    - **Funciones Clave:**  
      - `setInstruction(instruction: string)`: Guarda la instrucción personalizada.
      - `getInstruction()`: Recupera la instrucción guardada.
      - `clearInstruction()`: Elimina la instrucción almacenada.
- **Interfaz de Usuario para Custom Instruction:**
  - **Archivo:** `src/app/chat/custom-instruction/custom-instruction.page.html`
  - La UI presenta un input (inicialmente vacío) donde el usuario puede escribir su prompt.
  - Se muestran dos botones:
    - **Establecer:** Valida (20–200 caracteres) y guarda la instrucción personalizada; actualiza el _systemPrompt_ en `ChatService` y redirige al chat.
    - **Restaurar Valor por Defecto:** Restaura el prompt central por defecto (privado) en `ChatService`, limpia el input y redirige al chat.
- **Integración con ChatService:**
  - **Archivo:** `src/app/chat/chat.service.ts`
  - Se centraliza el _systemPrompt_ (inicializado con un valor por defecto) y se actualiza mediante el método `updateSystemPrompt(newPrompt: string)`.
  - Esto asegura que el LLM utilice el prompt personalizado en cada petición.

# =====================================================================================


## 3. Desplazamiento Automático del Scroll (NEW SCROLL)
- **Funcionalidad de Scroll al Final:**
  - **Template:**  
    - En `chat.page.html`, se agrega una variable de template `#chatMessages` al contenedor de mensajes.
  - **Lógica en el Componente:**
    - **Archivo:** `src/app/chat/chat.page.ts`
    - Se utiliza `@ViewChild('chatMessages') chatMessages!: ElementRef;` para obtener la referencia del contenedor.
    - Se define el método `scrollToBottom()` que, tras un breve delay, desplaza el scroll al final.
    - Este método se invoca tanto después de que el usuario envía un mensaje como tras recibir la respuesta del LLM, asegurando que el último mensaje siempre sea visible.
