import React from 'react'
import Radium from 'radium';
import fetch from 'isomorphic-unfetch';
import { connect } from 'react-redux'
import { setValue } from '../../redux/store.js'

import mainStyle from '../../../styles/global.js'

/* Devices */

const MainAreaStyle = {

    p100 : {
        height: '100%',
        display:'block'
    },
    toolBar : {
        position: 'relative',
        float: 'right',
        display: 'block'
    },
    MainAreaList : {
        display:'block',
        position: 'relative',
        marginTop: 20,
        height: 'calc(100% - 200px)',
        width: '100%',
        fallbacks: [
            { height: '-moz-calc(100% - 200px)' },
            { height: '-webkit-calc(100% - 200px)' },
            { height: '-o-calc(100% - 200px)' }
        ],
        overflowY: 'auto'
    },
    plugin : {
        marginTop: 10
    },
    cellStyle : {
        display: 'block',
        float: 'left',
        height: '200px',
        width: '200px',
        userSelect:'none'
    },
    cellContent : {
        position: 'relative',
        display: 'block',
        height: '110px',
        width: '110px',
        bottom:5,
        top:5,
        left:5,
        right:5,
        margin: 10,
        padding: 20,
        backgroundColor: mainStyle.panelBackgroundColor,
        textAlign: 'center',
        fontVariant: 'small-caps',
        textTransform: 'uppercase',
        fontSize: '0.8em',
        cursor: 'pointer',
        userSelect:'none',
        ':hover': {
          backgroundColor: mainStyle.menuBackgroundColor
        }
    },
    panel : {
        color: mainStyle.textColor,
        marginTop: 10,
        minHeight: 40,
        width: "100%",
        backgroundColor: mainStyle.panelBackgroundColor
    },
    zbid : {
        color: mainStyle.textColor,
        paddingLeft: 20,
        display:"inline-block",
        textAlign: 'center',
        userSelect:"none",
        textTransform: 'capitalize',
        fontSize: "1.1em",
        textDecoration: "underline"
    },
    table : {
        padding: 10,
        marginLeft: 50,
        marginRight: 50
    },
    item : {
        color: mainStyle.textItemColor
    }
}

const mapStateToProps = (state) => {
    return {

    }
}

