import React from 'react'
import Radium from 'radium';
import { connect } from 'react-redux'
import { setValue } from '../../../redux/store.js'
import DeviceAdd from './devices/addDevice.js'

import mainStyle from '../../../../styles/global.js'

/* Devices */

const devicesStyle = {

    p100 : {
        height: '100%',
        display:'block'
    },
    toolBar : {
        position: 'relative',
        float: 'right'
    },
    deviceList : {
        display:'block',
        position: 'relative',
        marginTop: 50,
        height: 'calc(100% - 50px)',
        width: '100%',
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
        devices: state.devices,
        addPanelVisible: state.addPanelVisible
    }
}

class Devices extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            devices: [],
        };

        // Buttons handlers
        this.toggleAddPanelVisible=this.toggleAddPanelVisible.bind(this);
    }

    async componentDidMount() {

        this.getData();

        // Periodicaly refresh states
        this.interval = setInterval(() => {
            this.getData();
        }, 5000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    async getData(url){
        var url = "/core/getDevicesConfig"

        fetch(url)
        .then(response => response.json())
        .then(data => this.setState({ devices: data }))
    }

    // Button handler

    toggleAddPanelVisible(e) {
        this.props.dispatch(setValue("addPanelVisible", true))
    }

    // Render

    render() {
        const { devices } = this.state;

        if (!this.props.addPanelVisible){

            return (
                <div style={devicesStyle.p100}>
                    <span style={devicesStyle.toolBar}>
                        <img key="bt_add" style={mainStyle.menuIcon} src="/admin/static/add.png" width="20" height="20" draggable="false" onClick={this.toggleAddPanelVisible}/>
                    </span>
                    <div style={devicesStyle.deviceList}>
                        {devices && devices.map(function(device){

                            return (
                                <Device device={device}/>
                            )
                        })}
                    </div>
                </div>
            );
        } else {
            return (
                <DeviceAdd />
            )
        }
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
        float: 'right'
    },

    panelVariable : {
        margin:  10
    },
    table : {
        borderCollapse: "separate",
        borderSpacing: "0 10px",
        marginLeft: 50
    }
}

class Device extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            panelVisible: false,
        };

        this.edit=this.edit.bind(this);
        this.delete=this.delete.bind(this);

        this.showDetailClick=this.showDetailClick.bind(this);
        this.renderVariables=this.renderVariables.bind(this);
        this.renderButtons=this.renderButtons.bind(this);
    }

    showDetailClick(e) {
        this.setState({panelVisible : !this.state.panelVisible})
    }

    edit(e) {
        this.props.dispatch(setValue("editVariable", this.props.device))
        this.props.dispatch(setValue("addPanelVisible", true))
    }

    delete(e) {

        console.log( this.props.device)
        fetch("/core/deleteDeviceConfig?id=" + this.props.device.id)
    }

    render() {

        const device = this.props.device;
        var tp = device.type;
        if (tp == ""){
            tp = "unknown"
        }

        const type = "/admin/static/devicestypes/"+tp+ ".png"

        console.log(this.state.panelVisible)

        const stl = deviceStyle.panel //this.state.panelVisible ? deviceStyle.panelExpanded : deviceStyle.panel

        return (

            <div style={stl}>
                <img style={deviceStyle.icon} src={type} alt="devices" width="20" height="20" draggable="false"/>
                <span style={deviceStyle.name}> {device.homeId}.{device.group}.{device.name}</span>
                <div style={deviceStyle.menuIcon}>
                    {this.renderButtons()}
                    <img style={mainStyle.menuIcon} src="/admin/static/menu.png" alt="devices" width="20" height="20" draggable="false" onClick={this.showDetailClick}/>
                </div>
                {this.renderVariables()}
            </div>
        )
    }

    renderButtons() {

        if (this.state.panelVisible) {

            return (
                <span>
                    <img key="bt_edit" style={mainStyle.menuIcon} src="/admin/static/edit.png" width="20" height="20" draggable="false" onClick={this.edit}/>
                    <img key="bt_delete" style={mainStyle.menuIcon} src="/admin/static/delete.png" width="20" height="20" draggable="false" onClick={this.delete}/>
                    &nbsp;&nbsp;
                </span>
            )
        } else {

            return (null)
        }
    }

    renderVariables() {

        if (this.state.panelVisible) {

            const variables = this.props.device.variables;
            const dev = this.props.device.homeId +"."+ this.props.device.group +"."+ this.props.device.name

            return (

                <div style={deviceStyle.panelVariable}>
                    <div style={mainStyle.line}/>

                    <br/>

                    <table style={deviceStyle.table}>

                        <col width="40px" />
                        <col />

                        {variables && variables.map(function(variable){
                            return (
                                <DeviceVariable device={dev} variable={variable} />
                            )
                        })}

                    </table>

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
        width: 300,
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
            <tr>
                <td style={deviceVariableStyle.variable}>{this.props.variable.name}</td>
                <td style={deviceVariableStyle.value}>{this.state.value.value}</td>
            </tr>
        )
    }
}

/* Export */

Devices = Radium(Devices);
Device = Radium(Device);
Device = connect()(Device)
export default connect(mapStateToProps)(Devices);
