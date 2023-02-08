import React from "react";

function renderPlayerCard(player) {
    
    const phase = this.state.phase
    let infoType = 'Points'
    let info = player.points;
    switch (phase) {
        case 'start of game':
            infoType = player.backTax? 'Revolting!': 'units';
            info = player.backTax? '': player.census;
            break;
        case 'movement': 
            infoType = 'units';
            info = player.census;
            break;
        case 'trade':
            info = player.tradeCards? player.tradeCards.length: 0;
            infoType = 'Trade Cards';
            break;
        default:
            info = player.points;
            infoType = 'Points';
            break;
    };

    return (
        <div
        className="card playercard"
        style={{backgroundColor: player.pcolor}}
        onClick={() => {this.selectNewPlayer(player); this.state.phase==='pre game'? this.toggleCivs(): null}}>
            <span>
                <div className="playerleft">
                    <div className="name">{this.cap(player.username)}</div>
                    <div className="civ">{player.civ? this.cap(player.civ): 'No Civilization Selected'}</div>
                </div>
                {phase==='pre game'? (null):
                    <div className="playerright">
                        <div className='info'>{info}</div>
                        <div className='infotype'>{infoType}</div>
                    </div>
                }
            </span>
        </div>
    )
};

export default renderPlayerCard;