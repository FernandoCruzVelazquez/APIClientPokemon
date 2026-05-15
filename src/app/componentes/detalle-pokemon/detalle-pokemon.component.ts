import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PokemonService } from '../../services/pokemon.service';
import Swal from 'sweetalert2';
import { FavoritoService } from '../../services/favorito.service';

@Component({
  selector: 'app-detalle-pokemon',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-pokemon.component.html',
  styleUrls: ['./detalle-pokemon.component.css']
})

export class DetallePokemonComponent implements OnInit {
  pokemon: any;
  pokemons: any[] = [];
  idUsuario: number = 0;
  loading: boolean = false;
  esFavorito: boolean = false;

  audioGrito: HTMLAudioElement | null = null;

  constructor(
    private route: ActivatedRoute,
    private pokemonService: PokemonService,
    private favoritoService: FavoritoService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const todos = this.pokemonService.obtenerPokemons();
    this.pokemon = todos.find((p: any) => p.id === id);

    if (this.pokemon?.sonido) {
      this.audioGrito = new Audio(this.pokemon.sonido);
      this.audioGrito.volume = 0.5;
      this.audioGrito.load();
    }

    this.pokemons = this.pokemonService.obtenerPokemons();

    const idu = localStorage.getItem('idusuario');
    const userStored = localStorage.getItem('username');

    this.idUsuario = idu ? Number(idu) : 0;

    if (userStored && this.pokemon) {
      this.verificarEstadoFavorito(userStored);
    }
  }

  verificarEstadoFavorito(username: string): void {
    this.favoritoService.getMisFavoritos(username).subscribe({
      next: (res) => {
        if (res.correct && res.objects) {
          this.esFavorito = res.objects.some((fav: any) => fav.pokemon && fav.pokemon.idpokemon === this.pokemon.id);
        }
      },
      error: (err) => console.error('Error al verificar favoritos', err)
    });
  }

  reproducirGrito(): void {
    if (this.audioGrito) {
      this.audioGrito.currentTime = 0;
      this.audioGrito.play().catch(err => console.error("Error al reproducir audio:", err));
    }
  }


  getPolygonPoints(): string {
    if (!this.pokemon || !this.pokemon.stats) return "";

    const stats = this.pokemon.stats;
    const maxValue = 200;
    const size = 100;
    const center = 100;

    const angles = [-90, -30, 30, 90, 150, 210];
    const values = [stats.hp, stats.atk, stats.def, stats.speed, stats.spDef, stats.spAtk];

    const points = angles.map((angle, i) => {
      const ratio = values[i] / maxValue;
      const r = size * ratio;
      const x = center + r * Math.cos(angle * Math.PI / 180);
      const y = center + r * Math.sin(angle * Math.PI / 180);
      return `${x},${y}`;
    });

    return points.join(" ");
  }

  onGuardar(pokemon: any) {
    if (this.loading || this.esFavorito) return;

    if (!this.idUsuario) {
      Swal.fire({
        icon: 'warning',
        title: 'Sesión requerida',
        text: 'Debes iniciar sesión para guardar favoritos'
      });
      return;
    }

    this.loading = true;

    const dto = {
      idUsuario: this.idUsuario,
      idPokemon: pokemon.id,
      nombre: pokemon.nombre,
      imagen: pokemon.imagen
    };

    this.favoritoService.agregarFavorito(dto).subscribe({
      next: (res) => {
        this.loading = false;

        if (res.correct) {
          this.esFavorito = true;
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
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Error del servidor',
          text: 'Intenta nuevamente más tarde'
        });
        console.error('Error al guardar', err);
      }
    });
  }


  getChartColor(): string {
    if (!this.pokemon || !this.pokemon.tipos?.length) return 'rgba(255, 203, 5, 0.6)';

    const type = this.pokemon.tipos[0].eng;
    const colors: any = {
      fire: 'rgba(240, 128, 48, 0.6)',
      water: 'rgba(104, 144, 240, 0.6)',
      grass: 'rgba(120, 200, 80, 0.6)',
      electric: 'rgba(248, 208, 48, 0.6)',
    };
    return colors[type] || 'rgba(255, 203, 5, 0.6)';
  }
}