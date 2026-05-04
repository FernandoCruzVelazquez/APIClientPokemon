import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PokemonService } from '../../services/pokemon.service';
import { FavoritoService } from '../../services/favorito.service';
import { RouterModule } from '@angular/router';

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
  idUsuario: number = 1;
  loading: boolean = false;

  paginaActual: number = 1;
  pokemonPorPagina: number = 12;

  constructor(
    private pokemonService: PokemonService,
    private favoritoService: FavoritoService
  ) { }

  ngOnInit(): void {
    this.pokemons = this.pokemonService.obtenerPokemons();
    this.pokemonsFiltrados = [...this.pokemons];
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

    if (!this.search || this.search.trim() === '') {
      this.pokemonsFiltrados = [...this.pokemons];
      return;
    }

    const terminos = this.search.toLowerCase().trim().split(/\s+/);

    this.pokemonsFiltrados = this.pokemons.filter(p => {
      return terminos.every(termino => {
        const cumpleNombre = p.nombre.toLowerCase().includes(termino);
        const cumpleId = p.id.toString() === termino;

        const cumpleTipo = p.tipos.some((t: any) =>
          t.esp.toLowerCase().includes(termino) ||
          t.eng.toLowerCase().includes(termino)
        );

        return cumpleNombre || cumpleId || cumpleTipo;
      });
    });
  }

  onGuardar(pokemon: any) {

    if (this.loading) return;

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
          console.log('Guardado correctamente');
        } else {
          console.warn(res.errorMessage);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al guardar', err);
      }
    });
  }
}