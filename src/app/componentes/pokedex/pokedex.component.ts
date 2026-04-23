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
    const texto = this.search.toLowerCase().trim();

    this.pokemonsFiltrados = this.pokemons.filter(p =>
      p.nombre.toLowerCase().includes(texto)
    );
  }
}