import React from 'react'
import Radium from 'radium';
import { connect } from 'react-redux'
import { ReactReduxContext } from 'react-redux'
import { setValue } from '../../../redux/store.js'

import mainStyle from '../../../../styles/global.js'

const layoutStyle = {
    display: 'block',
    height: '100',
    width: '100',
    top: 20,
    left: 20,
    color: mainStyle.textColor,
    backgroundColor: mainStyle.panelBackgroundColor,
}

const mapStateToProps = (state, ownProps) => {
    return {
        value: state[ownProps.name + ".temperature"]
    }
}

class Climate extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: ""
        };
    }

    render() {

        return (
            <div>{this.props.value} ºC</div>
        );
    }
}

Climate = Radium(Climate);
export default connect(mapStateToProps)(Climate);
