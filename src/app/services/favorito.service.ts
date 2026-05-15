import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResultModel } from '../models/ResultModel';

@Injectable({
  providedIn: 'root'
})
export class FavoritoService {

  private readonly IP = 'localhost';
  private readonly PORT = '8081';

  private get apiUrl(): string {
    return `http://${this.IP}:${this.PORT}/api/favorito`;
  }

  constructor(private http: HttpClient) { }


  agregarFavorito(dto: any): Observable<ResultModel<any>> {
    return this.http.post<ResultModel<any>>(this.apiUrl, dto);
  }

  getMisFavoritos(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${username}`);
  }

  eliminarFavorito(idUsuario: number, idPokemon: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}?idUsuario=${idUsuario}&idPokemon=${idPokemon}`);
  }
}