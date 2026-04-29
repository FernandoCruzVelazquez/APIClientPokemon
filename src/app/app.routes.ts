import { Routes } from '@angular/router';
import { LoaderComponent } from './componentes/loader/loader.component';
import { PokedexComponent } from './componentes/pokedex/pokedex.component';
import { LoginComponent } from './componentes/login/login.component';
import { LayoutComponent } from './componentes/layout/layout.component';
import { UsuarioGetAllComponent } from './componentes/usuario-get-all/usuario-get-all.component';

export const routes: Routes = [
  { path: '', component: LoaderComponent },

  { path: 'login', component: LoginComponent },

  // Lo que va dentro del path de layout es lo que se muestra debajo del layout
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'pokedex', component: PokedexComponent },
      {path: 'usuarios', component: UsuarioGetAllComponent},
    ]
  },
  //Si hay rutas que no existen los mandamos al login :p
  { path: '**', redirectTo: 'login' }
];
