import { Routes } from '@angular/router';
import { LoaderComponent } from './componentes/loader/loader.component';
import { PokedexComponent } from './componentes/pokedex/pokedex.component';
import { LoginComponent } from './componentes/login/login.component';
import { LayoutComponent } from './componentes/layout/layout.component';
import { DetallePokemonComponent } from './componentes/detalle-pokemon/detalle-pokemon.component';
import { UsuarioGetAllComponent } from './componentes/usuario-get-all/usuario-get-all.component';
import { UsuarioPerfilComponent } from './componentes/usuario-perfil/usuario-perfil.component';
import { FavoritoComponent } from './componentes/favorito/favorito.component';
import { UsuarioDetalleComponent } from './componentes/usuario-detalle/usuario-detalle.component';
import { ActivacionExitosaComponent } from './componentes/activacion-exitosa/activacion-exitosa.component';


export const routes: Routes = [

  { path: 'activacion-exitosa', component: ActivacionExitosaComponent },

  { path: '', component: LoaderComponent, pathMatch: 'full' },
  
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'pokedex', component: PokedexComponent },
      { path: 'usuarios', component: UsuarioGetAllComponent },
      { path: 'perfil', component: UsuarioPerfilComponent },
      { path: 'perfil/:id', component: UsuarioPerfilComponent },
      { path: 'favoritos', component: FavoritoComponent },
      { path: 'perfil-detalle/:id', component: UsuarioDetalleComponent },
      { path: 'pokemon/:id', component: DetallePokemonComponent }
    ]
  },

  { path: '**', redirectTo: 'login' }
];