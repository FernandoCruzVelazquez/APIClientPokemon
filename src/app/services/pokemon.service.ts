import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  public progress$ = new BehaviorSubject<number>(0);
  public loading$ = new BehaviorSubject<boolean>(false);

  private readonly STORAGE_KEY = 'pokedex_local_perpetual_v3';

  constructor(private http: HttpClient) { }

  async cargarPokemonLocal() {

    const cachedData = localStorage.getItem(this.STORAGE_KEY);

    if (cachedData) {
      this.progress$.next(100);
      this.loading$.next(false);
      return;
    }

    this.loading$.next(true);

    const total = 1025;
    const batchSize = 25;

    const listaPokes: any[] = [];

    const traduccionTipos: any = {
      fire: 'Fuego',
      water: 'Agua',
      grass: 'Planta',
      electric: 'Eléctrico',
      ice: 'Hielo',
      fighting: 'Lucha',
      poison: 'Veneno',
      ground: 'Tierra',
      flying: 'Volador',
      psychic: 'Psíquico',
      bug: 'Bicho',
      rock: 'Roca',
      ghost: 'Fantasma',
      dragon: 'Dragón',
      dark: 'Siniestro',
      steel: 'Acero',
      fairy: 'Hada',
      normal: 'Normal'
    };

    try {

      for (let inicio = 1; inicio <= total; inicio += batchSize) {

        const fin = Math.min(inicio + batchSize - 1, total);
        const requests = [];

        for (let i = inicio; i <= fin; i++) {

          requests.push(
            lastValueFrom(
              forkJoin({
                pokemon: this.http.get(`https://pokeapi.co/api/v2/pokemon/${i}`),
                species: this.http.get(`https://pokeapi.co/api/v2/pokemon-species/${i}`)
              })
            )
          );
        }

        const resultados = await Promise.all(requests);

        resultados.forEach((res: any) => {

          const data = res.pokemon;
          const speciesData = res.species;
          const categoriaEsp =
            speciesData.genera.find(
              (g: any) => g.language.name === 'es'
            )?.genus || 'Desconocido';

          const urlSonido =
            data.cries?.latest ||
            data.cries?.legacy ||
            null;

          const listaTipos = data.types.map((t: any) => ({
            esp: traduccionTipos[t.type.name] || t.type.name,
            eng: t.type.name
          }));

          listaPokes.push({
            id: data.id,
            nombre: data.name,
            imagen:
              data.sprites.other['official-artwork']
                .front_default,

            sonido: urlSonido,
            stats: {
              hp: data.stats[0].base_stat,
              atk: data.stats[1].base_stat,
              def: data.stats[2].base_stat,
              spAtk: data.stats[3].base_stat,
              spDef: data.stats[4].base_stat,
              speed: data.stats[5].base_stat
            },

            tipos: listaTipos,
            habilidad:
              (data.abilities[0]?.ability.name || 'N/A')
                .replace(/-/g, ' '),
            ataque:
              (data.moves[0]?.move.name || 'N/A')
                .replace(/-/g, ' '),
            altura: data.height / 10,
            peso: data.weight / 10,

            categoria: categoriaEsp,

            genero: speciesData.gender_rate
          });
        });

        const progreso = Math.round((fin / total) * 100);
        this.progress$.next(progreso);
      }

      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(listaPokes)
      );

    } catch (error) {
      console.error(
        'Error al cargar la PokeAPI:',
        error
      );
    } finally {

      this.loading$.next(false);
    }
  }

  obtenerPokemons() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data
      ? JSON.parse(data)
      : [];
  }

  limpiarCache() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.progress$.next(0);
  }
}