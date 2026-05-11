import { RolModel } from "./RolModel";

export interface UsuarioModel{
    idusuario : number;
    nombreusuario : string;
    apellidopaterno : string;
    apellidomaterno : string;
    username : string;
    correo : string;
    password : string;
    imagen : string;
    rol :RolModel;
    activacion :number;
}