import { googleLogout } from '@react-oauth/google';
import { Component } from 'react';
import axios from 'axios';
import React from 'react';

const clientId = '748775678800-crcoq8afjhu91pvjgabh6m59ijq41t14.apps.googleusercontent.com';

function Logout() {

    const onSuccess = () => {
        axios.post('/api/logout/')
        .then(res => {console.log(res)})
        .catch(err => {console.log(err)});
    };

    return (
        <div id="signInButton">
            <button
                clientId={clientId}
                buttonText="logout"
                onLogoutSuccess={onSuccess}>
            </button>
        </div>
    )
};

export default Logout;