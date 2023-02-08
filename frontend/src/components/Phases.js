import React from "react";

export default function renderPhases() {

    if (this.state.phase === 'pre game') {
        return (
            <div
                className="phases over-board">
                <div
                    className="highlight phase">
                        Pre Game Lobby
                </div>
            </div>
        )
    }else{
        return (
            <div 
                className="phases over-board">
                <div 
                    className={(this.state.phase==='start of turn')? 'highlight phase': 'phase'}>
                    Start of Turn
                </div>
                <div 
                    className={(this.state.phase==='movement')? 'highlight phase': 'phase'}>
                    Movement
                </div>
                <div 
                    className={(this.state.phase==='trade')? 'highlight phase': 'phase'}>
                    Trade
                </div>
                <div 
                    className={(this.state.phase==='end of turn')? 'highlight phase': 'phase'}>
                    End of Turn
                </div>
            </div>
        );
    };
};
