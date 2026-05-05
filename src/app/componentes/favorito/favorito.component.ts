import { Component, OnInit } from '@angular/core';
import { FavoritoService } from '../../services/favorito.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

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
  idUsuario: number = 0;

  constructor(
    private favoritoService: FavoritoService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {

    this.username = this.authService.getUsername();

    this.cargarFavoritos();

    const id = localStorage.getItem('idusuario');
    this.idUsuario = id ? Number(id) : 0;
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
      next: (res: any) => {
        if (res.correct) {

          this.cargarFavoritos();

          Swal.fire({
            icon: 'success',
            title: 'Eliminado Correctamente!',
            text: 'El Pokemon fue eliminado de favoritos',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'No se pudo eliminar',
            text: res.errorMessage || 'Ocurrió un problema'
          });
        }
      },
      error: (err) => {
        console.error('Error al eliminar', err);

        Swal.fire({
          icon: 'error',
          title: 'Error del servidor',
          text: 'Intenta nuevamente más tarde'
        });
      }
    });
  }

}