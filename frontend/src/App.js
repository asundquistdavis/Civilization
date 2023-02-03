import React, { Component } from 'react'
import axios from 'axios';
import testState from './testdata';
import renderSelectedPalyer from './components/SelectedPlayer';
import Board from './components/Board';
import renderHeader from './components/Header';
import renderPlayers from './components/Players';
import renderPlayerCard from './components/PlayerCard';
import renderPlayerStats from './components/PlayerStats';
import renderAdvCards from './components/AdvCards';
import renderTradeCards from './components/TradeCards';
import renderHistory from './components/History';
import renderInfo from './components/Info';
import renderSettings from './components/Settings';

class App extends Component {

    constructor(props) {
        super(props)
        this.state = testState;
    };

    loadData = () => {
        axios.get('/api/load')
        .then(res => {
            const data = res.data;
            console.log(data);
            const { playerId, gameId, turn, phase, activePlayerId, isActivePlayer, board, players, territories, advCards } = data;
            this.setState({
                playerId: playerId,
                gameId: gameId,
                turn: turn,
                phase: phase,
                activePlayerId: activePlayerId,
                activePlayer: players.filter(player => player.id === activePlayerId)[0],
                selectedPlayer: players[0],
                isActivePlayer: isActivePlayer,
                isSelectedPlayer: (this.state.selectedPlayer.id===playerId),
                selectedIsActive: (this.state.selectedPlayer.id===activePlayerId),
                board: board,
                players: players,
                territories: territories,
                advCrds: advCards,
            });
        });
    };

    componentDidMount() {
        this.loadData();
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

    orderPlayers(a, b, order) {
        switch (order) {
            case 'census':
                return a.census - b.census
            case 'points':
                return a.points - b.points
        }

    };

    selectNewPlayer = (player) => {
        this.setState({selectedPlayer: player});
    };

    selectNewOrder = (e) => {
        const order = e.target.value;
        this.setState({playersOrder: order});
    };    

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
                    <div className='row bottom'>
                        <Board territories={this.state.territories} board={this.state.board}/>
                    </div>
                </div>
                <div className="col right">
                    {this.renderSelectedPalyer()}
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
            </main>
        );
    };
};

export default App;