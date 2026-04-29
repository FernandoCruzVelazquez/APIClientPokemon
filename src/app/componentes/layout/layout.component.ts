import { Component, OnInit } from '@angular/core'; // Importa OnInit
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

  constructor(private router: Router) {}

  ngOnInit() {
    const savedUser = localStorage.getItem('username');
    if (savedUser) {
      this.username = savedUser;
    }
  }

  onLogout() {
    console.log("Cerrando sesión...");
    localStorage.clear(); 
    this.router.navigate(['/login']);
  }
}