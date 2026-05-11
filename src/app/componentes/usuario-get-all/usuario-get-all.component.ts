import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsuarioModel } from '../../models/UsuarioModel';
import { UsuarioService } from '../../services/usuario.service';
import { ResultModel } from '../../models/ResultModel';

@Component({
  selector: 'app-usuario-get-all',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './usuario-get-all.component.html',
  styleUrl: './usuario-get-all.component.css'
})
export class UsuarioGetAllComponent implements OnInit {

  public usuarios: UsuarioModel[] = [];
  public usuariosFiltrados: UsuarioModel[] = [];

  public filtros = {
    id: '',
    nombre: '',
    apellido: '',
    rol: ''
  };

  constructor(private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.GetAll();
  }

  filtrarUsuarios(): void {
    this.usuariosFiltrados = this.usuarios.filter(u => {
      const matchId = u.idusuario?.toString().includes(this.filtros.id);
      const matchNombre = u.nombreusuario?.toLowerCase().includes(this.filtros.nombre.toLowerCase());
      const matchApellido = u.apellidopaterno?.toLowerCase().includes(this.filtros.apellido.toLowerCase());
      const matchRol = u.rol?.nombrerol?.toLowerCase().includes(this.filtros.rol.toLowerCase());

      return matchId && matchNombre && matchApellido && matchRol;
    });
  }

  GetAll() {
    this.usuarioService.getAll().subscribe({
      next: (data: ResultModel<UsuarioModel>) => {
        if (data.correct) {
          this.usuarios = data.objects;
          this.filtrarUsuarios();
        } else {
          this.usuarios = [];
          this.usuariosFiltrados = [];
        }
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
      }
    });
  }

  toggleEstatus(usuario: UsuarioModel) {
      const enviandoActivacion = usuario.activacion === 0; 

      this.usuarioService.updateEstatus(usuario.correo, enviandoActivacion).subscribe({
        next: (res) => {
          if (res.correct) {
            usuario.activacion = enviandoActivacion ? 1 : 0;

            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2000
            });

            Toast.fire({
              icon: 'success',
              title: `Entrenador ${usuario.activacion === 1 ? 'Activado' : 'Desactivado'}`
            });
          }
        },
        error: () => {
          Swal.fire('Error', 'No se pudo sincronizar con la Pokédex', 'error');
          this.GetAll();
        }
      });
  }

  eliminarUsuario(idusuario: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción eliminará al entrenador de forma permanente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.usuarioDelete(idusuario).subscribe({
          next: (res) => {
            Swal.fire('Eliminado', 'El registro ha sido borrado.', 'success');
            this.GetAll(); 
          },
          error: () => {
            Swal.fire('Error', 'No se pudo completar la eliminación', 'error');
          }
        });
      }
    });
  }
}