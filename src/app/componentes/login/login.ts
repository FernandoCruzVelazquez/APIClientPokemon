import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  username = '';
  password = '';
  errorMessage = '';
  logoutMessage = '';

  constructor(private authService: AuthService) { }

  onLogin() {
    this.authService.login(this.username, this.password)
      .subscribe({
        next: (res: any) => {
          console.log(res);
        },
        error: () => {
          this.errorMessage = 'Error de login';
        }
      });
  }
}