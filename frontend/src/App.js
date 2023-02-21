import React, { Component, createRef } from 'react'
import axios from 'axios';
import testState, {tmPlayers} from './testdata';
import renderSelectedPalyer from './components/SelectedPlayer';
import {renderBoard, renderNoBoard, renderLoginRequired, renderTerritoryCardA, renderOverBoardAction, renderTerritoryCardB} from './components/Board';
import renderHeader from './components/Header';
import renderPlayers from './components/Players';
import renderPlayerCard from './components/PlayerCard';
import renderPlayerStats from './components/PlayerStats';
import renderAdvCards from './components/AdvCards';
import renderTradeCards from './components/TradeCards';
import renderHistory from './components/History';
import renderInfo from './components/Info';
import renderSettings from './components/Settings';
import renderPhases from './components/Phases';
import renderGameSettings from './components/GameSettings';
import renderCivs from './components/Civs';
import renderGames from './components/Games';
import { renderTradeCardBack } from './components/TradeCard';
import renderDevTools from './DevTools';

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

class App extends Component {

    interval = null;

    constructor(props) {
        super(props)
        this.state = testState;
        this.board = createRef();
        this.territories = createRef();
    };

    loadData = () => {
        axios.get('/api/load')
        .then(res => {
            const data = res.data;
            console.log(data);
            const { server, playerId, gameId, games, turn, phase, activePlayerId, isActivePlayer, board, boards, civs, players, territories, advCards } = data;
            this.setState({
                server: server,
                playerId: playerId,
                gameId: gameId,
                games: games,
                turn: turn,
                phase: phase,
                activePlayerId: activePlayerId,
                activePlayer: players? players.filter(player => player.id === activePlayerId)[0]: [],
                selectedPlayer: players? players[0]: {},
                isActivePlayer: isActivePlayer,
                isSelectedPlayer: (this.state.selectedPlayer.id===playerId),
                selectedIsActive: (this.state.selectedPlayer.id===activePlayerId),
                board: board,
                boards: boards,
                civs: civs,
                players: players,
                territories: territories,
                advCards: advCards,
            });
        });
    };

    updateData = () => {
        switch (this.state.phase) {
            case 'pre game':
                if (this.state.server != 'authreq') {
                    axios.get('/api/pre-game/')
                    .then(res => {
                        const { phase, players, games } = res.data;
                        if (phase != this.state.phase)
                            {this.loadData();}
                        else
                            {this.setState({
                                phase: phase,
                                games: games,
                                players: players,
                                selectedPlayer: players.filter(player => player.id === this.state.selectedPlayer.id)[0],
                            });}
                    });
                }
                break;
            case 'start of turn':
                axios.get('/api/start-of-turn/')
                .then(res => {
                    const { phase, turn, players, activePlayerId, isActivePlayer } = res.data;
                    this.setState({
                        phase: phase,
                    });
                });
                break;
            default:
                this.loadData();
        }; 
    };

    componentDidMount() {
        this.updateInterval = setInterval(this.updateData, 15000);
        this.loadData();
    };

    componentWillUnmount() {
        clearInterval(this.updateInterval);
    };

