import React from 'react';
import { connect } from 'react-redux';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Snake from './Snake';

class App extends React.Component {

    componentDidMount() {

    }

    render() {
        return (
            <Router>
                <div style={this.props.loading ? { opacity: "0.25" } : { opacity: "1.0" }}>
                    <Routes>
                        <Route exact path="/" element={<Home />} />
                        <Route exact path="/snake" element={<Snake />} />
                    </Routes>
                </div>
                <div className="loader" hidden={!this.props.loading}></div>
            </Router>
        );
    }
};

const mapStateToProps = (state) => {
    return {
        loading: state.ajaxCallsInProgress > 0,
    };
}

export default connect(mapStateToProps, {})(App);