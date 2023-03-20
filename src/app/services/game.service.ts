import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { API_URL } from "../globals";
import { ResponseModel } from "../models/util.model";

@Injectable({
    providedIn: 'root'
})
export class GameService{
  
    constructor(private readonly http: HttpClient) {}

    private handleError(error: HttpErrorResponse) {
        return throwError(error);
    }

    init(): Observable<ResponseModel> {
        return this.http
            .get<ResponseModel>(API_URL + 'v1/game/new')
            .pipe(catchError(this.handleError));
    }
}