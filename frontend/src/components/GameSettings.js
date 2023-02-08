import React from "react";

export default function renderGameSettings() {
    return (
        <div
            className="panel"
            id="gamesettings">
            <div className="title">New Game Settings</div>
            <hr></hr>
            <ul className="settings">
                <li>
                    <div className="settingsname">Board:</div>
                    <select onChange={(e) => this.selectBoard(e.target)}>
                        {this.state.boards? this.state.boards.map((board, index)=>
                            <option key={index} value={board.id}>{board.name}</option>
                        ): null}
                    </select>
                </li>
                <li>
                    <div className="settingsname"><button onClick={this.toggleCivs}>View Civilizations</button></div>
                </li>
                <li>
                    <div className="settingsname">Trade Cards Deck:</div>
                    <select onChange={this.tradeDeckSelect}>
                        <option>Standard</option>
                    </select>
                </li>
                <li>
                    <div className="settingsname">Advancement Cards Deck:</div>
                    <select onChange={this.advDeckSelect}>
                        <option>Standard</option>
                    </select>
                </li>
            </ul>
            <hr></hr>
            <div
            className="buttons-side">
                <div 
                    onClick={this.startGame}
                    className="startgame">
                    Start Game
                </div>
                <div 
                    onClick={this.toggleGames}
                    className="startgame">
                    View Games
                </div>
            </div>
        </div>
    )
};
