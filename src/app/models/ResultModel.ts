export interface ResultModel<T>{
    correct : boolean,
    errorMessage : string,
    object : T,
    objects : T[]
}