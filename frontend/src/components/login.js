import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import React from 'react';

const clientId = '748775678800-crcoq8afjhu91pvjgabh6m59ijq41t14.apps.googleusercontent.com';

function Login() {

    const onSuccess = (res) => {
        axios
        .post('/api/login/', res.ProfileObj)
        .then(res => {console.log(res)})
        .catch(err => {console.log(err)});
    };

    const onFailure = (res) => {
        console.log('failed to login:', res)
    };

    return (
        <div id="signInButton">
            <GoogleLogin
                clientId={clientId}
                buttonText="login"
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy={'single_host_origin'}
                isSignedIn={true}
            />
        </div>
    )
};

export default Login;