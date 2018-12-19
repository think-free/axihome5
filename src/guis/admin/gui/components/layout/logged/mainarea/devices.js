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

/* Device variable */

const deviceStyle = {
    panel : {
        color: mainStyle.textColor,
        marginTop: 10,
        minHeight: 40,
        width: "100%",
        backgroundColor: mainStyle.panelBackgroundColor
    },
    panelExpanded : {
        color: mainStyle.textColor,
        marginTop: 10,
        height: 200,
        width: "100%",
        backgroundColor: mainStyle.panelBackgroundColor
    },
    icon : {
        paddingTop: 10,
        paddingLeft: 20,
    },
    name : {
        color: mainStyle.textColor,
        paddingLeft: 20,
        display:"inline-block",
        textAlign: 'center',
        userSelect:"none",
    },
    menuIcon : {
        paddingTop: 10,
        paddingRight: 20,
        paddingBottom: 10,
        paddingLeft: 20,
        float: 'right',
        cursor: "pointer",
        ':hover': {
          backgroundColor: mainStyle.menuBackgroundColor
        }
    },
    line : {
        height: 1,
        width: 'calc(100%-100px)',
        marginLeft: 50,
        marginRight: 50,
        backgroundColor: '#383846'
    },
    panelVariable : {
        margin:  10
    }
}

class Device extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            panelVisible: false,
        };

        this.showDetailClick=this.showDetailClick.bind(this);
        this.renderVariables=this.renderVariables.bind(this);
    }

    showDetailClick(e) {
        console.log("CLICKED")
        this.setState({panelVisible : !this.state.panelVisible})
    }

    render() {

        const device = this.props.device;
        const type = "/admin/static/devicestypes/"+device.type+ ".png"

        console.log(this.state.panelVisible)

        const stl = deviceStyle.panel //this.state.panelVisible ? deviceStyle.panelExpanded : deviceStyle.panel

        return (

            <div style={stl}>
                <img style={deviceStyle.icon} src={type} alt="devices" width="20" height="20" draggable="false"/>
                <span style={deviceStyle.name}> {device.homeId}.{device.group}.{device.name}</span>
                <img style={deviceStyle.menuIcon} src="/admin/static/menu.png" alt="devices" width="20" height="20" draggable="false" onClick={this.showDetailClick}/>
                {this.renderVariables()}
            </div>
        )
    }

    renderVariables() {

        if (this.state.panelVisible) {

            const variables = this.props.device.variables;
            const dev = this.props.device.homeId +"."+ this.props.device.group +"."+ this.props.device.name

            return (

                <div style={deviceStyle.panelVariable}>
                    <div style={deviceStyle.line}/>

                    {variables.map(function(variable){
                        return (
                            <DeviceVariable device={dev} variable={variable} />
                        )
                    })}

                    <br/>
                </div>
            )
        } else {

            return(null)
        }
    }
}


/* Device variable */

const deviceVariableStyle = {
    panel : {
        color: mainStyle.textColor,
        margin: 5,
        height: 30,
        lineHeight: '30px',
        width: "calc(100% - 10px)"
    },
    variable : {
        marginLeft: 45,
        color: mainStyle.textItemColor
    },
    value : {
        position: 'absolute',
        marginLeft: 100,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: mainStyle.mainBackgroundColor,
    }
}

class DeviceVariable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: {
                key: "",
                value: ""
            },
        };
    }

    async componentDidMount() {

        this.getData();

        // Periodicaly refresh states
        this.interval = setInterval(() => {
            this.getData();
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    async getData(url){
        var url = "/core/getValue?key=" + this.props.device + "." + this.props.variable.name

        fetch(url)
        .then(response => response.json())
        .then(data => this.setState({ value: data }))
    }


    render(){

        const { value } = this.state;

        return(
            <div style={deviceVariableStyle.panel}>
                <span style={deviceVariableStyle.variable}>{this.props.variable.name}</span>
                <span style={deviceVariableStyle.value}>{this.state.value.value}</span>
            </div>
        )
    }
}

/* Export */

Devices = Radium(Devices);
Device = Radium(Device);
export default connect(mapStateToProps)(Devices);
