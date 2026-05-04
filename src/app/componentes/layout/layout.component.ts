import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {

  username: string = 'Entrenador';
  idUsuarioLogueado: number = 0; 

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
  }

  onLogout() {
    console.log("Cerrando sesión...");
    localStorage.clear(); 
    this.router.navigate(['/login']);
  }
}