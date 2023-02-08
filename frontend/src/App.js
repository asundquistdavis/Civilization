import React, { Component } from 'react'
import axios from 'axios';
import testState from './testdata';
import renderSelectedPalyer from './components/SelectedPlayer';
import Board, {renderNoBoard, renderLoginRequired} from './components/Board';
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

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

class App extends Component {

    interval = null;

    constructor(props) {
        super(props)
        this.state = testState;
    };

    loadData = () => {
        axios.get('/api/load')
        .then(res => {
            const data = res.data;
            console.log(data);
            const { playerId, gameId, games, turn, phase, activePlayerId, isActivePlayer, board, boards, civs, players, territories, advCards } = data;
            this.setState({
                playerId: playerId,
                gameId: gameId,
                games: games,
                turn: turn,
                phase: phase,
                activePlayerId: activePlayerId,
                activePlayer: players.filter(player => player.id === activePlayerId)[0],
                selectedPlayer: players[0],
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
                axios.get('/api/pre-game/')
                .then(res => {
                    console.log(res.data)
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
        this.interval = setInterval(this.updateData, 15000);
        this.loadData();
    };

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    cap(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

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
        console.log('fire!')
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
        this.setState({selectedPlayer: player});
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
            console.log(res.data)
            this.loadData()
        });
    };

    selectBoard = (boardId) => {
        let report
        if (this.state.phase === 'pre game') {
            report = {
                type: 'selectBoard',
                boardId: boardId,
            };
            axios.post('/api/pre-game/', report).then(res => {
                const {board, territories} = res.data;
                this.setState({
                    board: board,
                    territories: territories, 
                });
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
                    players: players
                });
            });
        };
    };

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
                            (<Board territories={this.state.territories} board={this.state.board}/>): 
                        (this.state.playerId? 
                            this.renderNoBoard():
                            (this.renderLoginRequired()))}
                        {this.state.board? 
                            this.renderPhases(): null}
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