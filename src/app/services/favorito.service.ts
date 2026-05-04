import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResultModel } from '../models/ResultModel';

@Injectable({
  providedIn: 'root'
})
export class FavoritoService {

  private apiUrl = 'http://localhost:8081/api/favorito';

  constructor(private http: HttpClient) { }


  agregarFavorito(dto: any) {
    return this.http.post<ResultModel<any>>(this.apiUrl, dto);
  }

  getMisFavoritos(username: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${username}`);
  }

  eliminarFavorito(idUsuario: number, idPokemon: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}?idUsuario=${idUsuario}&idPokemon=${idPokemon}`);
  }
}