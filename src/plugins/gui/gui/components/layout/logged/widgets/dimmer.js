import React from 'react'
import Radium from 'radium';
import { connect } from 'react-redux'
import { ReactReduxContext } from 'react-redux'
import { setValue } from '../../../redux/store.js'

import mainStyle from '../../../../styles/global.js'

const layoutStyle = {
    display: 'block',
    height: '100',
    width: 'auto',
    top: 20,
    left: 20,
    right: 20,
    color: mainStyle.textColor,
    backgroundColor: mainStyle.panelBackgroundColor,
    border: mainStyle.borderOrange,
}

const mapStateToProps = (state) => {
    return {
        currentTab: state.currentTab,
        user: state.user,
    }
}

class Dimmer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTab: "",
            user: "",
        };

        this.turnOn=this.turnOn.bind(this);
        this.turnOff=this.turnOff.bind(this);
    }

    turnOn(e) {
        this.props.dispatch(setValue(this.props.dimmer + ".level", "99"));
        console.log("Turning on")
    }

    turnOff(e) {
        this.props.dispatch(setValue(this.props.dimmer + ".level", "0"));
        console.log("Turning off")
    }

    render() {

        return (
            <div>
                <div style={layoutStyle} onClick={this.turnOn}>Turn On</div>
                <div style={layoutStyle} onClick={this.turnOff}>Turn Off</div>
            </div>
        );
    }
}

Dimmer = Radium(Dimmer);
export default connect(mapStateToProps)(Dimmer);
