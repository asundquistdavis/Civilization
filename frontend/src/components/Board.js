import { latLng, latLngBounds } from "leaflet";
import React from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";

const highight = {
    weight: 5,
    color: '#666666',
    dashArray: '',
    fillOpacity: 0.3,
    fillColor: '#eece31'
};

const adjacentHighlight = {
    weight: 5,
    color: '#07137d',
    dashArray: '',
    fillOpacity: .5,
    fillColor: '#eece31'
};

const selectedHighlight = {
    weight: 10,
    color: '#07137d',
    dashArray: '',
    fillOpacity: 1,
    fillColor: '#eece31'
};

async function selectTerritory(event) {
    const board = this.board.current;
    const layer = event.target;
    const territory = layer.feature.properties;
    const currentTerritoryId = this.state.selectedTerritoryA? this.state.selectedTerritoryA.id: null;
    const isAdjacent = currentTerritoryId? this.state.selectedTerritoryA.adjacent.includes(territory.id): false;
    const isLand = territory.type === 'land';
    const hasBoat = false;
    const isValid = isAdjacent & (isLand || hasBoat);
    const unitsToMove = this.state.unitsToMove;

    // if player is already moving, show ter. card B with selected ter/layer
    if (currentTerritoryId === territory.id) { 
        return null
    } else if (unitsToMove > 0 & isValid) {
        await this.setState({
            // sets ter./layer to current selection
            selectedTerritoryB: territory,
            selectedlayerB: layer,
        });
    // otherwise, player has not started move, or is just looking at territories so show ter. card A with selected ter./layer
    } else {
        await this.setState({
            // showTerritoryCardA: true,
            // sets ter./layer to current selection
            selectedTerritoryA: territory,
            selectedLayerA: layer, 
            unitsToMove: 0,
            selectedlayerB: null,
            selectedTerritoryB: null,
        });
        // 
        board.fitBounds(layer.getBounds());
    };
};

const colorBySupport = (support) => {
    return false? null:
    support === 0? '#ff0000':
    support === 1? '#fd7e14':
    support === 2? '#fab005':
    support === 3? '#82c91e':
    support === 4? '#589a08':
    '#ced4da'
};

export const renderLoginRequired = () => {
    return (
        <div
            id="board"
            className="no-board">
            <a className="login" href='/login/'>
                Login Here
            </a>
        </div>
    );
};

export const renderNoBoard = () => {
    return (
        <div
            id="board"
            className="no-board">
                No board selected
        </div>
    );
};

export function renderTerritoryCardA() {
    
    const territory = this.state.selectedTerritoryA

    if (territory) {

        const players = this.state.players

        var cityColor = null;
        if (territory.hasCityCite) {
            if (territory.players.filter(player => player.hasCity).length > 0 ) {
                const playerId = territory.players.filter(player => player.hasCity)[0].playerId;
                cityColor = (players.length > 0? this.state.players.filter(player => player.id === playerId)[0].pcolor: null);
            };
        };

        var supportColor = colorBySupport(territory.support);

        return (
            <div
            className="card territory-card ter-card-a over-board">
                <div className="seperate-children territory-card-header">
                    <div className="territory-card-title">{territory.name}</div>
                    <div className="right-children territory-card-tokens">
                        {territory.type === 'land'? <div className="support-token token" style={{backgroundColor: supportColor}}>{territory.support}</div>: null}
                        {territory.hasCityCite? <div className="city-token token" style={{backgroundColor: cityColor}}></div>: null}
                    </div>
                </div>
                <hr></hr>
                <div
                className="territory-units">
                    {territory.players.map((player, index) => {
                        const playerId = player.playerId;
                        const playerColor = this.state.players.filter(player => player.id === playerId)[0].pcolor;
                        const unitsHere = this.calcUnits(territory.id, playerId)
                        return (unitsHere?
                            <div
                            key={index}
                            className="units-token"
                            style={{backgroundColor: playerColor}}>
                                {unitsHere}
                            </div>: null
                        );
                    })}
                    {players.map((player, index) => {
                        const playerId = player.id;
                        const playerColor = player.pcolor;
                        const unitsComing = this.calcUnits(territory.id, playerId, true)
                        return (unitsComing?
                            <div
                            key={index}
                            className="units-token"
                            style={{backgroundColor: playerColor}}>
                                <div className="coming">+</div>
                                {unitsComing}
                            </div>: null)
                    })}
                </div>
            </div>
        );
    };
    return null;
};

