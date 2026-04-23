import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PokemonService {
  public progress$ = new BehaviorSubject<number>(0);
  public loading$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  async cargarPokemonLocal() {
    if (sessionStorage.getItem('pokedex_local')) return;

    this.loading$.next(true);
    const total = 150;
    let listaPokes = [];

    for (let i = 1; i <= total; i++) {
      const data: any = await this.http.get(`https://pokeapi.co/api/v2/pokemon/${i}`).toPromise();
      listaPokes.push({
        id: data.id,
        nombre: data.name,
        imagen: data.sprites.other['official-artwork'].front_default
      });
      this.progress$.next(Math.round((i / total) * 100));
    }

    sessionStorage.setItem('pokedex_local', JSON.stringify(listaPokes));
    this.loading$.next(false);
  }
}