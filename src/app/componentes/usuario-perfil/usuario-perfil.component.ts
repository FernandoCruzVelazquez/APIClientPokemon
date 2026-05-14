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
    apellidopaterno: '',
    apellidomaterno: '',
    username: '',
    correo: '',
    imagen: '',
    password: '' 
  };

  showPasswordSection: boolean = false;
  currentPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';

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
      const idLocal = localStorage.getItem('idusuario');
      if (idLocal) {
        this.cargarDatos(Number(idLocal));
      } else {
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
          this.usuario.password = ''; 
          if (this.usuario.imagen) {
            this.imagePreview = 'data:image/png;base64,' + this.usuario.imagen;
          }
        }
        this.isLoading = false;
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudieron cargar los datos del entrenador', 'error');
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
        this.usuario.imagen = this.imagePreview.split(',')[1];
      };
      reader.readAsDataURL(file);
    }
  }

  togglePasswordSection(): void {
    this.showPasswordSection = !this.showPasswordSection;
    if (!this.showPasswordSection) {
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmNewPassword = '';
    }
  }

  updateUsuario(): void {
    if (!this.validarFormularioGeneral()) return;

    if (this.showPasswordSection) {
      if (!this.validarSeccionPassword()) return;

      this.isLoading = true;
      this.usuarioService.resetPassword(this.usuario.correo, this.newPassword).subscribe({
        next: (res: any) => {
          if (res.correct) {
            this.enviarDatosPerfil();
          } else {
            Swal.fire('Error', 'No se pudo actualizar la contraseña: ' + res.errorMessage, 'error');
            this.isLoading = false;
          }
        },
        error: () => {
          Swal.fire('Error de conexión', 'No se pudo contactar con el Centro Pokémon (servidor)', 'error');
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = true;
      this.enviarDatosPerfil();
    }
  }

  private enviarDatosPerfil(): void {
    const { password, ...datosLimpios } = this.usuario;

    this.usuarioService.usuarioUpdate(datosLimpios).subscribe({
      next: (res: any) => {
        if (res.correct) {
          Swal.fire({
            title: '¡Éxito!',
            text: '¡Ficha de Entrenador actualizada con éxito!',
            icon: 'success',
            confirmButtonColor: '#3085d6'
          }).then(() => {
            this.router.navigate(['/usuarios']);
          });
        } else {
          Swal.fire('Error', res.message || res.errorMessage, 'error');
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.manejarErroresHttp(err);
        this.isLoading = false;
      }
    });
  }

  private validarFormularioGeneral(): boolean {
    const nombreRegex = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nombreRegex.test(this.usuario.nombreusuario)) { 
      this.toastError('El nombre contiene caracteres no permitidos'); 
      return false; 
    }
    if (!usernameRegex.test(this.usuario.username)) { 
      this.toastError('El username solo permite letras, números y guiones bajos'); 
      return false; 
    }
    if (!emailRegex.test(this.usuario.correo)) { 
      this.toastError('Formato de correo electrónico no válido'); 
      return false; 
    }
    
    return true;
  }

  private validarSeccionPassword(): boolean {
    if (!this.currentPassword) {
      this.toastError('Debes ingresar tu contraseña actual');
      return false;
    }
    if (this.newPassword.length < 6) {
      this.toastError('La nueva contraseña es demasiado corta (mínimo 6)');
      return false;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.toastError('Las nuevas contraseñas no coinciden');
      return false;
    }
    return true;
  }

  private toastError(mensaje: string) {
    Swal.fire({
      icon: 'warning',
      title: 'Dato inválido',
      text: mensaje,
      timer: 3000,
      toast: true,
      position: 'top-end',
      showConfirmButton: false
    });
  }

  private manejarErroresHttp(err: any): void {
    const msg = err.error?.message || '';
    if (msg.includes('username')) {
      Swal.fire('Username ocupado', 'Este nombre de usuario ya pertenece a otro entrenador', 'warning');
    } else if (msg.includes('correo')) {
      Swal.fire('Correo registrado', 'Este email ya está en uso', 'warning');
    } else {
      Swal.fire('Fallo de conexión', 'Hubo un error al comunicar con el servidor.', 'error');
    }
  }

  cancelar(): void {
    this.router.navigate(['/usuarios']);
  }
}