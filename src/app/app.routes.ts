import { Routes } from '@angular/router';
import { LoaderComponent } from './componentes/loader/loader.component';
import { PokedexComponent } from './componentes/pokedex/pokedex.component';


export const routes: Routes = [
    { path: '', component: LoaderComponent },
    { path: 'pokedex', component: PokedexComponent }
];
