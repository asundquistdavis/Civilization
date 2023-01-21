import React, { Component } from 'react'
import axios from 'axios'
import Login from './components/login';
import Logout from './components/logout';
import { useEffect } from 'react';
import { gapi } from 'gapi-script';

const clientID = '748775678800-crcoq8afjhu91pvjgabh6m59ijq41t14.apps.googleusercontent.com';

// class App extends Component {
//     constructor(props) {
//         super(props);
//     };

//     componentDidMount = () => {
//         useEffect(() => {
//             function start() {
//                 gapi.client.init({
//                     clientID: clientID,
//                     scope: ""
//                 });
//             };
//         })
//     };

//     render() {
//         return ( 
//             <main className="container">
//             <h1 className="text-uppercase text-center my-4">Civilization</h1>
//             <div className="row">
//                 <div className="col-md-6 col-sm-10 mx-auto p-0">
//                 <div className="card p-3">
//                     <Login/>
//                     <Logout/>
//                 </div>
//                 </div>
//             </div>
//             </main>
//         );
//     };
// }

function App () {
    useEffect(() => {
        function start() {
            gapi.client.init({
                clientID: clientID,
                scope: ""
            });
        };

        gapi.load('client:auth2', start);
    });

    return ( 
        <main className="container">
        <h1 className="text-uppercase text-center my-4">Civilization</h1>
        <div className="row">
            <div className="col-md-6 col-sm-10 mx-auto p-0">
            <div className="card p-3">
                <Login/>
                {/* <Logout/> */}
            </div>
            </div>
        </div>
        </main>
    );
}

export default App