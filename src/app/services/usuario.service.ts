import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioModel } from '../models/UsuarioModel';
import { ResultModel } from '../models/ResultModel';

@Injectable({
    providedIn: "root",
})

export class UsuarioService {
    private url : string = "http://localhost:8081/api/usuario";

    constructor(private http: HttpClient) { }


    getAll() : Observable<ResultModel<UsuarioModel>>{
        return this.http.get<ResultModel<UsuarioModel>>(this.url + "/usuarios");
    }

    getById(idusuario: number): Observable<ResultModel<UsuarioModel>> {
        return this.http.get<ResultModel<UsuarioModel>>(`${this.url + "/perfil"}/${idusuario}`);
    }

    usuarioDelete(idusuario:number) : Observable<ResultModel<UsuarioModel>>{
        return this.http.delete<ResultModel<UsuarioModel>>(`${this.url}/deleteUsuario/${idusuario}`);
    }

    usuarioAdd(usuario: Partial<UsuarioModel>): Observable<ResultModel<UsuarioModel>> {
    return this.http.post<ResultModel<UsuarioModel>>(this.url, usuario);
    }

    usuarioUpdate(usuario: UsuarioModel): Observable<ResultModel<UsuarioModel>> {
        return this.http.put<ResultModel<UsuarioModel>>(`${this.url}/update`, usuario);
    }

    enviarBienvenida(correo: string): Observable<ResultModel<any>> {
        return this.http.post<ResultModel<any>>(`${this.url}/bienvenida/${correo}`, {});
    }

    enviarValidacion(correo: string): Observable<ResultModel<any>> {
        return this.http.post<ResultModel<any>>(`${this.url}/enviar-validacion/${correo}`, {});
    }

    enviarValidacionPASS(correo: string): Observable<ResultModel<any>> {
        return this.http.post<ResultModel<any>>(`${this.url}/enviar-validacionPASS/${correo}`, {});
    }

    confirmarCodigo(correo: string, codigo: string): Observable<ResultModel<any>> {
        return this.http.post<ResultModel<any>>(`${this.url}/confirmar-codigo`, { correo, codigo });
    }

    confirmarCodigoPASS(correo: string, codigo: string): Observable<ResultModel<any>> {
        return this.http.post<ResultModel<any>>(`${this.url}/confirmar-codigo-pass`, { correo, codigo });
    }

    actualizarPassword(correo: string, password: string): Observable<ResultModel<any>> {
        return this.http.put<ResultModel<any>>(`${this.url}/updatePassword`, { correo, password });
    }

}