import React from "react"

function renderSelectedPalyer() {
    return (
        <div 
        className="panel" 
        id="selected">
            <div className="title">{this.state.selectedPlayer.username}</div>
            <div className="subtitle">{this.state.selectedPlayer.civ}</div>
            <hr></hr>
            <ul>
                <li>
                    <div
                    className='card'
                    onClick={this.toggleStats}
                    id="playerstats">
                        <div 
                        className='subtitle'>
                            - Stats -
                        </div>
                    </div>
                </li>
                <li>
                    <div
                    className='card'
                    onClick={this.toggleTradeCards}
                    id="playertradecards">
                        <div 
                        className='subtitle'>
                            - Trade Cards -
                        </div>
                    </div>
                </li>
                <li>
                    <div
                    className='card'
                    onClick={this.toggleAdvCards}
                    id='playeradvcards' >
                        <div 
                        className='subtitle'>
                            - Advancement Cards -
                        </div>
                    </div>
                </li>
                <li>
                    <div
                    className='card'
                    onClick={this.toggleHistory}
                    id='playerinfo' >
                        <div 
                        className='subtitle'>
                            - History -
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    );
};

export default renderSelectedPalyer