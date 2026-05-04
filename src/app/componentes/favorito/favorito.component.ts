import { Component, OnInit } from '@angular/core';
import { FavoritoService } from '../../services/favorito.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-favorito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorito.component.html',
  styleUrls: ['./favorito.component.css']
})
export class FavoritoComponent implements OnInit {

  favoritos: any[] = [];
  username: string = '';
  idUsuario: number = 1; 

  constructor(
    private favoritoService: FavoritoService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {

    this.username = this.authService.getUsername();

    this.cargarFavoritos();
  }

  cargarFavoritos() {
    this.favoritoService.getMisFavoritos(this.username).subscribe({
      next: (res: any) => {

        console.log('FAVORITOS:', res);

        this.favoritos = res.objects || [];

      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  eliminar(idPokemon: number) {
    this.favoritoService.eliminarFavorito(this.idUsuario, idPokemon).subscribe({
      next: () => {
        this.cargarFavoritos();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}