import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

interface PasoTutorial {
  selector: string;
  titulo: string;
  descripcion: string;
}

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

  tutorialActivo: boolean = false;
  indicePaso: number = 0;

  highlight = { top: 0, left: 0, width: 0, height: 0 };
  tooltipTop: number = 0;
  tooltipLeft: number = 0;

  pasosTutorial: PasoTutorial[] = [
    {
      selector: '#nav-favoritos',
      titulo: 'Tus Favoritos',
      descripcion: 'Accede rápidamente a la colección de Pokémon que has guardado en tu cuenta.'
    },
    {
      selector: '#nav-perfil',
      titulo: 'Perfil de Entrenador',
      descripcion: 'Aquí puedes revisar tus datos, estadísticas de combate y personalizar tu avatar.'
    },
    {
      selector: '#nav-ranking',
      titulo: 'Ranking de pokemon',
      descripcion: 'Aquí se muestran los pokemon que han entrado entre los primeros 10 más favoritos para los entrenadores.'
    },
    {
      selector: '#nav-user',
      titulo: 'Sesión Activa',
      descripcion: 'Muestra tu nombre clave de entrenador registrado actualmente en el sistema.'
    },
    {
      selector: '#tutorial-filtros',
      titulo: 'Panel de Búsqueda',
      descripcion: 'Filtra el catálogo completo por nombre, número identificador o combinando tipos elementales.'
    },
    {
      selector: '#tutorial-cards .pokemon-card:first-child',
      titulo: 'Tarjetas TCG',
      descripcion: 'Examina las habilidades, movimientos, puntos de vida e imágenes nítidas de cada espécimen.'
    },
    {
      selector: '#tutorial-cards .pokemon-card:first-child #tutorial-actions',
      titulo: 'Acciones Rápidas',
      descripcion: 'Puedes añadir este Pokémon a tus favoritos al instante o inspeccionar sus gráficas de estadísticas.'
    },

  ];

  constructor(private router: Router) { }

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

    window.addEventListener('resize', () => {
      if (this.tutorialActivo) this.actualizarHighlight();
    });

    this.checkUserRole();
  }

  checkUserRole() {
    const token = localStorage.getItem('token');

    if (token) {
      try {

        const decodedToken: any = jwtDecode(token);

        const roles = decodedToken.role || [];


        this.isProfesor = roles.some((r: any) => r.authority === 'ROLE_Profesor');

      } catch (error) {
        console.error("Error decodificando el token:", error);
        this.isProfesor = false;
      }
    }
  }

  get pasoActual(): PasoTutorial {
    return this.pasosTutorial[this.indicePaso];
  }

  abrirTutorial(): void {
    this.router.navigate(['/pokedex']);

    this.indicePaso = 0;
    this.tutorialActivo = true;

    setTimeout(() => this.actualizarHighlight(), 150);
  }

  actualizarHighlight(): void {
    const elemento = document.querySelector(this.pasoActual.selector) as HTMLElement;

    if (!elemento) {
      console.warn(`El elemento ${this.pasoActual.selector} no está disponible en la vista actual.`);
      return;
    }

    const rect = elemento.getBoundingClientRect();

    this.highlight = {
      top: rect.top - 12,
      left: rect.left - 12,
      width: rect.width + 24,
      height: rect.height + 24
    };

    const viewportHeight = window.innerHeight;

    if (rect.bottom > viewportHeight - 140) {
      this.tooltipTop = rect.top - 180;
      this.tooltipLeft = rect.left + (rect.width / 2) - 220;
    } else {
      this.tooltipTop = rect.bottom + 25;
      this.tooltipLeft = rect.left + (rect.width / 2) - 220;
    }

    if (this.tooltipLeft < 20) {
      this.tooltipLeft = 20;
    }
    if (this.tooltipLeft + 440 > window.innerWidth) {
      this.tooltipLeft = window.innerWidth - 460;
    }
  }

  siguientePaso(): void {
    if (this.indicePaso < this.pasosTutorial.length - 1) {
      this.indicePaso++;

      setTimeout(() => {
        const proximoElemento = document.querySelector(this.pasoActual.selector);
        if (proximoElemento) {
          proximoElemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        setTimeout(() => this.actualizarHighlight(), 250);
      }, 50);
    } else {
      this.tutorialActivo = false;
    }
  }

  anteriorPaso(): void {
    if (this.indicePaso > 0) {
      this.indicePaso--;

      setTimeout(() => {
        const elementoPrevio = document.querySelector(this.pasoActual.selector);
        if (elementoPrevio) {
          elementoPrevio.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setTimeout(() => this.actualizarHighlight(), 250);
      }, 50);
    }
  }

  onLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('idusuario');
    localStorage.removeItem('rol'); 
    this.router.navigate(['/login']);
  }
}