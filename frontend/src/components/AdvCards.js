import React from 'react';

export default function renderAdvCards() {

    return(
        <div
        className='modal'>
            <div className='modal-content'>
                <div className='modal-header'>                
                    <div 
                    className="title" >
                        Advancment Cards
                    </div>
                    <div                
                    className='close subtitle close'
                    onClick={this.toggleAdvCards}>
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