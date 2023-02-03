import React from 'react';

export default function renderInfo() {

    return(
        <div
        className='modal'>
            <div className='modal-content'>
                <div className='modal-header'>                
                    <div 
                    className="title" >
                        Info
                    </div>
                    <div                
                    className='close subtitle close'
                    onClick={this.toggleInfo}>
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
