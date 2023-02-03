import React from 'react';

export default function renderTradeCards() {

    return(
        <div
        className='modal'>
            <div className='modal-content'>
                <div className='modal-header'>                
                    <div 
                    className="title" >
                        Trade Cards
                    </div>
                    <div                
                    className='close subtitle close'
                    onClick={this.toggleTradeCards}>
                        {this.state.xChar}
                    </div>
                </div>
                <hr></hr>
                <div
                className='modal-body'>            

                </div>
            </div>
        </div>
    );
};