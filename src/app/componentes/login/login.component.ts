import { Component, OnDestroy } from '@angular/core';
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
export class LoginComponent implements OnDestroy {

  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  regUsername = ''; regPassword = ''; regConfirmPassword = ''; regNombre = '';
  regApellidoP = ''; regApellidoM = ''; regCorreo = ''; regImagen = '';
  regRolId = 1; registerError = ''; registerSuccess = false; isRegistering = false;
  
  recoverCorreo = ''; recoverToken = ''; recoverNewPassword = ''; recoverStep = 1;

  intervaloVerificacion: any;
  cuentaActivadaExitosamente = false;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router
  ) { }

  ngOnDestroy(): void {
    this.detenerHiloVerificacion();
  }

  onLogin() {
    this.errorMessage = '';
    this.isLoading = true;
    this.cuentaActivadaExitosamente = false;

    this.authService.login(this.username, this.password).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        this.authService.saveToken(res.token); 

        this.usuarioService.getById(res.idusuario).subscribe({
          next: (userRes: any) => {
            const usuario = userRes.object;
            
            if (usuario && usuario.activacion === 0) { 
              this.isLoading = false;

              this.usuarioService.enviarValidacion(usuario.correo).subscribe({
                next: () => {
                  console.log("Enlace de activación enviado");
                  this.mostrarModalEsperaVerificacion(usuario.idusuario, usuario.correo, res);
                },
                error: (err) => {
                  console.error("Error al enviar el enlace", err);
                  this.mostrarModalEsperaVerificacion(usuario.idusuario, usuario.correo, res);
                }
              });

            } else {
              this.completarLogin(res);
            }
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = 'Error al verificar perfil.';
            localStorage.clear(); 
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Credenciales incorrectas.';
      }
    });
  }

  completarLogin(res: any) {
    this.cuentaActivadaExitosamente = true;
    localStorage.setItem('token', res.token);
    localStorage.setItem('username', res.username);
    localStorage.setItem('idusuario', res.idusuario.toString());
    if(res.rol) localStorage.setItem('rol', res.rol);
    
    this.authService.saveToken(res.token);
    this.isLoading = false;
    this.router.navigate(['/pokedex']);
  }

  mostrarModalEsperaVerificacion(id: number, correo: string, loginData: any) {
    Swal.fire({
      title: '¡ALTO AHÍ, ENTRENADOR!',
      html: `
        <div class="pokedex-waiting-content">
          <p>Tu cuenta aún no está activa. Hemos enviado un enlace a: <br><strong>${correo}</strong></p>
          <div class="poke-loader"></div>
          <p class="mt-3" style="font-size: 0.8rem;">Haz clic en el botón de validación dentro de tu correo.<br><strong>Esta pantalla se cerrará sola cuando detectemos tu activación.</strong></p>
        </div>
      `,
      icon: 'warning',
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        this.intervaloVerificacion = setInterval(() => {
          this.usuarioService.getById(id).subscribe({
            next: (res: any) => {
              if (res.object && res.object.activacion === 1) {
                this.detenerHiloVerificacion();
                this.cuentaActivadaExitosamente = true; 

                Swal.close();

                Swal.fire({
                  title: '¡CUENTA ACTIVADA!',
                  text: 'Bienvenido al mundo Pokémon.',
                  icon: 'success',
                  timer: 2000,
                  showConfirmButton: false
                }).then(() => {
                  this.completarLogin(loginData);
                });
              }
            },
            error: () => {
              this.detenerHiloVerificacion();
              Swal.close();
            }
          });
        }, 3000);
      },
      willClose: () => {
        this.detenerHiloVerificacion();
        if (!this.cuentaActivadaExitosamente) {
          localStorage.clear();
        }
      }
    });
  }

  detenerHiloVerificacion() {
    if (this.intervaloVerificacion) {
      clearInterval(this.intervaloVerificacion);
    }
  }

  onRegister() {
    if (!this.regNombre || !this.regApellidoP || !this.regUsername || !this.regCorreo || !this.regPassword) {
      this.registerError = '¡Todos los campos obligatorios deben llenarse!';
      return;
    }
    this.registerError = '';
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
      activacion: 0 
    };

    this.usuarioService.usuarioAdd(nuevoUsuario).subscribe({
      next: (res: any) => {
        if (res.correct) {
          this.registerSuccess = true;
          this.isRegistering = false;
          this.resetForm();
          this.usuarioService.enviarBienvenida(nuevoUsuario.correo).subscribe();
        } else {
          this.isRegistering = false;
          this.registerError = res.errorMessage;
        }
      },
      error: () => { this.isRegistering = false; this.registerError = 'Error de servidor'; }
    });
  }

  resetForm() {
    this.regNombre = ''; this.regApellidoP = ''; this.regApellidoM = '';
    this.regUsername = ''; this.regCorreo = ''; this.regPassword = '';
    this.regConfirmPassword = ''; this.regImagen = '';
  }

  openRegisterModal() {
    this.registerError = '';
    this.registerSuccess = false;
    const modalElement = document.getElementById('registerModal');
    if (modalElement) new bootstrap.Modal(modalElement).show();
  }

  openRecoverModal() {
    this.recoverStep = 1;
    this.recoverCorreo = '';
    const modalElement = document.getElementById('recoverModal');
    if (modalElement) new bootstrap.Modal(modalElement).show();
  }

  enviarTokenRecuperacion() {
    if (!this.recoverCorreo) return;
    this.usuarioService.enviarValidacionPASS(this.recoverCorreo).subscribe({
      next: (res) => { if (res.correct) this.recoverStep = 2; }
    });
  }

  validarYCambiarPassword() {
    this.usuarioService.confirmarCodigo(this.recoverCorreo, this.recoverToken).subscribe({
      next: (resToken) => {
        if (resToken.correct) {
          this.usuarioService.actualizarPassword(this.recoverCorreo, this.recoverNewPassword).subscribe({
            next: (resPass) => {
              if (resPass.correct) {
                Swal.fire('¡Éxito!', 'Contraseña actualizada.', 'success');
                const modal = bootstrap.Modal.getInstance(document.getElementById('recoverModal'));
                if(modal) modal.hide();
              }
            }
          });
        }
      }
    });
  }

}

