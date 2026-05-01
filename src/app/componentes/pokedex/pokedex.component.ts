import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PokemonService } from '../../services/pokemon.service';
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

  filtros = {
    nombre: '',
    id: '',
    tipo: ''
  };

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
    console.log('Guardando a:', pokemon.nombre);
  }
}