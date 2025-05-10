//src\app\carpeta\carpeta.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CarpetaService, Nota } from '../services/carpeta.service';

@Component({
  selector: 'app-carpeta',
  templateUrl: './carpeta.page.html',
  styleUrls: ['./carpeta.page.scss'],
})
export class CarpetaPage implements OnInit {
  carpetaId!: number;
  carpetaNombre = '';
  notes: Nota[] = [];
  newNoteContent = '';

  constructor(
    private route: ActivatedRoute,
    private carpetaSvc: CarpetaService
  ) {}

  async ngOnInit() {
    // 1) Capturar ID de la ruta
    this.carpetaId = Number(this.route.snapshot.paramMap.get('id'));

    // 2) Obtener nombre de carpeta (mock)
    const carpeta = (await this.carpetaSvc.listarCarpetas())
      .find(c => c.id === this.carpetaId);
    this.carpetaNombre = carpeta?.nombre || 'Desconocida';

    // 3) Cargar notas MOCK de esta carpeta
    this.notes = await this.carpetaSvc.listarNotas(this.carpetaId);
  }

  /** Crear nota: invocar servicio */
  async addNote() {
    const text = this.newNoteContent.trim();
    if (!text) { return; }
    // Proxima iteración: manejar respuesta del API Django
    const nota = await this.carpetaSvc.crearNota(this.carpetaId, text);
    this.notes.unshift(nota);
    this.newNoteContent = '';
  }

  /** Editar nota: prompt y servicio */
  async editNote(note: Nota) {
    const updated = window.prompt('Edit note content:', note.contenido);
    if (updated !== null && updated.trim()) {
      // Proxima iteración: await PUT al backend
      await this.carpetaSvc.actualizarNota(this.carpetaId, note.id, updated.trim());
      note.contenido = updated.trim();
    }
  }

  /** Eliminar nota: servicio */
  async deleteNote(note: Nota) {
    // Proxima iteración: await DELETE al backend
    await this.carpetaSvc.eliminarNota(this.carpetaId, note.id);
    this.notes = this.notes.filter(n => n.id !== note.id);
  }
}
