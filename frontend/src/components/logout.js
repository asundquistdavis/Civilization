import { GoogleLogout } from 'react-google-login';
import axios from 'axios';
import React from 'react';

const clientId = '748775678800-crcoq8afjhu91pvjgabh6m59ijq41t14.apps.googleusercontent.com';

function Logout() {

    const onSuccess = () => {
        axios.post('/api/logout/');
    };

    return (
        <div id="signInButton">
            <GoogleLogout
                clientId={clientId}
                buttonText="logout"
                onLogoutSuccess={onSuccess}
            />
        </div>
    )
};

export default Logout;