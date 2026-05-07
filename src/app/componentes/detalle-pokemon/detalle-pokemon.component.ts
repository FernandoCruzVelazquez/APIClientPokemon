import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PokemonService } from '../../services/pokemon.service';

@Component({
  selector: 'app-detalle-pokemon',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-pokemon.component.html',
  styleUrls: ['./detalle-pokemon.component.css']
})
export class DetallePokemonComponent implements OnInit {
  pokemon: any;
  
  audioGrito: HTMLAudioElement | null = null;

  constructor(
    private route: ActivatedRoute,
    private pokemonService: PokemonService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const todos = this.pokemonService.obtenerPokemons();
    this.pokemon = todos.find((p: any) => p.id === id);

    if (this.pokemon?.sonido) {
      this.audioGrito = new Audio(this.pokemon.sonido);
      this.audioGrito.volume = 0.5;
      this.audioGrito.load(); 
    }
  }

  reproducirGrito(): void {
    if (this.audioGrito) {
      this.audioGrito.currentTime = 0; 
      this.audioGrito.play().catch(err => console.error("Error al reproducir audio:", err));
    }
  }

  getPolygonPoints(): string {
    if (!this.pokemon) return "";
    
    const stats = this.pokemon.stats;
    const maxValue = 200; 
    const size = 100;    
    const center = 100;
    
    const angles = [-90, -30, 30, 90, 150, 210];
    const values = [stats.hp, stats.atk, stats.def, stats.speed, stats.spDef, stats.spAtk];

    const points = angles.map((angle, i) => {
      const ratio = values[i] / maxValue;
      const r = size * ratio;
      const x = center + r * Math.cos(angle * Math.PI / 180);
      const y = center + r * Math.sin(angle * Math.PI / 180);
      return `${x},${y}`;
    });

    return points.join(" ");
  }

  getChartColor(): string {
    if (!this.pokemon || !this.pokemon.tipos.length) return 'rgba(255, 203, 5, 0.6)';
    
    const type = this.pokemon.tipos[0].eng;
    const colors: any = {
      fire: 'rgba(240, 128, 48, 0.6)',
      water: 'rgba(104, 144, 240, 0.6)',
      grass: 'rgba(120, 200, 80, 0.6)',
      electric: 'rgba(248, 208, 48, 0.6)',
    };
    return colors[type] || 'rgba(255, 203, 5, 0.6)';
  }
}