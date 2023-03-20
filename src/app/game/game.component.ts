import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MoveChange, NgxChessBoardView } from 'ngx-chess-board';
import { GameService } from '../services/game.service';
import {NgxChessBoardService} from 'ngx-chess-board';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
    @ViewChild('board', { static: false }) board: NgxChessBoardView | undefined;

    @Output() change = new EventEmitter();

    client_id: string | null = null;
    player_move = true;
    constructor(private readonly gameService: GameService, private ngxChessBoardService: NgxChessBoardService) { }

    ngOnInit(): void {
    }

    async start_new_game(){
        this.board?.reset();
        await this.gameService.init().toPromise().then(res=>{
            if(res?.status){
                this.board?.setFEN(res.data.fen);
                this.client_id = res.data.client_id;
            }
        })

    }

    logmove(data:any){
        console.log(data.move)
    }

}
