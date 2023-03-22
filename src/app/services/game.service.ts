import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { API_URL } from "../globals";
import { ResponseModel } from "../models/util.model";

@Injectable({
    providedIn: 'root'
})
export class GameService {

    constructor(private readonly http: HttpClient) { }

    private handleError(error: HttpErrorResponse) {
        return throwError(error);
    }

    init(): Observable<ResponseModel> {
        return this.http
            .get<ResponseModel>(API_URL + 'api/v1/game/new')
            .pipe(catchError(this.handleError));
    }

    player_move(client_id: string, move: string): Observable<ResponseModel> {
        return this.http.put<ResponseModel>(API_URL + "api/v1/game/player/move", { client_id, move })
            .pipe(catchError(this.handleError));
    }

    fetch_bot_moves(client_id: string): Observable<ResponseModel> {
        return this.http.post<ResponseModel>(API_URL + "api/v1/game/bot/moves/fetch", { client_id })
            .pipe(catchError(this.handleError));
    }

    bot_move(client_id: string, move: string): Observable<ResponseModel> {
        return this.http.put<ResponseModel>(API_URL + "api/v1/game/bot/move", { client_id, move })
            .pipe(catchError(this.handleError));
    }
}