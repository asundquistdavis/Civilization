import React from "react";

function renderPlayers() {

    const orderedPlayers = this.state.players? this.state.players.sort((a, b) => this.orderPlayers(a, b, this.state.playersOrder)): null

    return (
        <div 
        className="panel" 
        id="players">
            <div className="title">Players</div>
            <div className="subtitle">
                <select onChange={this.selectNewOrder}>
                    <option value="census">By Census Order</option>
                    <option value="points">By Victory Points</option>
                </select>
            </div>
            <hr></hr>
            <div>
                    {this.state.players? orderedPlayers.map((player, index)=>(
                    <div 
                    key={index}
                    className={this.activePlayer}>
                        {this.renderPlayerCard(player)}
                    </div>
                    )): null}
            </div>
        </div>
    );
};

export default renderPlayers;
