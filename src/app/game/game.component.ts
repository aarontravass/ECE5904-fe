import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MoveChange, NgxChessBoardView } from 'ngx-chess-board';
import { GameService } from '../services/game.service';
import { NgxChessBoardService } from 'ngx-chess-board';
import { HttpErrorResponse } from '@angular/common/http';

interface bot_move {
    player_name: string;
    move_gen: string;
    depth: number;
    id: number;
    time: number;
}
@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
    @ViewChild('board') board: NgxChessBoardView | undefined;
    time_constraint = true;

    client_id: string | null = '';
    player_move = true;
    game_over = false;
    cut_off_time: number = 0;
    constructor(private readonly gameService: GameService, private ngxChessBoardService: NgxChessBoardService) { }

    async ngOnInit(): Promise<void> {
        this.client_id = sessionStorage.getItem('client_id');
        if(!this.client_id) await this.start_new_game();
        else{
            this.player_move = false
            this.board?.setFEN((sessionStorage.getItem('fen') || ''));
        }

    }
    bot_move_list: bot_move[] = [];

    async start_new_game() {
        this.board?.reset();
        this.game_over = false;
        this.player_move = true;
        this.client_id = '';
        this.bot_move_list = [];
        await this.gameService.init(this.time_constraint).toPromise().then(res => {
            if (res?.status) {
                this.board?.setFEN(res.data.fen);
                this.client_id = res.data.client_id;
                sessionStorage.setItem('client_id', res.data.client_id);
                sessionStorage.setItem('fen', res.data.fen);
            }
        }).catch((error: HttpErrorResponse) => {

        })

    }

    async move(data: any) {
        console.log(data)
        if (data.color != "white") return;
        const move = data.move;
        await this.make_move(move);
    }
    async select_bot_move(id: number) {
        if (id < this.bot_move_list.length && id >= 0) {
            const move = this.bot_move_list[id].move_gen;
            await this.make_move(move);
        }
    }
    async make_move(move: string) {
        if (this.player_move) {
            await this.gameService.player_move(this.client_id, move).toPromise()
                .then(async res => {
                    if (res?.status) {
                        this.game_over = res.data.game_over;
                        if (!this.game_over) {
                            await this.fetchBotMoves();
                        }
                    }
                }).catch((error: HttpErrorResponse) => {

                })
        }
        else {
            await this.gameService.bot_move(this.client_id, move).toPromise()
                .then(res => {
                    if (res?.status) {
                        this.game_over = res.data.game_over;
                        this.bot_move_list = [];
                        this.board?.move(move);
                    }
                }).catch((error: HttpErrorResponse) => {

                })
        }
        this.player_move = !this.player_move;
        sessionStorage.setItem('fen', this.board?.getFEN() || '');

    }

    async fetchBotMoves() {
        await this.gameService.fetch_bot_moves(this.client_id).toPromise()
            .then(res => {
                this.bot_move_list = [];
                if (res?.status) {
                    let i = 0;
                    res.data.moves.forEach((el: any) => {
                        this.bot_move_list.push({
                            ...el,
                            id: i++
                        });
                    });
                    this.cut_off_time = res.data.cut_off_time;


                }
            }).catch((error: HttpErrorResponse) => {

            })
    }



}
