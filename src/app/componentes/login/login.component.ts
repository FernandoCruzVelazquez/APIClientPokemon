import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service'; 
import { Router } from '@angular/router';
import { UsuarioModel } from '../../models/UsuarioModel'; 

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

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService, 
    private router: Router
  ) {}

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
    if (this.regPassword !== this.regConfirmPassword) {
      this.registerError = '¡Las contraseñas no coinciden, Entrenador!';
      return; 
    }

    this.registerError = '';
    this.registerSuccess = false;
    this.isRegistering = true;

    const nuevoUsuario: UsuarioModel = {
      idusuario: 0,
      nombreusuario: this.regNombre,
      apellidopaterno: this.regApellidoP,
      apellidomaterno: this.regApellidoM,
      username: this.regUsername,
      correo: this.regCorreo,
      password: this.regPassword,
      imagen: this.regImagen || 'default.png',
      rol: { idrol: this.regRolId } as any
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
            this.registerError = 'Error en el servidor al registrar usuario';
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
  
}