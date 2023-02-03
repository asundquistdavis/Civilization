import React from 'react';

export default function renderHistory() {

    return(
        <div
        className='modal'>
            <div className='modal-content'>
                <div className='modal-header'>                
                    <div 
                    className="title" >
                        History
                    </div>
                    <div                
                    className='close subtitle close'
                    onClick={this.toggleHistory}>
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