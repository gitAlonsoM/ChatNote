//src\app\services\carpeta.service.ts
import { Injectable } from '@angular/core';

export interface Nota {
  id: number;
  contenido: string;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class CarpetaService {
  // Mock: notas agrupadas por carpeta
  private _notas: Record<number, Nota[]> = {};

  /** Listar notas de una carpeta (proximamente: GET /api/carpetas/{id}/notas/) */
  async listarNotas(carpetaId: number): Promise<Nota[]> {
    return this._notas[carpetaId] || [];
  }

  /** Crear nota en carpeta (proximamente: POST /api/carpetas/{id}/notas/) */
  async crearNota(carpetaId: number, contenido: string): Promise<Nota> {
    const nota: Nota = { id: Date.now(), contenido, createdAt: new Date() };
    if (!this._notas[carpetaId]) { this._notas[carpetaId] = []; }
    this._notas[carpetaId].unshift(nota);
    return nota;
  }

  /** Actualizar nota (proximamente: PUT /api/notas/{id}/) */
  async actualizarNota(carpetaId: number, notaId: number, contenido: string): Promise<Nota|undefined> {
    const notas = this._notas[carpetaId] || [];
    const nota = notas.find(n => n.id === notaId);
    if (nota) { nota.contenido = contenido; }
    return nota;
  }

  /** Eliminar nota (proximamente: DELETE /api/notas/{id}/) */
  async eliminarNota(carpetaId: number, notaId: number): Promise<void> {
    this._notas[carpetaId] = (this._notas[carpetaId] || []).filter(n => n.id !== notaId);
  }

  // Mock: carpetas
  private _carpetas = [{ id: 1, nombre: 'Cocina' }];

  async listarCarpetas(): Promise<{ id: number; nombre: string }[]> {
    return this._carpetas;
  }

  async crearCarpeta(nombre: string): Promise<{ id: number; nombre: string }> {
    const carpeta = { id: Date.now(), nombre };
    this._carpetas.push(carpeta);
    return carpeta;
  }
}
