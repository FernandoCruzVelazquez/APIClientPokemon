import { Routes } from '@angular/router';
import { LoaderComponent } from './componentes/loader/loader.component';
import { PokedexComponent } from './componentes/pokedex/pokedex.component';

import { LoginComponent } from './componentes/login/login.component';


export const routes: Routes = [
  { path: '', component: LoaderComponent },   
  { path: 'login', component: LoginComponent },
  { path: 'pokedex', component: PokedexComponent },
];

