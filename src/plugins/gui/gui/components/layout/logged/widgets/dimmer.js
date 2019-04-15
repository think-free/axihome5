import React from 'react'
import Radium from 'radium';
import { connect } from 'react-redux'

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
    }

    turnOn(e) {
        fetch("/core/logout")
    }

    render() {

        return (
          <div style={layoutStyle} onClick={this.turnOn}>Turn On</div>
        );
    }
}

Dimmer = Radium(Dimmer);
export default connect(mapStateToProps)(Dimmer);
