import React from 'react'
import Radium from 'radium';
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
    height: 45,
    marginTop: 20,
    color: mainStyle.textColor,
    backgroundColor: mainStyle.panelBackgroundColor,
    paddingTop: 10,
    paddingLeft: 10
}

const icon = {

    position: "relative",
    float: "right",
    top: "-25px",
}

const mapStateToProps = (state, ownProps) => {
    return {
        switch: state[ownProps.name + ".switch"]
    }
}

class Switch extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };

	this.toggleState=this.toggleState.bind(this);
        this.turnOn=this.turnOn.bind(this);
        this.turnOff=this.turnOff.bind(this);
    }


    toggleState(e) {

        if (this.props.switch > 0) {

            this.props.dispatch(setValue(this.props.name + ".switch.cmd", 0));
            console.log("Turning off " + this.props.name);

        } else {

            this.props.dispatch(setValue(this.props.name + ".switch.cmd", 1));
            console.log("Turning on " + this.props.name);
        }
    }

    turnOn(e) {
        this.props.dispatch(setValue(this.props.name + ".switch.cmd", 1));
        console.log("Turning on " + this.props.name);
    }

    turnOff(e) {
        this.props.dispatch(setValue(this.props.name + ".switch.cmd", 0));
        console.log("Turning off " + this.props.name);
    }

    render() {

        var me = this;
        var name = this.props.name.split(".");

        if (name.length == 3)
            name = name[1].charAt(0).toUpperCase() + name[1].slice(1) + " " + name[2].charAt(0).toUpperCase() + name[2].slice(1);

        var stateIcon = "/static/off.png";
        if (this.props.switch > 0) {
            stateIcon = "/static/on.png";
        }

        return (
            <div style={layoutStyle}>

                {name} <br />
                <span style={icon}>
                    <img style={mainStyle.menuIcon} src={stateIcon} width="30" height="30" draggable="false" onClick={this.toggleState} />
                </span>
            </div>
        );
    }
}

Switch = Radium(Switch);
export default connect(mapStateToProps)(Switch);
