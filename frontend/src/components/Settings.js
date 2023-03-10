import React from 'react';

export default function renderSettings() {

    return(
        <div
        className='modal'>
            <div className='modal-content'>
                <div className='modal-header'>                
                    <div 
                    className="title" >
                        Settings
                    </div>
                    <div className='close subtitle' onClick={this.toggleSettings}>
                        {this.state.xChar}
                    </div>
                </div>
                <hr></hr>
                <div
                className='modal-body tester'>      
                    {this.renderTradeCardBack()}
                </div>
            </div>
        </div>
    );
};