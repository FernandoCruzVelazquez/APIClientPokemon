import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

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
  logoutMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    this.authService.login(this.username, this.password)
      .subscribe({
        next: (res: any) => {
          console.log('LOGIN OK', res);
          
          localStorage.setItem('token', res.token);
          localStorage.setItem('username', this.username); 

          this.router.navigate(['/pokedex']);
        },
        error: () => {
          this.errorMessage = 'Error de login';
        }
      });
  }
}