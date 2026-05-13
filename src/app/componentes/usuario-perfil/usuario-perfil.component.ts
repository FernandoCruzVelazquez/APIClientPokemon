import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
          this.usuario.password = ''; 
          if (this.usuario.imagen) {
            this.imagePreview = 'data:image/png;base64,' + this.usuario.imagen;
          }
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
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

    this.isLoading = true;

    if (this.showPasswordSection) {
      if (!this.validarSeccionPassword()) {
        this.isLoading = false;
        return;
      }

      this.usuarioService.resetPassword(this.usuario.correo, this.newPassword).subscribe({
        next: (res: any) => {
          if (res.correct) {
            this.enviarDatosPerfil();
          } else {
            alert('Error al actualizar contraseña: ' + res.errorMessage);
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Error en resetPassword:', err);
          alert('Error de conexión al cambiar la contraseña.');
          this.isLoading = false;
        }
      });
    } else {
      this.enviarDatosPerfil();
    }
  }

  private enviarDatosPerfil(): void {
    const { password, ...datosLimpios } = this.usuario;

    this.usuarioService.usuarioUpdate(datosLimpios).subscribe({
      next: (res: any) => {
        if (res.correct) {
          alert('¡Ficha de Entrenador actualizada con éxito!');
          this.router.navigate(['/usuarios']);
        } else {
          alert('Error al actualizar perfil: ' + (res.message || res.errorMessage));
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

    if (!nombreRegex.test(this.usuario.nombreusuario)) { alert('Nombre inválido'); return false; }
    if (!usernameRegex.test(this.usuario.username)) { alert('Username inválido'); return false; }
    if (!emailRegex.test(this.usuario.correo)) { alert('Correo electrónico inválido'); return false; }
    
    return true;
  }

  private validarSeccionPassword(): boolean {
    if (!this.currentPassword) {
      alert('Debes ingresar tu contraseña actual para validar');
      return false;
    }
    if (this.newPassword.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      alert('Las nuevas contraseñas no coinciden');
      return false;
    }
    return true;
  }

  private manejarErroresHttp(err: any): void {
    console.error('Error en el servidor:', err);
    const msg = err.error?.message || '';
    if (msg.includes('username')) alert('El nombre de usuario ya existe');
    else if (msg.includes('correo')) alert('El correo ya está registrado');
    else alert('Hubo un fallo en la conexión con el servidor.');
  }

  cancelar(): void {
    this.router.navigate(['/usuarios']);
  }
}