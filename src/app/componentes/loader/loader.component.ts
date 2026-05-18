import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonService } from '../../services/pokemon.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, first } from 'rxjs/operators';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit, OnDestroy {
  
  private loadingSub?: Subscription;

  constructor(
    public pokemonService: PokemonService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.pokemonService.cargarPokemonLocal();


    this.loadingSub = this.pokemonService.loading$
      .pipe(filter(loading => !loading), first())
      .subscribe(() => {
        this.verificarRedireccion();
      });
  }

  private verificarRedireccion() {
    const urlActual = this.router.url;
    
    if (urlActual === '/' || urlActual === '/loader') {
      this.router.navigate(['/login']);
    } 
  }

  ngOnDestroy() {
    if (this.loadingSub) {
      this.loadingSub.unsubscribe();
    }
  }
}