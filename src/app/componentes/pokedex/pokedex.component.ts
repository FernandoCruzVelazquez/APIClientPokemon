import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PokemonService } from '../../services/pokemon.service';

@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokedex.component.html',
  styleUrls: ['./pokedex.component.css']
})
export class PokedexComponent implements OnInit {

  pokemons: any[] = [];
  pokemonsFiltrados: any[] = [];
  search: string = '';

  paginaActual: number = 1;
  pokemonPorPagina: number = 12; 

  constructor(private pokemonService: PokemonService) {}

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
        
        // Ahora buscamos en el arreglo de tipos (español e inglés)
        const cumpleTipo = p.tipos.some((t: any) => 
          t.esp.toLowerCase().includes(termino) || 
          t.eng.toLowerCase().includes(termino)
        );

        return cumpleNombre || cumpleId || cumpleTipo;
      });
    });
  }
}