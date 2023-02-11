import React from "react";

export default function renderGameSettings() {
    return (
        <div
            className="panel"
            id="gamesettings">
            <div className="title">New Game Settings</div>
            <hr></hr>
            <div className="space-children v-spacer">
                <div>Board:</div>
                <div><select 
                    onChange={(e) => this.selectBoard(e.target.value)}>
                    {this.state.boards? this.state.boards.map((board, index)=>
                        <option key={index} value={board.id}>{board.name}</option>
                    ): null}
                </select></div>
            </div>
            <div className="space-children v-spacer">
                <div>Trade Cards Deck:</div>
                <div><select 
                    onChange={this.tradeDeckSelect}>
                    <option>Standard</option>
                </select></div>
            </div>
            <div className="space-children v-spacer">
                <div>Advancement Cards Deck:</div>
                <div><select 
                onChange={this.advDeckSelect}>
                    <option>Standard</option>
                </select></div>
            </div>
            <hr></hr>
            <div
                className="space-children v-spacer">
                <div 
                    className="button" 
                    onClick={this.toggleCivs}>
                    Change Civilizations
                </div>
                <div 
                    onClick={this.toggleGames}
                    className="button">
                    Change Games
                </div>
            </div>
            <div
                onClick={this.startGame}
                className="button v-spacer">
                Start Game
            </div>
        </div>
    )
};
