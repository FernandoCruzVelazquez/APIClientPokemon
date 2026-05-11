import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { Router } from '@angular/router';
import { UsuarioModel } from '../../models/UsuarioModel';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  regUsername = '';
  regPassword = '';
  regConfirmPassword = '';
  regNombre = '';
  regApellidoP = '';
  regApellidoM = '';
  regCorreo = '';
  regImagen = '';
  regRolId = 1;
  registerError = '';
  registerSuccess = false;
  isRegistering = false;


  recoverCorreo = '';
  recoverToken = '';
  recoverNewPassword = '';
  recoverStep = 1;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router
  ) { }

  openRegisterModal() {
    this.registerError = '';
    this.registerSuccess = false;

    const modalElement = document.getElementById('registerModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  onLogin() {
    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login(this.username, this.password)
      .subscribe({
        next: (res: any) => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('username', res.username);
          localStorage.setItem('idusuario', res.idusuario.toString());

          this.authService.saveToken(res.token);

          this.isLoading = false;
          this.router.navigate(['/pokedex']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.status === 401 || err.status === 403
            ? 'Credenciales incorrectas.'
            : 'Error de conexión con el Servidor Pokémon.';
        }
      });
  }

  onRegister() {

    if (!this.regNombre || !this.regApellidoP || !this.regUsername || !this.regCorreo || !this.regPassword) {
      this.registerError = '¡Todos los campos obligatorios deben llenarse!';
      return;
    }

    const nombreRegex = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]+$/;

    if (!nombreRegex.test(this.regNombre)) {
      this.registerError = 'Nombre inválido';
      return;
    }

    if (!nombreRegex.test(this.regApellidoP)) {
      this.registerError = 'Apellido paterno inválido';
      return;
    }

    if (this.regApellidoM && !nombreRegex.test(this.regApellidoM)) {
      this.registerError = 'Apellido materno inválido';
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;

    if (!usernameRegex.test(this.regUsername)) {
      this.registerError = 'El usuario solo puede contener letras, números y _';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.regCorreo)) {
      this.registerError = 'Correo electrónico inválido';
      return;
    }

    if (this.regPassword.length < 6) {
      this.registerError = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.regPassword !== this.regConfirmPassword) {
      this.registerError = '¡Las contraseñas no coinciden, Entrenador!';
      return;
    }

    this.registerError = '';
    this.registerSuccess = false;
    this.isRegistering = true;

    const nuevoUsuario: UsuarioModel = {
      idusuario: 0,
      nombreusuario: this.regNombre.trim(),
      apellidopaterno: this.regApellidoP.trim(),
      apellidomaterno: this.regApellidoM?.trim() || '',
      username: this.regUsername.trim(),
      correo: this.regCorreo.trim(),
      password: this.regPassword,
      imagen: this.regImagen || '',
      rol: { idrol: this.regRolId } as any,
      activacion: 1
    };

    this.usuarioService.usuarioAdd(nuevoUsuario).subscribe({
      next: (res: any) => {
        if (res.correct) {
          const correoRecuperado = this.regCorreo;

          this.registerSuccess = true;
          this.isRegistering = false;
          this.resetForm();

          this.usuarioService.enviarBienvenida(correoRecuperado).subscribe({
            next: (mailRes) => console.log('Correo de bienvenida enviado:', mailRes.object),
            error: (mailErr) => console.error('Error al enviar correo:', mailErr)
          });

        } else {
          this.isRegistering = false;
          this.registerError = res.errorMessage;
        }
      },
      error: (err) => {
        this.isRegistering = false;
        if (err.error?.message?.includes('username')) {
          this.registerError = 'El nombre de usuario ya existe';
        } else if (err.error?.message?.includes('correo')) {
          this.registerError = 'El correo ya está registrado';
        } else {
          this.registerError = 'Error en el servidor al registrar usuario';
        }

      }
    });
  }

  resetForm() {
    this.regNombre = '';
    this.regApellidoP = '';
    this.regApellidoM = '';
    this.regUsername = '';
    this.regCorreo = '';
    this.regPassword = '';
    this.regConfirmPassword = '';
    this.regImagen = '';
  }

  openRecoverModal() {
    this.recoverStep = 1;
    this.recoverCorreo = '';
    const modalElement = document.getElementById('recoverModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  enviarTokenRecuperacion() {
    if (!this.recoverCorreo) return;

    this.usuarioService.enviarValidacionPASS(this.recoverCorreo).subscribe({
      next: (res) => {
        if (res.correct) {
          this.recoverStep = 2;
          Swal.fire({
            title: '¡Código Enviado!',
            text: 'Revisa tu correo de Entrenador.',
            icon: 'info',
            didOpen: () => {
              const container = Swal.getContainer();
              if (container) {
                container.style.zIndex = '9999';
              }
            }
          });
        }
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'No pudimos enviar el código.',
          icon: 'error',
          didOpen: () => {
            const container = Swal.getContainer();
            if (container) {
              container.style.zIndex = '9999';
            }
          }
        });
      }
    });
  }

  validarYCambiarPassword() {
    this.usuarioService.confirmarCodigo(this.recoverCorreo, this.recoverToken).subscribe({
      next: (resToken) => {
        if (resToken.correct) {
          
          this.usuarioService.actualizarPassword(this.recoverCorreo, this.recoverNewPassword).subscribe({
            next: (resPass) => {
              if (resPass.correct) {
                Swal.fire('¡Éxito!', 'Tu contraseña ha sido actualizada.', 'success');
                bootstrap.Modal.getInstance(document.getElementById('recoverModal')).hide();
              }
            }
          });
        } else {
          Swal.fire('Error', 'Código de verificación incorrecto.', 'error');
        }
      }
    });
  }

}