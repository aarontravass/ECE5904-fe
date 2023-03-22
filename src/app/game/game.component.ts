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
}
@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
    @ViewChild('board') board: NgxChessBoardView | undefined;


    client_id: string = '';
    player_move = true;
    game_over = false;
    constructor(private readonly gameService: GameService, private ngxChessBoardService: NgxChessBoardService) { }

    async ngOnInit(): Promise<void> {
        await this.start_new_game();
    }
    bot_move_list: bot_move[] = [];

    async start_new_game() {
        this.board?.reset();
        this.game_over = false;
        this.player_move = true;
        this.client_id = '';
        await this.gameService.init().toPromise().then(res => {
            if (res?.status) {
                this.board?.setFEN(res.data.fen);
                this.client_id = res.data.client_id;
            }
        }).catch((error: HttpErrorResponse) => {

        })

    }

    async move(data: any) {
        console.log(data)
        if(data.color!="black") return;
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
                        if(!this.game_over){
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


    }

    async fetchBotMoves() {
        await this.gameService.fetch_bot_moves(this.client_id).toPromise()
            .then(res => {
                this.bot_move_list = [];
                if (res?.status) {
                    let i = 0;
                    this.bot_move_list.push({
                        ...res.data[i],
                        id: i++
                    });
                    this.bot_move_list.push({
                        ...res.data[i],
                        id: i++
                    })
                    this.bot_move_list.push({
                        ...res.data[i],
                        id: i++
                    })
                }
            }).catch((error: HttpErrorResponse) => {

            })
    }

  

}
