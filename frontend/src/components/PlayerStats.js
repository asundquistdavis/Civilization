import React from 'react';

export default function renderPlayerStats(player) {

    return(
        <div
        className='modal'>
            <div className='modal-content'>
                <div className='modal-header'>                
                    <div 
                    className="title" >
                        Stats
                    </div>
                    <div                
                    className='close subtitle close'
                    onClick={this.toggleStats}>
                        {this.state.xChar}
                    </div>
                </div>
                <hr></hr>
                <div
                className='modal-body'>            
                    <ul>
                        <li>AST Rank:  <span className='right'>{player.astRank}</span></li>
                        <li>Census:  <span className='right'>{player.census}</span></li>
                        <li>Movement Order:  <span className='right'>{player.movementOrder}</span></li>
                        <li>Stock:  <span className='right'>{player.stock}</span></li>
                        <li>Treasury:  <span className='right'>{player.treasury}</span></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};