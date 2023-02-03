import React from "react";

function renderPlayers() {
    const orderedPlayers = this.state.players.sort((a, b) => this.orderPlayers(a, b, this.state.playersOrder))

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
                <ul>
                    {orderedPlayers.map((player, index)=>(
                    <li key={index}>
                    {this.renderPlayerCard(player)}
                    </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default renderPlayers;
