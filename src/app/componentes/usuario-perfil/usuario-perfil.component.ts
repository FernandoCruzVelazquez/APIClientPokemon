import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuario-perfil',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './usuario-perfil.component.html',
  styleUrls: ['./usuario-perfil.component.css']
})
export class UsuarioPerfilComponent implements OnInit {

  usuario: any = {
    idusuario: 0,
    nombreusuario: '',
    username: '',
    correo: '',
    imagen: ''
  };

  imagePreview: string | null = null;
  isLoading: boolean = false;

  constructor(
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.cargarDatos(Number(id));
    } else {
      const userLogueado = JSON.parse(localStorage.getItem('usuario') || '{}');
      if (userLogueado.idusuario) {
        this.cargarDatos(userLogueado.idusuario);
      } else {
        console.error('No hay sesión activa ni ID en ruta');
        this.router.navigate(['/login']);
      }
    }
  }

  cargarDatos(id: number): void {
    this.isLoading = true;
    this.usuarioService.getById(id).subscribe({
      next: (res: any) => {
        if (res.correct && res.object) {
          this.usuario = res.object;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar entrenador:', err);
        this.isLoading = false;
      }
    });
  }

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

  desactivar(): void {
    if (!this.usuario.correo) {
      Swal.fire('Error', 'No se encontró el correo del entrenador.', 'error');
      return;
    }

    Swal.fire({
      title: '¿Desactivar Ficha de Entrenador?',
      text: `Estás a punto de desactivar la cuenta asociada a: ${this.usuario.correo}. El entrenador no podrá iniciar sesión.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;

        this.usuarioService.updateEstatus(this.usuario.correo, false).subscribe({
          next: (res: any) => {
            if (res.correct) {
              Swal.fire({
                title: '¡Cuenta Desactivada!',
                text: 'La cuenta ha sido congelada y se ha enviado un correo de notificación.',
                icon: 'success',
                confirmButtonColor: '#3085d6'
              }).then(() => {
                this.router.navigate(['/usuarios']);
              });
            } else {
              Swal.fire('Error', res.errorMessage || 'No se pudo desactivar la cuenta.', 'error');
            }
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error al cambiar estatus:', err);
            Swal.fire('Fallo de conexión', 'Hubo un problema al comunicarse con el Centro Pokémon.', 'error');
            this.isLoading = false;
          }
        });
      }
    });
  }

  updateUsuario(): void {

    const nombreRegex = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!this.usuario.nombreusuario?.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    if (!nombreRegex.test(this.usuario.nombreusuario)) {
      alert('El nombre solo puede contener letras y espacios');
      return;
    }

    if (!this.usuario.apellidopaterno?.trim()) {
      alert('El apellido paterno es obligatorio');
      return;
    }

    if (!nombreRegex.test(this.usuario.apellidopaterno)) {
      alert('El apellido paterno solo puede contener letras y espacios');
      return;
    }

    if (this.usuario.apellidomaterno && !nombreRegex.test(this.usuario.apellidomaterno)) {
      alert('El apellido materno solo puede contener letras y espacios');
      return;
    }

    if (!usernameRegex.test(this.usuario.username)) {
      alert('El nombre de usuario solo puede contener letras, números y guiones bajos');
      return;
    }

    if (!emailRegex.test(this.usuario.correo)) {
      alert('El correo electrónico no es válido');
      return;
    }

    this.isLoading = true;
    this.usuarioService.usuarioUpdate(this.usuario).subscribe({
      next: (res: any) => {
        if (res.correct) {
          alert('¡Ficha de Entrenador actualizada con éxito!');
          this.router.navigate(['/usuarios']);
        } else {
          alert('Error al actualizar: ' + res.message);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error en el servidor:', err);

        if (err.error?.message?.includes('username')) {
          alert('El nombre de usuario ya existe');
        }
        else if (err.error?.message?.includes('correo')) {
          alert('El correo ya está registrado');
        }
        else {
          alert('Hubo un fallo en la conexión con el Centro Pokémon.');
        }

        this.isLoading = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/usuarios']);
  }
}