import React from "react";

function renderPlayerCard(player) {
    
    const infoType = this.state.infoType
    let info = player.points
    switch (infoType) {
        case 'trade cards':
            info = player.tradeCards? player.tradeCards.length: 0;
            break;
        case 'census': 
            info = player.census
            break;
        default:
            info =player.points
    };

    return (
        <div
        className="card playercard"
        style={{backgroundColor: player.pcolor}}
        onClick={() => this.selectNewPlayer(player)}>
            <span>
                <div className="playerleft">
                    <div className="name">{player.username}</div>
                    <div className="civ">{player.civ}</div>
                </div>
                <div className="playerright">
                    <div className='info'>{info}</div>
                    <div className='infotype'>{infoType}</div>
                </div>
            </span>
        </div>
    )
};

export default renderPlayerCard;