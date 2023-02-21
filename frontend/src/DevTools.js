import React from "react";

export default function renderDevTools() {
    return (
        <div
        className="panel space-children">
            <div
            className="button"
            onClick={this.testMovement}>
                Test Movement
            </div>
            <div
            className="button"
            onClick={() => console.log(this.state.stagedMoves)}>
                Log 'stagedMoves'
            </div>
        </div>
    )
};