export function renderOverBoardAction() {

    const territoryFrom = this.state.selectedTerritoryA;

    if (territoryFrom) {
        const territoryTo = this.state.selectedTerritoryB;
        const players = territoryFrom.players;
        const playerId = this.state.playerId;
        const hasUnits = players.length > 0? players.filter(player => player.playerId === playerId).length > 0: false
        const currentUnits = hasUnits? players.filter(player => player.playerId === playerId)[0].units: 0;  
        const isActive = this.state.isActivePlayer;
        const isMovement = this.state.phase === 'movement';
        const canMove = isMovement? isActive: false;

        function changeUnits(amount) {
            const target = this.state.unitsToMove + amount;
            this.setState({unitsToMove: target < 0? 0: target > currentUnits? currentUnits: target});
        };

        function cancelMove() {
            this.setState({
                selectedlayerB: null,
                selectedTerritoryB: null,
                unitsToMove: 0,
            });
        };

        function submitMove() {
            const move = {
                territoryToId: territoryTo.id,
                territoryFromId: territoryFrom.id,
                units: this.state.unitsToMove,
                playerId: this.state.playerId
            };
            this.setState({
                stagedMoves: this.state.stagedMoves.concat(move),
                // selectedLayerA: null,
                // selectedTerritoryA: null,
                selectedlayerB: null,
                selectedTerritoryB: null,
                unitsToMove: 0,
            });
        };

        return (canMove & hasUnits)? (
            <div
            className="over-board action-position ">
                 {territoryTo? 
                    <div
                    className="card action space-vertically">
                        <div
                       className="space-children">
                            {/* x to cancel move */}
                            <div 
                            className="button button-action" 
                            style={{backgroundColor: 'red'}} 
                            onClick={() => cancelMove.bind(this)()}>
                                {'\u2716'}
                            </div>
                            {/* units token displaying units to move */}
                            <div 
                            className="units-token" 
                            style={{backgroundColor: this.state.players.filter(player=>player.id===this.state.playerId)[0].pcolor}}>
                                {this.state.unitsToMove}
                            </div>
                            {/* check to submit move */}
                            <div 
                            className="button button-action"
                            style={{backgroundColor: 'green'}}
                             onClick={() => submitMove.bind(this)()}>
                                {'\u2714'}
                            </div>
                       </div>
                    </div>:
                    <div
                    className="card action space-vertically">
                        <div
                       className="space-children">
                            {/* left arrow to decrement */}
                            <div
                            className="button button-action"
                            onClick={() => changeUnits.bind(this)(-1)}>
                                {'\u21A9'}
                            </div>
                            {/* display how many units to move */}
                            <div className="units-token token"
                            style={{backgroundColor: this.state.players.filter(player=>player.id===this.state.playerId)[0].pcolor}}>
                                {this.state.unitsToMove}
                            </div>  
                            {/* right arrow to increment */}
                            <div
                            className="button button-action" 
                            onClick={() => changeUnits.bind(this)(1)}>
                                {'\u21AA'}
                            </div>
                       </div>
                    </div>
                }
            </div>
        ): null
    };
};

export function renderTerritoryCardB()  {
    const territory = this.state.selectedTerritoryB
    const isActive = this.state.isActivePlayer;
    const isMovement = this.state.phase === 'movement';
    const canMove = isMovement? isActive: false;
    const unitsToMove = this.state.unitsToMove;

    if (territory) {

        var cityColor = null;
        if (territory.hasCityCite) {
            if (territory.players.filter(player => player.hasCity).length > 0 ) {
                const playerId = territory.players.filter(player => player.hasCity)[0].playerId
                cityColor = (this.state.players.length > 0? this.state.players.filter(player => player.id === playerId)[0].pcolor: null)
            };
        };

        var supportColor = colorBySupport(territory.support);

        return (
            <div
            className="card territory-card ter-card-b over-board">
                <div className="seperate-children territory-card-header">
                    <div className="territory-card-title">{territory.name}</div>
                    <div className="right-children territory-card-tokens">
                        {territory.type === 'land'? <div className="support-token token" style={{backgroundColor: supportColor}}>{territory.support}</div>: null}
                        {territory.hasCityCite? <div className="city-token token" style={{backgroundColor: cityColor}}></div>: null}
                    </div>
                </div>
                <hr></hr>
                <div
                className="territory-units">
                    {territory.players.map((player, index) => {
                        const playerId = player.playerId;
                        const playerColor = this.state.players.filter(player => player.id === playerId)[0].pcolor;
                        return (
                            <div
                            key={index}
                            className="units-token token"
                            style={{backgroundColor: playerColor}}>
                                {player.units}
                            </div>
                        );
                    })}
                </div>
            </div>
        )
    };
    return null;

};

