import React from "react";

export default function renderGames() {

    return (
        <div
        className='modal'>
            <div className='modal-content'>
                <div className='modal-header'>                
                    <div 
                    className="title" >
                        Games
                    </div>
                    <div                
                    className='close subtitle close'
                    onClick={this.toggleGames}>
                        {this.state.xChar}
                    </div>
                </div>
                <hr></hr> 
                <div
                className='modal-body'>
                    <ul>       
                        {this.state.games? (
                            this.state.games.map((game, index) => {
                                return (
                                    <div
                                    key={index}
                                    style={{backgroundColor: '#ced4da'}}
                                    className="card"
                                    onClick={() => {this.selectGame(game.id); this.toggleGames();}}>
                                        <div className="title">{game.name}</div>
                                        <div className="subtitle">Host: {game.host}</div>
                                    </div>
                                )
                            })
                        ): null}
                    </ul>
                </div>
            </div>
        </div>
    );
};