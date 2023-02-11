
const testAdvCards = [
    {
        name: 'Advancement Card',
        price: 0,
        points: 0,
        creditFor: 'Advancement Card',
        creditForAmount: 0,
        creditFrom: 'Advancement Card',
        creditFromAmount: 0,
        color1: 'blue',
        color2: 'orange',
        affinities: [
            {
                color: 'orange',
                credit: 0,
            }
        ],
        cost: 0
    }
]

const testPlayers = [
    {
        id: 0,
        username: 'Andrew',
        pcolor: '#f8f8cb',
        scolor: '#000000',
        civ: 'egyptains',
        astRank: 0,
        cards: 0,
        census: 0,
        points: 0,
        treasury: 0,
        tax: 0,
        backTax: 0,
        stock: 0,
        units: 0,
        cities: 0,
        movementOrder: 0,
        benneficiaryOrder: 0,
        advCards: testAdvCards[0].name,
        tradeCards: [
            {
                name: 'ochre',
                level: 1,
                max_level: 8,
            }
        ]
    },
];

const testTerritories = [
    {
        id: 0,
        geometry: upperSicilyGeometry,
        name: 'Upper Sicily',
        type: 'sea',
        support: 0,
        hasCityCite: false,
        adjacencies: [
            "Strait of Messina",
            "North Sicily Sea",
            "Western Sicily",
            "Syracuse"
        ],
        players: [
            {
                playerId: 0,
                units: 0,
                hasCity: false,
                boats: []
            }
        ]
    }
];

const testState = {
    playerId: 0,
    gameId: 0,
    games: [],
    turn: 0,
    phase: 'pre game',
    activePlayerId: 0,
    activePlayer: testPlayers.filter(player => player.id===0)[0],
    selectedPlayer: testPlayers[0],
    isActivePlayer: false,
    isSelectedPlayer: (0===testPlayers[0].id),
    selectedIsActive: false,
    // players: testPlayers,
    players: [],
    board: testBoard,
    territories: testTerritories,
    advCards: testAdvCards,
    infoType: 'trade cards',
    showStats: false,
    showTradeCards: false,
    showAdvCards: false,
    showHistory: false,
    showSettings: false,
    showInfo: false,
    showCivs: false,
    showGames: false,
    xChar: '\u2715',
    action: testAction,
};

const testAction = {
    players: [],
    boadName: '',
    advDeck: 'standard',
    tradeDeck: 'standard',
}

const testBoard = [
    [
    11.524872407376733,
    42.879019584830985
    ],
    [
    33.21704539770957,
    34.16722269351206
    ]
];

const upperSicilyGeometry = {
    coordinates: [
    [
    [
    15.083920843494099,
    37.49012563213084
    ],
    [
    15.18657276814011,
    37.554400592849916
    ],
    [
    15.213586432520714,
    37.793870793308784
    ],
    [
    15.629596863981163,
    38.26200471011026
    ],
    [
    15.543153137963031,
    38.30017408694576
    ],
    [
    15.089323576370475,
    38.1218787120161
    ],
    [
    14.92724159008688,
    38.185605768517206
    ],
    [
    14.775965069556008,
    38.16012162819453
    ],
    [
    14.570661220263958,
    38.05384182566931
    ],
    [
    14.327538231155472,
    38.00702974818154
    ],
    [
    14.311330032527621,
    37.49869883049443
    ],
    [
    15.083920843494099,
    37.49012563213084
    ]
    ]
    ],
    type: "Polygon"
};

export default testState;
