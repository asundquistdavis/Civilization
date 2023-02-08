import React from "react";

export default function renderCivs() {
    return(
        <div
        className='modal'>
            <div className='modal-content'>
                <div className='modal-header'>                
                    <div 
                    className="title" >
                        Civilizations
                    </div>
                    <div                
                    className='close subtitle close'
                    onClick={this.toggleCivs}>
                        {this.state.xChar}
                    </div>
                </div>
                <hr></hr> 
                <div
                className='modal-body'>
                    <ul>       
                        {this.state.civs? this.state.civs.map((civ, index)=>{
                            const player = this.state.players.filter(player=>player.civ===civ.name)
                            return (
                                <div
                                    className="card"
                                    key={index}
                                    onClick={() => this.selectCiv(civ.id)}
                                    style={{backgroundColor: civ.pcolor}}>
                                        <div className="title">{civ.name}</div>
                                        <div className="subtitle">{player.length? player[0].username: null}</div>
                                </div>
                            )
                        }): null}
                    </ul>
                </div>
            </div>
        </div>
    );
}
