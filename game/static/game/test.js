let data;

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"

async function info() {
    axios.get('/api/load/')
    .then(res => {
        data = res.data;
        console.log(data)})
};

info();

let settings = {
    boardName: 'test board #1',
    startGame: false,
    playerCivs: [
            {
            'playerId': 1,
            'civName': 'greeks'
        }
    ]
};

async function preGame(settings) {
    axios.post('/api/pre-game/', settings)
    .then(res => {
        console.log(res.data);
        info();
    })
};
