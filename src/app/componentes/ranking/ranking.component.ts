import { Component, OnInit } from '@angular/core';
import { FavoritoService } from '../../services/favorito.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.css'
})
export class RankingComponent implements OnInit {

  rankingCompleto: any[] = [];
  loading: boolean = true;
  errorMsg: string = '';

  constructor(private favoritoService: FavoritoService) { }

  ngOnInit(): void {
    this.cargarRanking();
  }

  cargarRanking(): void {
    this.loading = true;
    this.favoritoService.getRankingPokemon().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.correct && res.objects) {
          this.rankingCompleto = res.objects;
        } else {
          this.errorMsg = res.errorMessage ||'No se pudo cargar el ranking.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = 'Error al cargar el ranking: ' + (err.message || err);
        console.error(err);
      }
    });
  }

  //aqui avente a los 3 primeros klugares
  get podio() {
    return this.rankingCompleto.slice(0, 3);
  }

  //Aqui al resto
  get listaRestante() {
    return this.rankingCompleto.slice(3);
  }

}
