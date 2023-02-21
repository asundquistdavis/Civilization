import React from "react"

function renderSelectedPalyer() {
    return (
        <div 
        className="panel">
            <div className="selected-player">
                <div className="title">{this.cap(this.state.selectedPlayer.username)}</div>
                <div className="subtitle">{this.cap(this.state.selectedPlayer.civ)}</div>
            </div>
            <hr></hr>
            <div
            className='card selected-players'
            onClick={this.toggleStats}>
                <div 
                className='subtitle'>
                    - Stats -
                </div>
            </div>
            <div
            className='card selected-players'
            onClick={this.toggleTradeCards}>
                <div className="space-children">
                    <div className="trade-cards">
                        <div
                        className="trade-card">
                            {this.renderTradeCardBack()}
                        </div>

                    </div>
                    <div className="space-vertically">
                        <div className="title">{this.state.selectedPlayer.tradeCards.length}</div>
                        <div className="subtitle">Trade cards</div>
                    </div>
                </div>
            </div>
            <div
            className='card selected-players'
            onClick={this.toggleAdvCards}>
                <div 
                className='subtitle'>
                    - Advancement Cards -
                </div>
            </div>
            <div
            className='card selected-players'
            onClick={this.toggleHistory}>
                <div 
                className='subtitle'>
                    - History -
                </div>
            </div>
        </div>
    );
};

export default renderSelectedPalyer