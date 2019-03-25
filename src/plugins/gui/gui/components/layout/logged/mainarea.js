import React from 'react'
import Radium from 'radium';
import fetch from 'isomorphic-unfetch';
import { connect } from 'react-redux'
import { setValue } from '../../redux/store.js'

import mainStyle from '../../../styles/global.js'

/* Devices */

const MainAreaStyle = {

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

        return (
            <div>
                <div ref={element => this.threeRootElement = element} />
            </div>
        )
    }
}

/* Export */

MainArea = Radium(MainArea);
export default connect(mapStateToProps)(MainArea);
