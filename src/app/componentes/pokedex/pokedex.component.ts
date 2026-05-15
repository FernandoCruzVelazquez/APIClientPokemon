import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PokemonService } from '../../services/pokemon.service';
import { Router } from '@angular/router'; 

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
  loading: boolean = false;

  filtros = {
    nombre: '',
    id: '',
    tipo: ''
  };

  paginaActual: number = 1;
  pokemonPorPagina: number = 12;

  constructor(
    private pokemonService: PokemonService,
    private favoritoService: FavoritoService,
    private router: Router
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
      this.idUsuario = id ? Number(id) : 0;
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

  filtrar(): void {
    this.paginaActual = 1;

    this.pokemonsFiltrados = this.pokemons.filter(p => {
      const cumpleNombre = !this.filtros.nombre ||
        p.nombre.toLowerCase().includes(this.filtros.nombre.toLowerCase().trim());

      const searchId = this.filtros.id ? this.filtros.id.toString().trim() : '';
      const cumpleId = !searchId || p.id.toString().includes(searchId);

      const cumpleTipo = !this.filtros.tipo ||
        p.tipos.some((t: any) =>
          t.esp.toLowerCase().includes(this.filtros.tipo.toLowerCase().trim()) ||
          t.eng.toLowerCase().includes(this.filtros.tipo.toLowerCase().trim())
        );

      return cumpleNombre && cumpleId && cumpleTipo;
    });
  }

  onGuardar(pokemon: any) {
    if (this.loading) return;

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
}