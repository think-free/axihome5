import React from 'react'
import Radium from 'radium';
import Slider from '@material-ui/lab/Slider';
import { connect } from 'react-redux'
import { ReactReduxContext } from 'react-redux'
import { setValue } from '../../../redux/store.js'

import mainStyle from '../../../../styles/global.js'

const layoutStyle = {
    display: 'block',
    height: '250',
    width: 'auto',
    top: 20,
    left: 20,
    right: 20,
    marginTop: 20,
    color: mainStyle.textColor,
    backgroundColor: mainStyle.panelBackgroundColor,
    paddingTop: 10,
    paddingLeft: 10
}

const sliderStyle = {

    padding: 20,
    paddingRight: 80
}

const icon = {
    
    position: "relative",
    float: "right",
    top: "-65px",
}

const mapStateToProps = (state, ownProps) => {
    return {
        level: state[ownProps.name + ".level"]
    }
}

class Dimmer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            level: ""
        };

        this.toggleState = this.toggleState.bind(this);
        this.turnOn=this.turnOn.bind(this);
        this.turnOff=this.turnOff.bind(this);
    }

    toggleState(e) {

        if (this.props.level > 0) {

            this.props.dispatch(setValue(this.props.name + ".level.cmd", 0));
            console.log("Turning off " + this.props.name);

        } else {

            this.props.dispatch(setValue(this.props.name + ".level.cmd", 99));
            console.log("Turning on " + this.props.name);
        }
    }

    turnOn(e) {
        this.props.dispatch(setValue(this.props.name + ".level.cmd", 99));
        console.log("Turning on " + this.props.name);
    }

    turnOff(e) {
        this.props.dispatch(setValue(this.props.name + ".level.cmd", 0));
        console.log("Turning off " + this.props.name);
    }

    setLevel = (event, level) => {
        this.props.dispatch(setValue(this.props.name + ".level.cmd", level));
        console.log("Setting level of " + this.props.name + " to " + level);
    };

    render() {

        var me = this;
        var name = this.props.name.split(".");

        if (name.length == 3 )
            name = name[1].charAt(0).toUpperCase() + name[1].slice(1) + " " + name[2].charAt(0).toUpperCase() + name[2].slice(1);

        var stateIcon = "/static/off.png";
        if (this.props.level > 0) {
            stateIcon = "/static/on.png";
        }

        return (
            <div style={layoutStyle}>

                {name} <br />
                <div style={sliderStyle}>
                    <Slider value={this.props.level} onChange={me.setLevel}/>
                </div>
                <span style={icon}>
                    <img style={mainStyle.menuIcon} src={stateIcon} width="30" height="30" draggable="false" onClick={this.toggleState} />
                </span>
            </div>
        );
    }
}

Dimmer = Radium(Dimmer);
export default connect(mapStateToProps)(Dimmer);
