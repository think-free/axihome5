import React from 'react'
import Radium from 'radium';
import fetch from 'isomorphic-unfetch';
import { connect } from 'react-redux'
import { setValue } from '../../redux/store.js'

import mainStyle from '../../../styles/global.js'

/* Devices */

const MainAreaStyle = {

    p100 : {
        height: '100%',
        display:'block'
    }
}

const mapStateToProps = (state) => {
    return {

    }
}

class MainArea extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }

    async componentDidMount() {

    }

    componentWillUnmount() {

    }

    // Render
    render() {

        const me = this;
        const { zbdevs } = this.state;

        return (
            <div style={MainAreaStyle.p100}>
                <br />
                <br />
                <br />
                Gui not implemented, please edit the places.json file in the configuration folder
            </div>
        )
    }
}

/* Export */

MainArea = Radium(MainArea);
export default connect(mapStateToProps)(MainArea);
