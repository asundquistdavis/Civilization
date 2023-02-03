import { latLng, latLngBounds } from "leaflet";
import React, { Component, createRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";

class Board extends Component {

    constructor(props) {
        super(props);
        this.board = createRef();
        this.territories = createRef();
        this.selectedTerritory = createRef();
        this.state = {
            selectedTerritory: null
        }
    };

    colorTerritory = (properties) => {
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

    showTerritoryCard = (territory) => {
        return (
            `<h1>${territory.properties.name}</h1>`
        )
    };

    drawTerritories = (feature) => {
        return {
            fillColor: this.colorTerritory(feature.properties),
            fillOpacity: 0.2,
            weight: 3,
            opacity: 1,
            color: 'black'
        };
    };

    selectTerritory = () => {
        return {
            weight: 3,
            color: '#666666',
            dashArray: '',
            fillOpacity: 0.7,
            fillColor: '#eece31'
        }
    }

    highlightTerritory = (event) => {
        event.target.setStyle({
            weight: 5,
            color: '#666666',
            dashArray: '',
            fillOpacity: 0.3,
            fillColor: '#eece31'
        })
    };

    resetTerritory = (event) => {
        this.territories.current.resetStyle(event.target);
    };

    selectTerritory = (event) => {
        const layer = event.target;
        this.board.current.fitBounds(layer.getBounds());
        this.setState({selectedTerritory: layer.feature});
    };

    onEachTerritory = (feature, layer) => {
        layer.bindPopup(this.showTerritoryCard(feature))
        layer.on({
            mouseover: this.highlightTerritory,
            mouseout: this.resetTerritory,
            click: this.selectTerritory
        })
    };
    
    render() {

        if (this.props.board) {

            const geojson = {
                type: "FeatureCollection",
                features: this.props.territories.map(territory => {
                    return {
                        type: "Feature",
                        properties: {
                            id: territory.id,
                            name: territory.name,
                            type: territory.type,
                            support: territory.support,
                            adjacencies: territory.adjacencies,
                            hasCityCite: territory.hasCityCite,
                            players: territory.players
                        },
                        geometry: territory.geometry
                    };
                })
            };

        const mapBounds = latLngBounds(...this.props.board.map(coor => latLng([coor[1], coor[0]])));

            return (
                <div
                    className="board">
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
                                data={geojson} 
                                ref={this.territories}
                                style={this.drawTerritories}
                                onEachFeature={this.onEachTerritory} 
                                 />

                        </MapContainer>
                </div>
            );

        } else {

            return null;
        
        };
    };
};

export default Board;
