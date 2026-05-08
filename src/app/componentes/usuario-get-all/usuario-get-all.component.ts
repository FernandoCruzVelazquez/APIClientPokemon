import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { UsuarioModel } from '../../models/UsuarioModel';
import { UsuarioService } from '../../services/usuario.service';
import { ResultModel } from '../../models/ResultModel';

@Component({
  selector: 'app-usuario-get-all',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './usuario-get-all.component.html',
  styleUrl: './usuario-get-all.component.css'
})
export class UsuarioGetAllComponent implements OnInit {

  public usuarios: UsuarioModel[] = [];

  constructor(private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.GetAll();
  }

  eliminarUsuario(idusuario: number) {

    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.usuarioDelete(idusuario).subscribe({
          next: () => {
            Swal.fire(
              'Eliminado',
              'El usuario ha sido eliminado correctamente',
              'success'
            );
            this.GetAll();
          },
          error: () => {
            Swal.fire(
              'Error',
              'No se puede eliminar el usuario',
              'error'
            );
          }
        });
      }

    });
  }

  GetAll() {

    this.usuarioService.getAll().subscribe({
      next: (data: ResultModel<UsuarioModel>) => {
        if (data.correct) {
          this.usuarios = data.objects;
        } else {
          this.usuarios = [];
        }
      },
      error: () => {
        Swal.fire(
          'Error',
          'No se pudieron cargar los usuarios',
          'error'
        )
      }
    });
  }
}
