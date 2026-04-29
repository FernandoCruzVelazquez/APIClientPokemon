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

    usuarioDelete(idusuario:number) : Observable<ResultModel<UsuarioModel>>{
        return this.http.delete<ResultModel<UsuarioModel>>(`${this.url}/deleteUsuario/${idusuario}`);
    }

}