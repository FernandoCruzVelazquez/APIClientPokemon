import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonService } from '../../services/pokemon.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {

  constructor(
    public pokemonService: PokemonService,
    private router: Router
  ) {}

  async ngOnInit() {

    await this.pokemonService.cargarPokemonLocal();

    this.pokemonService.loading$.subscribe(loading => {
      if (!loading) {
        this.router.navigate(['/login']);
      }
    });
  }
}