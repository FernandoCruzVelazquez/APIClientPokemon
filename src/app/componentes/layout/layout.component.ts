import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, NgIf],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {

  username: string = 'Entrenador';
  idUsuarioLogueado: number = 0;
  isProfesor: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    const savedUser = localStorage.getItem('username');
    const savedId = localStorage.getItem('idusuario'); 

    if (savedUser) {
      this.username = savedUser;
    }

    if (savedId) {
      this.idUsuarioLogueado = Number(savedId);
    } else {
      console.warn("No se encontró el ID del usuario en el storage");
    }

    this.checkUserRole();
  }

  checkUserRole() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const roles = decodedToken.role || [];

        this.isProfesor = roles.some((r: any) => r.authority === "ROLE_Profesor");
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        this.isProfesor = false;
      }
    }
  }

  onLogout() {
    console.log("Cerrando sesión...");
    localStorage.clear(); 
    this.router.navigate(['/login']);
  }
}