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

  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.pokemons = this.pokemonService.obtenerPokemons();

    this.pokemonsFiltrados = [...this.pokemons];
  }

  filtrar(): void {
    // 1. Si no hay nada escrito, mostramos todos y salimos
    if (!this.search || this.search.trim() === '') {
      this.pokemonsFiltrados = [...this.pokemons];
      return;
    }

    // 2. Convertimos a minúsculas y separamos por espacios para permitir búsquedas múltiples
    // Ejemplo: "Fuego 4" -> ["fuego", "4"]
    const terminos = this.search.toLowerCase().trim().split(/\s+/);

    this.pokemonsFiltrados = this.pokemons.filter(p => {
      // 3. Verificamos que el Pokémon cumpla con CADA uno de los términos escritos
      return terminos.every(termino => {
        const cumpleNombre = p.nombre.toLowerCase().includes(termino);
        const cumpleId = p.id.toString() === termino;
        const cumpleTipoEsp = p.tipoEsp.toLowerCase().includes(termino);
        const cumpleTipoEng = p.tipoEng.toLowerCase().includes(termino);

        // Si el término coincide con cualquiera de estos campos, es una coincidencia
        return cumpleNombre || cumpleId || cumpleTipoEsp || cumpleTipoEng;
      });
    });
  }
}