class MainArea extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            serials: [],
            deviceId : "",
            deviceType : "",
            deviceHomeId : "",
            deviceGroup : "",
            deviceName : ""
        };

        this.sendConfig=this.sendConfig.bind(this);
        this.formDeviceIdChanged=this.formDeviceIdChanged.bind(this);
        this.formDeviceTypeChanged=this.formDeviceTypeChanged.bind(this);
        this.formDeviceHomeIDChanged=this.formDeviceHomeIDChanged.bind(this);
        this.formDeviceGroupChanged=this.formDeviceGroupChanged.bind(this);
        this.formDeviceNameChanged=this.formDeviceNameChanged.bind(this);
        this.setCurrentVariable=this.setCurrentVariable.bind(this);
        this.deleteCurrentVariable=this.deleteCurrentVariable.bind(this);
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
        var url = "/serial/getAll"

        fetch(url)
        .then(response => response.json())
        .then(data => this.setState({ serials: data }))
    }

    post (url, json) {
        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: json
        })
    }

    sendConfig(){

        var v = this.state.serials;

        var found = false;

        for (var i = 0; i < v.length; i++) {

            if (v[i].index === this.state.deviceId){

                found = true;

                console.log("Found : " + v[i].index, "must replace this element")
                v[i].type = this.state.deviceType;
                v[i].home = this.state.deviceHomeId;
                v[i].group = this.state.deviceGroup;
                v[i].name = this.state.deviceName;
            }
        }

        if (!found) {

            v.push({
                index: parseInt(this.state.deviceId),
                type: this.state.deviceType,
                home: this.state.deviceHomeId,
                group: this.state.deviceGroup,
                name: this.state.deviceName,
                variable: "value"
            })
        }

        console.log(v);

        this.post("/serial/addConfig", JSON.stringify(v));
    }

    formDeviceIdChanged(event) {
        
        this.state.deviceId = event.target.value
        this.setState({ deviceId: event.target.value })
        console.log("Device deviceId " + this.state.deviceId)
    }

    formDeviceTypeChanged(event) {

        this.state.deviceType = event.target.value
        this.setState({ deviceType: event.target.value })
        console.log("Device deviceType " + this.state.deviceType)
    }

    formDeviceHomeIDChanged(event) {
        
        this.state.deviceHomeId = event.target.value
        this.setState({ deviceHomeId: event.target.value })
        console.log("Device deviceHomeId " + this.state.deviceHomeId)
    }

    formDeviceGroupChanged(event) {
        
        this.state.deviceGroup = event.target.value
        this.setState({ deviceGroup: event.target.value })
        console.log("Device deviceGroup " + this.state.deviceGroup)
    }

    formDeviceNameChanged(event) {
        
        this.state.deviceName = event.target.value
        this.setState({ deviceName: event.target.value })
        console.log("Device deviceName " + this.state.deviceName)
    }
        
    setCurrentVariable(index) {

        console.log(index)

        const v = this.state.serials;

        for (var i = 0; i < v.length; i++) {


            if (v[i].index === index){

                console.log("Found : " + v[i].index)
                this.setState({ deviceId: v[i].index })
                this.setState({ deviceType: v[i].type })
                this.setState({ deviceHomeId: v[i].home })
                this.setState({ deviceGroup: v[i].group })
                this.setState({ deviceName: v[i].name })
            }
        }
    }

    deleteCurrentVariable(index) {

        console.log(index)

        var n = [];
        const v = this.state.serials;

        for (var i = 0; i < v.length; i++) {

            if (v[i].index != index){

                n.push(v[i])
            }
        }

        this.post("/serial/addConfig", JSON.stringify(n));
    }

    // Render
    render() {

        const me = this;
        const { serials } = this.state;

        return (
            <div style={MainAreaStyle.p100}>

                <span style={MainAreaStyle.toolBar}>
                    <img key="bt_ok" style={mainStyle.menuIcon} src="/admin/static/add.png" width="20" height="20" draggable="false" onClick={this.sendConfig}/>
                </span>

                <table style={MainAreaStyle.table}>
                    <col width="100px" />
                    <col />
                    <tr>
                        <td>ID</td>
                        <td></td>
                        <td><input type="number" min="0" max="100" value={this.state.deviceId} onChange={this.formDeviceIdChanged} onBlur={this.formDeviceIdChanged}></input></td>
                    </tr>
                    <tr>
                        <td style={MainAreaStyle.item}>Type</td>
                        <td> </td>
                        <td align="right">
                            <select key="ip_type" value={this.state.deviceType} onChange={this.formDeviceTypeChanged} onBlur={this.formDeviceTypeChanged}>
                                <option value="switch">Switch</option>
                                <option value="light">Light</option>
                                <option value="dimmer">Dimmer</option>
                                <option value="shutter">Shutter</option>
                                <option value="position">Position</option>
                                <option value="occupancy">Occupancy</option>
                                <option value="time">Time</option>
                                <option value="climate">Climate</option>
                                <option value="power">Power</option>
                                <option value="audio">Audio Controler</option>
                                <option value="analog">Analog Sensor (Any number)</option>
                                <option value="digital">Digital Sensor (0-1)</option>
                                <option value="text">Text</option>
                                <option value="custom">Custom (None of the above)</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td style={MainAreaStyle.item}>Home ID</td>
                        <td> </td>
                        <td><input key="ip_homeId" style={mainStyle.inputStyle} type="text" value={this.state.deviceHomeId} onChange={this.formDeviceHomeIDChanged} onBlur={this.formDeviceHomeIDChanged}/></td>
                    </tr>
                    <tr>
                        <td style={MainAreaStyle.item}>Group</td>
                        <td> </td>
                        <td><input key="ip_group" style={mainStyle.inputStyle} type="text" value={this.state.deviceGroup} onChange={this.formDeviceGroupChanged} onBlur={this.formDeviceGroupChanged}/></td>
                    </tr>
                    <tr>
                        <td style={MainAreaStyle.item}>Name</td>
                        <td> </td>
                        <td><input key="ip_name" style={mainStyle.inputStyle} type="text" value={this.state.deviceName} onChange={this.formDeviceNameChanged} onBlur={this.formDeviceNameChanged}/></td>
                    </tr>
                </table>

                <div style={MainAreaStyle.MainAreaList}>
                    {serials && serials.map(function(serial){

                            return (
                                <div style={MainAreaStyle.panel} onClick={() => me.setCurrentVariable(serial.index)}>

                                    <span style={MainAreaStyle.toolBar}>
                                        <img key={"bt_del_" + serial.index} style={mainStyle.menuIcon} src="/admin/static/delete.png" width="20" height="20" draggable="false" onClick={() => me.deleteCurrentVariable(serial.index)}/>
                                    </span>


                                    <div style={MainAreaStyle.zbid}> {serial.index}</div>
                    
                                    <table style={MainAreaStyle.table}>
                                        <col width="100px" />
                                        <col />
                                        <col />
                                        <tr>
                                            <td style={MainAreaStyle.item}>Home</td>
                                            <td> </td>
                                            <td>{serial.home}</td>
                                        </tr>
                                        <tr>
                                            <td style={MainAreaStyle.item}>Group</td>
                                            <td> </td>
                                            <td>{serial.group}</td>
                                        </tr>
                                        <tr>
                                            <td style={MainAreaStyle.item}>Name</td>
                                            <td> </td>
                                            <td>{serial.name}</td>
                                        </tr>
                                        <tr>
                                            <td style={MainAreaStyle.item}>Type</td>
                                            <td> </td>
                                            <td>{serial.type}</td>
                                        </tr>
                                    </table>
                                </div>
                            )
                        }
                    )}
                </div>
            </div>
        )
    }
}

/* Export */

MainArea = Radium(MainArea);
export default connect(mapStateToProps)(MainArea);
