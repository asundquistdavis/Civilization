import React, { Component } from 'react'
// import axios from 'axios'
import Login from './components/login';
// import Logout from './components/logout';
import { useEffect } from 'react';
import { gapi } from 'gapi-script';

import { googleLogout, GoogleOAuthProvider } from '@react-oauth/google';

const clientID = '748775678800-crcoq8afjhu91pvjgabh6m59ijq41t14.apps.googleusercontent.com';

function App () {

    function handleCallbackResponse(res) {
        console.log('Encoded JWT ID Token: ', res.credential);
    };

    useEffect(() => {
        /* global google */
        google.accounts.id.initialize({
            clientID: clientID,
            callback: handleCallbackResponse
        });

        google.accounts.id.renderButton(
            document.getElementById('loginDiv'),
            {theme: 'outline', size: 'large'}
        );
    }, []);

    return (
        <main className="container">
        <h1 className="text-uppercase text-center my-4">Civilization</h1>
        <div className="row">
            <div className="col-md-6 col-sm-10 mx-auto p-0">
            <div className="card p-3">
                <div id='loginDiv'></div>
            </div>
            </div>
        </div>
        </main>
    );
}

export default App