import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../services/usuario.service';
import { FavoritoService } from '../../services/favorito.service';
import { ResultModel } from '../../models/ResultModel';
import { UsuarioModel } from '../../models/UsuarioModel';

@Component({
  selector: 'app-usuario-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario-detalle.component.html',
  styleUrls: ['./usuario-detalle.component.css'] 
})
export class UsuarioDetalleComponent implements OnInit {

  // esto es para la izquiera osea el perfil
  usuario: any = {
    idusuario: 0,
    nombreusuario: '',
    username: '',
    correo: '',
    imagen: ''
  };

  // la lista para los favoritos que va a la derecha
  favoritos: any[] = [];

  imagePreview: string | null = null;
  isLoadingPerfil: boolean = false;
  isLoadingFavoritos: boolean = false;

  idUsuarioLogueado: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private favoritoService: FavoritoService
  ) { }

  ngOnInit(): void {
    const savedId = localStorage.getItem('idusuario');
    this.idUsuarioLogueado = savedId ? Number(savedId) : 0;

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.cargarDetalleEntrenador(Number(idParam));
    } else {
      console.error('No se especificó un ID de entrenador en la ruta');
      this.router.navigate(['/usuarios']);
    }
  }

  // haecmos que cargue el perfil y automaticamente sus favoritos, como cascada
  cargarDetalleEntrenador(id: number): void {
    this.isLoadingPerfil = true;

    this.usuarioService.getById(id).subscribe({
      next: (res: ResultModel<UsuarioModel>) => {
        if (res.correct && res.object) {
          this.usuario = res.object;

          this.cargarFavoritosDeEntrenador(this.usuario.username);
        } else {
          Swal.fire('Error', 'No se pudo encontrar la información del entrenador', 'error');
          this.router.navigate(['/usuarios']);
        }
        this.isLoadingPerfil = false;
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.isLoadingPerfil = false;
        Swal.fire('Error', 'Hubo un fallo al conectar con la base de datos', 'error');
      }
    });
  }

  cargarFavoritosDeEntrenador(username: string): void {
    this.isLoadingFavoritos = true;
    this.favoritoService.getMisFavoritos(username).subscribe({
      next: (res: any) => {
        this.favoritos = res.objects || [];
        this.isLoadingFavoritos = false;
      },
      error: (err) => {
        console.error('Error al cargar favoritos:', err);
        this.isLoadingFavoritos = false;
      }
    });
  }

  eliminarFavorito(idPokemon: number): void {
    if (this.idUsuarioLogueado === 0) {
      Swal.fire('Error', 'No se detectó una sesión activa', 'error');
      return;
    }

    this.favoritoService.eliminarFavorito(this.idUsuarioLogueado, idPokemon).subscribe({
      next: (res: any) => {
        if (res.correct) {
          this.cargarFavoritosDeEntrenador(this.usuario.username);
          Swal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: 'Pokémon retirado de favoritos con éxito',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          Swal.fire('Error', res.errorMessage || 'No se pudo eliminar de favoritos', 'error');
        }
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        Swal.fire('Error', 'No se pudo procesar la solicitud de eliminación', 'error');
      }
    });
  }

  // para cambiar foto de perfil, si meti metodos pero no se si sirvan
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        const base64String = this.imagePreview.split(',')[1];
        this.usuario.imagen = base64String;
      };
      reader.readAsDataURL(file);
    }
  }

  updateUsuario(): void {
    this.isLoadingPerfil = true;
    this.usuarioService.usuarioUpdate(this.usuario).subscribe({
      next: (res: any) => {
        if (res.correct) {
          Swal.fire('¡Éxito!', 'Ficha de Entrenador actualizada', 'success');
        } else {
          Swal.fire('Error', 'Error al actualizar: ' + res.message, 'error');
        }
        this.isLoadingPerfil = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoadingPerfil = false;
        Swal.fire('Error', 'No se pudo actualizar el perfil', 'error');
      }
    });
  }

  // si no sirve, se regresa
  regresar(): void {
    this.router.navigate(['/usuarios']);
  }
}