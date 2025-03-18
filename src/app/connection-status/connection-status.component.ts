import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Asegúrate de que la ruta sea correcta
import { User } from '@angular/fire/auth'; // Asegúrate de que el tipo User sea correcto

@Component({
  selector: 'app-connection-status',
  templateUrl: './connection-status.component.html',
  styleUrls: ['./connection-status.component.scss'],
})
export class ConnectionStatusComponent implements OnInit {
  isLoggedIn: boolean = false;
  email: string = 'Invitado'; // Valor predeterminado

  constructor(private authService: AuthService) {}

 
  ngOnInit() {
    console.log('Estado inicial:', this.isLoggedIn, this.email); // Muestra el estado inicial
    
    this.authService.getUser().subscribe(user => {
      console.log('Usuario:', user); // Verifica el valor de user
      this.isLoggedIn = !!user; // Verifica si hay un usuario autenticado
      this.email = user && user.email ? user.email : 'Invitado'; // Asigna el email o 'Invitado'
      
      // Muestra el estado actualizado
      console.log('Estado actualizado:', this.isLoggedIn, 'Email:', this.email);
    }, error => {
      console.error('Error al obtener el usuario:', error); // Manejo de errores
    });
  }
}