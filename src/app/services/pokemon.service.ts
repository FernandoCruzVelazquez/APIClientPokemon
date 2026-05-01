import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PokemonService {

  public progress$ = new BehaviorSubject<number>(0);
  public loading$ = new BehaviorSubject<boolean>(false);
  private readonly STORAGE_KEY = 'pokedex_local_perpetual_v2'; 

  constructor(private http: HttpClient) {}

  async cargarPokemonLocal() {
    const cachedData = localStorage.getItem(this.STORAGE_KEY);
    if (cachedData) {
      this.loading$.next(false);
      return;
    }

    this.loading$.next(true);
    const total = 1025;
    let listaPokes: any[] = [];

    const traduccionTipos: any = {
      fire: 'Fuego', water: 'Agua', grass: 'Planta', electric: 'Eléctrico',
      ice: 'Hielo', fighting: 'Lucha', poison: 'Veneno', ground: 'Tierra',
      flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho', rock: 'Roca',
      ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro', steel: 'Acero',
      fairy: 'Hada', normal: 'Normal'
    };

    try {
      for (let i = 1; i <= total; i++) {
        const data: any = await lastValueFrom(
          this.http.get(`https://pokeapi.co/api/v2/pokemon/${i}`)
        );

        const listaTipos = data.types.map((t: any) => ({
          esp: traduccionTipos[t.type.name] || t.type.name,
          eng: t.type.name
        }));

        listaPokes.push({
          id: data.id,
          nombre: data.name,
          imagen: data.sprites.other['official-artwork'].front_default,
          stats: {
            hp: data.stats[0].base_stat,
            atk: data.stats[1].base_stat,
            def: data.stats[2].base_stat,
            spAtk: data.stats[3].base_stat,
            spDef: data.stats[4].base_stat,
            speed: data.stats[5].base_stat
          },
          tipos: listaTipos, 
          habilidad: (data.abilities[0]?.ability.name || 'N/A').replace(/-/g, ' '),
          ataque: (data.moves[0]?.move.name || 'N/A').replace(/-/g, ' ')
        });

        this.progress$.next(Math.round((i / total) * 100));
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(listaPokes));
      
    } catch (error) {
      console.error("Error al cargar la PokeAPI:", error);
    } finally {
      this.loading$.next(false);
    }
  }

  obtenerPokemons() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  limpiarCache() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}