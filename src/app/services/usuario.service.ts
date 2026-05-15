import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioModel } from '../models/UsuarioModel';
import { ResultModel } from '../models/ResultModel';

@Injectable({
    providedIn: "root",
})
export class UsuarioService {

    private readonly IP = '192.167.0.79';
    private readonly PORT = '8081';
    
    private get baseUrl(): string {
        return `http://${this.IP}:${this.PORT}/api/usuario`;
    }

    constructor(private http: HttpClient) { }

    getAll(): Observable<ResultModel<UsuarioModel>> {
        return this.http.get<ResultModel<UsuarioModel>>(`${this.baseUrl}/usuarios`);
    }

    getById(idusuario: number): Observable<ResultModel<UsuarioModel>> {
        return this.http.get<ResultModel<UsuarioModel>>(`${this.baseUrl}/perfil/${idusuario}`);
    }

    usuarioDelete(idusuario: number): Observable<ResultModel<UsuarioModel>> {
        return this.http.delete<ResultModel<UsuarioModel>>(`${this.baseUrl}/deleteUsuario/${idusuario}`);
    }

    usuarioAdd(usuario: Partial<UsuarioModel>): Observable<ResultModel<UsuarioModel>> {
        return this.http.post<ResultModel<UsuarioModel>>(this.baseUrl, usuario);
    }

    usuarioUpdate(usuario: UsuarioModel): Observable<ResultModel<UsuarioModel>> {
        return this.http.put<ResultModel<UsuarioModel>>(`${this.baseUrl}/update`, usuario);
    }

    enviarBienvenida(correo: string): Observable<ResultModel<any>> {
        return this.http.post<ResultModel<any>>(`${this.baseUrl}/bienvenida/${correo}`, {});
    }

    enviarValidacionPASS(correo: string): Observable<ResultModel<any>> {
        return this.http.post<ResultModel<any>>(`${this.baseUrl}/enviar-validacionPASS/${correo}`, {});
    }

    confirmarCodigo(correo: string, codigo: string): Observable<ResultModel<any>> {
        return this.http.post<ResultModel<any>>(`${this.baseUrl}/confirmar-codigo`, { correo, codigo });
    }

    confirmarCodigoPASS(correo: string, codigo: string): Observable<ResultModel<any>> {
        return this.http.post<ResultModel<any>>(`${this.baseUrl}/confirmar-codigo-pass`, { correo, codigo });
    }

    actualizarPassword(correo: string, password: string): Observable<ResultModel<any>> {
        return this.http.put<ResultModel<any>>(`${this.baseUrl}/updatePassword`, { correo, password });
    }

    updateEstatus(correo: string, estatus: boolean): Observable<ResultModel<any>> {
        return this.http.put<ResultModel<any>>(`${this.baseUrl}/cambiar-estatus`, { correo, estatus });
    }

    resetPassword(correo: string, nuevaPass: string): Observable<ResultModel<any>> {
        return this.http.put<ResultModel<any>>(`${this.baseUrl}/reset-password`, { correo, password: nuevaPass });
    }

    enviarValidacion(correo: string): Observable<ResultModel<any>> {
        return this.http.post<ResultModel<any>>(`${this.baseUrl}/enviar-enlace-validacion/${correo}`, {});
    }

}