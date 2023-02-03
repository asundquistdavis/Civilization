import React from "react";

function renderHeader() {
    return (
        <div 
        className="header" 
        id="header">
            <div 
            className="left button"
            onClick={this.toggleInfo}>
                Info
            </div>
            <div
            className="right button"
            onClick={this.toggleSettings}>
                Settings
            </div>
            <div>
                <div className="title">MegaCivilization</div>
                <div className="subtitle">Online</div>
            </div>
        </div>
    );
};

export default renderHeader;