export function renderBoard() {

    const colorTerritory = (properties) => {
        switch (properties.type) {
            case 'land':
                return '#faf9ff'
            case 'water':
                return 'blue'
            case 'ocean':
                return '#07137d'
            default:
                return '#ced4da'
        }
    };
    
    const drawTerritories = (feature) => {
        
        const isSelectedTerritory = this.state.selectedTerritoryA? (this.state.selectedTerritoryA.id === feature.properties.id): false;
        const isSelectedAdjacent = this.state.selectedTerritoryA? this.state.selectedTerritoryA.adjacent.includes(feature.properties.id): false;
        const isLand = feature.properties.type === 'land';
        const hasBoat = false;
        const isValid = isSelectedAdjacent & (isLand || hasBoat);

        if (isValid) {
            return adjacentHighlight
        } else if (isSelectedTerritory) {
            return selectedHighlight
        } else {
            return {
                fillColor: colorTerritory(feature.properties),
                fillOpacity: 0.2,
                weight: 3,
                opacity: 1,
                color: 'black'
            };
        };
    };
    
    selectTerritory = selectTerritory.bind(this);
    
    const highlightTerritory = (event) => {
        if (!this.state.selectedTerritoryALayer || this.state.selectedTerritoryALayer._leaflet_id !== event.target._leaflet_id) {
            event.target.setStyle(highight);
        };
    };

    const resetTerritory = (event) => {
        const territoryId = event.target.feature.properties.id;
        const isSelectedAdjacent = this.state.selectedTerritoryA? this.state.selectedTerritoryA.adjacent.includes(territoryId): false;
        const isSelectedTerritory = this.state.selectedTerritoryA? this.state.selectedTerritoryA.id === territoryId: false;
        const isLand = event.target.feature.properties.type === 'land';
        const hasBoat = false;
        const isValid = isSelectedAdjacent & (isLand || hasBoat);

        if (isValid) {
            event.target.setStyle(adjacentHighlight);
        } else if (isSelectedTerritory) {
            event.target.setStyle(selectedHighlight);
        } else {
            this.territories.current.resetStyle(event.target);
        };
    };
    
    const onEachTerritory = (feature, layer) => {
        layer.on({
            mouseover: highlightTerritory,
            mouseout: resetTerritory,
            click: selectTerritory
        })
    };

    const geojson = {
        type: "FeatureCollection",
        features: this.state.territories.map(territory => {
            return {
                type: "Feature",
                properties: {
                    id: territory.id,
                    name: territory.name,
                    type: territory.type,
                    support: territory.support,
                    adjacent: territory.adjacent,
                    hasCityCite: territory.hasCityCite,
                    players: territory.players
                },
                geometry: territory.geometry
            };
        })
    };

    const mapBounds = latLngBounds(...this.state.board.map(coor => latLng([coor[1], coor[0]])));
    
    return (
        <MapContainer 
            ref={this.board}
            center={mapBounds.getCenter()}
            maxBounds={mapBounds}
            zoom={6}
            maxBoundsViscosity={1}
            id="board">
            <TileLayer
                attribution= '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://carto.com/attribution">CARTO</a>'
                url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
                maxZoom={8}
                minZoom={6}
            />
            <GeoJSON
                ref={this.territories}
                data={geojson}
                style={drawTerritories}
                onEachFeature={onEachTerritory} />
        </MapContainer>
    );
};
