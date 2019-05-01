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
    marginTop: 20,
    color: mainStyle.textColor,
    backgroundColor: mainStyle.panelBackgroundColor,
    border: mainStyle.borderOrange,
}

const mapStateToProps = (state) => {
    return {

    }
}

class Dimmer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };

        this.turnOn=this.turnOn.bind(this);
        this.turnOff=this.turnOff.bind(this);
    }

    turnOn(e) {
        this.props.dispatch(setValue(this.props.name + ".level.cmd", 99));
        console.log("Turning on " + this.props.name);
    }

    turnOff(e) {
        this.props.dispatch(setValue(this.props.name + ".level.cmd", 0));
        console.log("Turning off " + this.props.name);
    }

    render() {

        return (
            <div>
                <div style={layoutStyle} onClick={this.turnOn}>Turn {this.props.name} On</div>
                <div style={layoutStyle} onClick={this.turnOff}>Turn {this.props.name} Off</div>
            </div>
        );
    }
}

Dimmer = Radium(Dimmer);
export default connect(mapStateToProps)(Dimmer);
