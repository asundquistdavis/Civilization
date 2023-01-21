import React, { Component } from 'react'
import axios from 'axios'

class App extends Component {
    constructor(props) {
        super(props);
    };

    componentDidMount() {
        axios
        .post('http://localhost:5000/api/status/', {'username': 'andrew', 'password': 'abcarrow'}, {'method': 'post'})
        .then((res) => this.setState(res.data))
        .catch((err) => console.log(err));
    };


    render() {
        return ( 
            <main className="container">
            <h1 className="text-uppercase text-center my-4">Civilization</h1>
            <div className="row">
                <div className="col-md-6 col-sm-10 mx-auto p-0">
                <div className="card p-3">
                    {this.state.message}
                </div>
                </div>
            </div>
            </main>
        );
    }
}

export default App