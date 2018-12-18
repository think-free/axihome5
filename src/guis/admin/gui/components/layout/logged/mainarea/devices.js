import React from 'react'
import Radium from 'radium';
import { connect } from 'react-redux'
import { setValue } from '../../../redux/store.js'

import mainStyle from '../../../../styles/global.js'


/* Devices */

const devicesStyle = {

    p100 : {
        height: '100%',
        display:'block'
    },
    deviceList : {
        display:'block',
        position: 'relative',
        marginTop: 50,
        height: 'calc(100% - 50px)',
        fallbacks: [
            { height: '-moz-calc(100% - 50px)' },
            { height: '-webkit-calc(100% - 50px)' },
            { height: '-o-calc(100% - 50px)' }
        ],
        overflowY: 'auto'
    }
}

const mapStateToProps = (state) => {
    return {
        devices: state.devices
    }
}

class Devices extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            devices: [],
        };

        this.buttonClick=this.buttonClick.bind(this);
    }

    async componentDidMount() {

        this.getData();

        // Periodicaly refresh states
        this.interval = setInterval(() => {
            this.getData();
        }, 30000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    async getData(url){
        var url = "/core/getDevices"

        fetch(url)
        .then(response => response.json())
        .then(data => this.setState({ devices: data }))
    }

    buttonClick(e) {
        this.props.dispatch(setValue("Devices", "clicked"));
    }

    render() {
        const { devices } = this.state;

        return (
            <div style={devicesStyle.p100}>
                <div style={devicesStyle.deviceList}>
                    {devices.map(function(device){

                        return (
                            <Device device={device}/>
                        )
                    })}
                </div>
            </div>
        );
    }
}

const deviceStyle = {
    panel : {
        color: mainStyle.textColor,
        marginTop: 10,
        height: 40,
        width: "100%",
        backgroundColor: mainStyle.panelBackgroundColor
    },
    icon : {
        paddingTop: 10,
        paddingLeft: 20,
    },
    name : {
        color: mainStyle.textItemColor,
        paddingTop: 5,
        paddingLeft: 20,
        display:"inline-block"
    }
}

class Device extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        const device = this.props.device;
        const type = "/admin/static/devicestypes/"+device.type+ ".png"

        return (

            <div style={deviceStyle.panel}>
                <img style={deviceStyle.icon} src={type} alt="devices" width="20" height="20" draggable="false"/> <span style={deviceStyle.name}> {device.homeId}.{device.group}.{device.name}</span>
            </div>
        )
    }
}

Devices = Radium(Devices);
export default connect(mapStateToProps)(Devices);
