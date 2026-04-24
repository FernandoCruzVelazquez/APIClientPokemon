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
    if (!this.search || this.search.trim() === '') {
      this.pokemonsFiltrados = [...this.pokemons];
      return;
    }

  
    const terminos = this.search.toLowerCase().trim().split(/\s+/);

    this.pokemonsFiltrados = this.pokemons.filter(p => {
      return terminos.every(termino => {
        const cumpleNombre = p.nombre.toLowerCase().includes(termino);
        const cumpleId = p.id.toString() === termino;
        const cumpleTipoEsp = p.tipoEsp.toLowerCase().includes(termino);
        const cumpleTipoEng = p.tipoEng.toLowerCase().includes(termino);

        return cumpleNombre || cumpleId || cumpleTipoEsp || cumpleTipoEng;
      });
    });
  }
}