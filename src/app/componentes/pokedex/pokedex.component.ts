import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PokemonService } from '../../services/pokemon.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { FavoritoService } from '../../services/favorito.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pokedex.component.html',
  styleUrls: ['./pokedex.component.css']
})
export class PokedexComponent implements OnInit {

  pokemons: any[] = [];
  pokemonsFiltrados: any[] = [];
  search: string = '';
  idUsuario: number = 0;
  idsFavoritos: Set<number> = new Set();
  pokemonLoaded: { [key: number]: boolean } = {};

  listaTiposCompletos = [
    { esp: 'Acero', eng: 'steel' }, { esp: 'Agua', eng: 'water' }, 
    { esp: 'Bicho', eng: 'bug' }, { esp: 'Dragón', eng: 'dragon' }, 
    { esp: 'Eléctrico', eng: 'electric' }, { esp: 'Fantasma', eng: 'ghost' }, 
    { esp: 'Fuego', eng: 'fire' }, { esp: 'Hada', eng: 'fairy' }, 
    { esp: 'Hielo', eng: 'ice' }, { esp: 'Lucha', eng: 'fighting' }, 
    { esp: 'Normal', eng: 'normal' }, { esp: 'Planta', eng: 'grass' }, 
    { esp: 'Psíquico', eng: 'psychic' }, { esp: 'Roca', eng: 'rock' }, 
    { esp: 'Siniestro', eng: 'dark' }, { esp: 'Tierra', eng: 'ground' }, 
    { esp: 'Veneno', eng: 'poison' }, { esp: 'Volador', eng: 'flying' }
  ];

  filtros = {
    nombre: '',
    id: '',
    tiposSeleccionados: [] as string[] 
  };

  paginaActual: number = 1;
  pokemonPorPagina: number = 12;

  tutorialActivo = false;
  indicePaso = 0;

  highlight = {
    top: 0,
    left: 0,
    width: 0,
    height: 0
  };

  tooltipTop = 0;
  tooltipLeft = 0;

  pasosTutorial = [
    {
      selector: '#tutorial-filtros',
      titulo: 'Filtros',
      descripcion: 'Busca tus Pokémon favoritos por nombre, número o combinando hasta 2 tipos elementales.'
    },
    {
      selector: '#tutorial-cards .pokemon-card:first-child', 
      titulo: 'Lista de Pokémon',
      descripcion: 'Aquí se muestran los Pokémon disponibles en formato de cartas coleccionables TCG.'
    },
    {
      selector: '#tutorial-cards .pokemon-card:first-child #tutorial-actions',
      titulo: 'Acciones de Carta',
      descripcion: 'Puedes añadir un Pokémon a tu lista de favoritos o inspeccionar sus estadísticas detalladas.'
    },
  
  ];

  private scrollHandler = () => this.handleResizeOrScroll();
  private resizeHandler = () => this.handleResizeOrScroll();