    cap(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    toggleStats = () => {
        this.setState({showStats: !this.state.showStats});
    };
    
    toggleTradeCards = () => {
        this.setState({showTradeCards: !this.state.showTradeCards});
    };

    toggleAdvCards = () => {
        this.setState({showAdvCards: !this.state.showAdvCards});
    };

    toggleHistory = () => {
        this.setState({showHistory: !this.state.showHistory});
    };

    toggleInfo = () => {
        this.setState({showInfo: !this.state.showInfo});
    };

    toggleSettings = () => {
        this.setState({showSettings: !this.state.showSettings});
    };

    toggleCivs = () => {
        this.setState({showCivs: !this.state.showCivs});
    };

    toggleGames = () => {
        this.setState({showGames: !this.state.showGames});
    };

    orderPlayers(a, b, order) {
        switch (order) {
            case 'census':
                return a.census - b.census
            case 'points':
                return a.points - b.points
        };
    };

    selectNewPlayer = (player) => {
        this.setState({
            selectedPlayer: player,
            selectedIsActive: this.state.activePlayerId === player.id
        });
    };

    selectNewOrder = (e) => {
        const order = e.target.value;
        this.setState({playersOrder: order});
    };

    selectGame = (gameId) => {
        const report = {
            type: 'selectGame',
            gameId: gameId,
        };
        axios.post('/api/pre-game/', report)
        .then(res => {
            this.loadData()
        });
    };

    selectBoard = (boardId) => {
        let report;
        if (this.state.phase === 'pre game') {
            report = {
                type: 'selectBoard',
                boardId: boardId,
            };
            axios.post('/api/pre-game/', report).then(res => {
                this.loadData()
            });
        };
    };

    selectCiv = (civ) => {
        let report;
        if (this.state.phase === 'pre game') {
            report = {
                type: 'selectCiv',
                civId: civ,
                playerId: this.state.selectedPlayer.id
            };
            axios.post('/api/pre-game/', report).then(res => {
                const { players } = res.data;
                this.setState({
                    players: players, 
                });
            });
        };
    };

    startGame = () => {
        // check valid action state: has all game settings and each player has civ
        let report;
        if (this.state.phase === 'pre game') {
            report = {
                type: 'startGame',
            };
            axios.post('/api/pre-game/', report).then(res => {
                const { phase, players } = res.data
                this.setState({
                    phase: phase,
                });
            });
        };
    };

    startMove = () => {
        this.setState({isMoving: true})
    };

    calcUnits = (territoryId, playerId, coming=false) => {
        let units = 0;
        const player = this.state.players.filter(player => player.id === playerId)? this.state.players.filter(player => player.id === playerId)[0]: null;
        const territory = this.state.territories.filter(territory => territory.id === territoryId)? this.state.territories.filter(territory => territory.id === territoryId)[0]: null;
        
        if (!!player & !!territory) {
            const playerTerritory = territory? 
                territory.players.filter(player => player.playerId === playerId)?
                territory.players.filter(player => player.playerId === playerId)[0]
            : null: null;
            const stagedMoves = coming? (
                    this.state.stagedMoves? 
                    this.state.stagedMoves.filter(move => move.territoryToId === territoryId)? 
                    this.state.stagedMoves.filter(move => move.territoryToId === territoryId).filter(move => move.playerId === playerId)? 
                    this.state.stagedMoves.filter(move => move.territoryToId === territoryId).filter(move => move.playerId === playerId)
                    : []: []: []
                ): (
                    this.state.stagedMoves? 
                    this.state.stagedMoves.filter(move => move.territoryFromId === territoryId)? 
                    this.state.stagedMoves.filter(move => move.territoryFromId === territoryId).filter(move => move.playerId === playerId)? 
                    this.state.stagedMoves.filter(move => move.territoryFromId === territoryId).filter(move => move.playerId === playerId)
                    : []: []: []
                );
                if (coming) {
                    units = stagedMoves? stagedMoves.reduce((parSum, move) => parSum + move.units, 0): 0;
                } else {
                    units = (playerTerritory? playerTerritory.units: 0) - (stagedMoves? stagedMoves.reduce((parSum, move) => parSum + move.units, 0): 0);
                }
        };
        return units;
    };
    
    testMovement = () => {
        clearInterval(this.updateInterval);
        this.setState({
            players: tmPlayers,
            phase: 'movement',
            activePlayer: tmPlayers[0],
            activePlayerId: tmPlayers[0].id,
        });
    };

    renderDevTools = renderDevTools;
    
    renderOverBoardAction = renderOverBoardAction;
    renderTerritoryCardB = renderTerritoryCardB;
    renderTerritoryCardA = renderTerritoryCardA;
    renderBoard = renderBoard;
    renderTradeCardBack = renderTradeCardBack;
    renderGames = renderGames;
    renderNoBoard = renderNoBoard;
    renderLoginRequired = renderLoginRequired;
    renderCivs = renderCivs;
    renderGameSettings = renderGameSettings;
    renderPhases = renderPhases;
    renderSettings = renderSettings;
    renderInfo = renderInfo;
    renderTradeCards = renderTradeCards;
    renderAdvCards = renderAdvCards;
    renderHistory = renderHistory;
    renderPlayerStats = renderPlayerStats;
    renderPlayerCard = renderPlayerCard;
    renderPlayers = renderPlayers;
    renderHeader = renderHeader;
    renderSelectedPalyer = renderSelectedPalyer;

    render() {

        return ( 
            <main className="container">
                <div className="col left">
                    {this.renderPlayers()}
                </div>
                <div className="col center">
                    <div className='row top'>
                        {this.renderHeader()}
                    </div>
                    <div className='row bottom board'>
                        {this.state.board? 
                            this.renderBoard():
                        (this.state.playerId? 
                            this.renderNoBoard():
                            this.renderLoginRequired())}
                        {this.state.board? 
                            this.renderPhases(): null}
                        {this.state.board?
                            this.renderTerritoryCardA(): null}
                        {this.state.board?
                            this.renderOverBoardAction(): null}
                        {this.state.board?
                            this.renderTerritoryCardB(): null}
                    </div>
                    <div className='row dev'>
                        {this.renderDevTools()}
                    </div>
                </div>
                <div className="col right">
                    {this.state.phase==='pre game'? this.renderGameSettings(): this.renderSelectedPalyer()}
                </div>
                {this.state.showStats? (
                    this.renderPlayerStats(this.state.selectedPlayer)
                ): null}
                {this.state.showTradeCards? (
                    this.renderTradeCards(this.state.selectedPlayer.tradeCards)
                ): null}
                {this.state.showAdvCards? (
                    this.renderAdvCards(this.state.selectedPlayer.advCards, this.state.advCards)
                ): null}
                {this.state.showHistory? (
                    this.renderHistory()
                ): null}
                {this.state.showSettings? (
                    this.renderSettings()
                ): null}
                {this.state.showInfo? (
                    this.renderInfo()
                ): null}
                {this.state.showCivs? (
                    this.renderCivs()
                ): null}
                {this.state.showGames? (
                    this.renderGames()
                ): null}
            </main>
        );
    };
};

export default App;
