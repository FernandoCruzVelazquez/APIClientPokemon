import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})

export class LayoutComponent {

  username: String = "Usuario";

  constructor(private router: Router) {}

  onLogout() {
    console.log("Cerrando sesión...");
    this.router.navigate(['/login']);
  }

}
