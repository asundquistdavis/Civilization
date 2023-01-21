import React from 'react';
import * as ReactDom from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import App from './App';

// const container = document.getElementById('app');
// const root = createRoot(container)
// root.render(<App />);


ReactDom.render(
    <App/>,
    document.getElementById('app')
);