  constructor(
    private pokemonService: PokemonService,
    private favoritoService: FavoritoService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.pokemons = this.pokemonService.obtenerPokemons();

    if (!this.pokemons || this.pokemons.length === 0) {
      console.log('Pokedex vacía, redirigiendo al loader...');
      this.router.navigate(['/']);
      return;
    }

    this.pokemonsFiltrados = [...this.pokemons];

    const id = localStorage.getItem('idusuario');
    const userStored = localStorage.getItem('username');
    this.idUsuario = id ? Number(id) : 0;

    if (userStored) {
      this.cargarFavoritos(userStored);
    }

    window.addEventListener('scroll', this.scrollHandler);
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollHandler);
    window.removeEventListener('resize', this.resizeHandler);
  }

  private handleResizeOrScroll() {
    if (this.tutorialActivo) {
      this.actualizarHighlight();
    }
  }

  cargarFavoritos(username: string): void {
    this.favoritoService.getMisFavoritos(username).subscribe({
      next: (res) => {
        if (res.correct && res.objects) {
          this.idsFavoritos.clear();
          res.objects.forEach((fav: any) => {
            if (fav.pokemon && fav.pokemon.idpokemon) {
              this.idsFavoritos.add(fav.pokemon.idpokemon);
            }
          });
        }
      },
      error: (err) => console.error('Error al verificar favoritos', err)
    });
  }

  esFavorito(idPokemon: any): boolean {
    return this.idsFavoritos.has(idPokemon);
  }

  isLoading(idPokemon: any): boolean {
    return !!this.pokemonLoaded[idPokemon];
  }

  get pokemonsPaginados() {
    const inicio = (this.paginaActual - 1) * this.pokemonPorPagina;
    const fin = inicio + this.pokemonPorPagina;
    return this.pokemonsFiltrados.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.pokemonsFiltrados.length / this.pokemonPorPagina);
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
      window.scrollTo(0, 0);
    }
  }

  alternarTipo(tipoEng: string): void {
    const index = this.filtros.tiposSeleccionados.indexOf(tipoEng);

    if (index >= 0) {
      this.filtros.tiposSeleccionados.splice(index, 1);
    } else {
      if (this.filtros.tiposSeleccionados.length < 2) {
        this.filtros.tiposSeleccionados.push(tipoEng);
      } else {
        this.filtros.tiposSeleccionados.shift();
        this.filtros.tiposSeleccionados.push(tipoEng);
      }
    }
    this.filtrar();
  }

  estaTipoSeleccionado(tipoEng: string): boolean {
    return this.filtros.tiposSeleccionados.includes(tipoEng);
  }

  filtrar(): void {
    this.paginaActual = 1;

    this.pokemonsFiltrados = this.pokemons.filter(p => {
      const cumpleNombre = !this.filtros.nombre ||
        p.nombre.toLowerCase().includes(this.filtros.nombre.toLowerCase().trim());

      const searchId = this.filtros.id ? this.filtros.id.toString().trim() : '';
      const cumpleId = !searchId || p.id.toString().includes(searchId);


      const cumpleTipo = this.filtros.tiposSeleccionados.length === 0 ||
        this.filtros.tiposSeleccionados.every((tipoSeguido: string) =>
          p.tipos.some((t: any) => t.eng.toLowerCase() === tipoSeguido.toLowerCase())
        );

      return cumpleNombre && cumpleId && cumpleTipo;
    });
  }

  onGuardar(pokemon: any) {
    if (this.isLoading(pokemon.id) || this.esFavorito(pokemon.id)) return;

    if (!this.idUsuario) {
      Swal.fire({
        icon: 'warning',
        title: 'Sesión requerida',
        text: 'Debes iniciar sesión para guardar favoritos'
      });
      return;
    }

    this.pokemonLoaded[pokemon.id] = true;

    const dto = {
      idUsuario: this.idUsuario,
      idPokemon: pokemon.id,
      nombre: pokemon.nombre,
      imagen: pokemon.imagen
    };

    this.favoritoService.agregarFavorito(dto).subscribe({
      next: (res) => {
        this.pokemonLoaded[pokemon.id] = false;

        if (res.correct) {
          this.idsFavoritos.add(pokemon.id);
          Swal.fire({
            icon: 'success',
            title: '¡Guardado!',
            text: `${pokemon.nombre} fue agregado a favoritos`,
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'No se pudo guardar',
            text: res.errorMessage || 'Ocurrió un problema'
          });
        }
      },
      error: (err) => {
        this.pokemonLoaded[pokemon.id] = false;
        Swal.fire({
          icon: 'error',
          title: 'Error del servidor',
          text: 'Intenta nuevamente más tarde'
        });
        console.error('Error al guardar', err);
      }
    });
  }

  obtenerIconoTipo(tipoEng: string): string {
    const iconos: { [key: string]: string } = {
      fire: 'bi-fire',
      water: 'bi-droplet-fill',
      grass: 'bi-tree-fill', 
      electric: 'bi-lightning-charge-fill',
      ice: 'bi-snow',
      fighting: 'bi-brightness-high-fill', 
      poison: 'bi-capsule',
      ground: 'bi-hourglass-split',
      flying: 'bi-wind',
      psychic: 'bi-eye-fill',
      bug: 'bi-bug-fill',
      rock: 'bi-gem',
      ghost: 'bi-ghost',
      dragon: 'bi-dragon', 
      dark: 'bi-moon-stars-fill',
      steel: 'bi-nut-fill',
      fairy: 'bi-magic',
      normal: 'bi-circle-fill'
    };
    return iconos[tipoEng] || 'bi-circle-fill';
  }

  get pasoActual() {
    return this.pasosTutorial[this.indicePaso];
  }

  abrirTutorial() {
    this.tutorialActivo = true;
    this.indicePaso = 0;
    setTimeout(() => {
      this.actualizarHighlight();
    }, 100);
  }

  actualizarHighlight() {
    const elemento = document.querySelector(this.pasoActual.selector) as HTMLElement;
    if (!elemento) return;

    const rect = elemento.getBoundingClientRect();

    this.highlight = {
      top: rect.top - 12,
      left: rect.left - 12,
      width: rect.width + 24,
      height: rect.height + 24
    };

    const viewportHeight = window.innerHeight;
    
    if (rect.bottom > viewportHeight - 120) {
      this.tooltipTop = rect.top + 20;
      this.tooltipLeft = rect.right + 30;
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

  siguientePaso() {
    if (this.indicePaso < this.pasosTutorial.length - 1) {
      this.indicePaso++;
      
      setTimeout(() => {
        const proximoElemento = document.querySelector(this.pasoActual.selector);
        if (proximoElemento) {
          proximoElemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        setTimeout(() => this.actualizarHighlight(), 200);
      }, 50);
    } else {
      this.tutorialActivo = false;
    }
  }

  anteriorPaso() {
    if (this.indicePaso > 0) {
      this.indicePaso--;
      setTimeout(() => {
        this.actualizarHighlight();
      }, 50);
    }
  }

}