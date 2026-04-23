import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderComponent } from "./componentes/loader/loader.component"; 
import { PokemonService } from "./services/pokemon.service"; 


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  protected readonly title = signal('PokemonApiClient');

  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.pokemonService.cargarPokemonLocal();
  }
}