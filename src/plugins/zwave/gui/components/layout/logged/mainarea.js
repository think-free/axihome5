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
        marginTop: 50,
        height: 'calc(100% - 50px)',
        width: '100%',
        fallbacks: [
            { height: '-moz-calc(100% - 50px)' },
            { height: '-webkit-calc(100% - 50px)' },
            { height: '-o-calc(100% - 50px)' }
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
            zbdevs: [],
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
        var url = "/zwave/getAll"

        fetch(url)
        .then(response => response.json())
        .then(data => this.setState({ zbdevs: data }))
    }

    // Render
    render() {

        const me = this;
        const { zbdevs } = this.state;

        return (
            <div style={MainAreaStyle.p100}>
                <div style={MainAreaStyle.MainAreaList}>
                    {zbdevs && zbdevs.map(function(zb){

                            if (zb.Name == "" || zb.Group == "" || zb.HomeID == "") {
                                return (
                                    <ZWDevice zb={zb}/>
                                )
                            } else {
                                return (null)
                            }
                        }
                    )}
                </div>
            </div>
        )
    }
}

class ZWDevice extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

            edited : false,
            name : "",
            group : "",
            home : ""
        };

        const zb = this.props.zb;

        this.state.name = zb.Name;
        this.formNameChanged=this.formNameChanged.bind(this);

        this.state.group = zb.Group;
        this.formGroupChanged=this.formGroupChanged.bind(this);

        this.state.home = zb.HomeID;
        this.formHomeChanged=this.formHomeChanged.bind(this);

        this.sendDevice=this.sendDevice.bind(this);
        this.renderSendIcon=this.renderSendIcon.bind(this);
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

    formNameChanged(event) {

        this.setState({ edited: true });
        this.state.name = event.target.value;
        this.setState({ name: event.target.value });
        console.log("Device name " + this.state.name);
    }

    formGroupChanged(event) {

        this.setState({ edited: true });
        this.state.group = event.target.value;
        this.setState({ group: event.target.value });
        console.log("Device group " + this.state.group);
    }

    formHomeChanged(event) {

        this.setState({ edited: true });
        this.state.home = event.target.value;
        this.setState({ home: event.target.value });
        console.log("Device home " + this.state.home);
    }

    sendDevice() {
        this.post("/zwave/setDeviceConfig", JSON.stringify(
            {
                ZwaveID: this.props.zb.ZwaveID,
                Name: this.state.name,
                Group: this.state.group,
                HomeID: this.state.home,
                DeviceType: this.props.zb.DeviceType
            }
        ))
    }

    render () {

        const zb = this.props.zb;

        return (

            <div style={MainAreaStyle.panel}>

                {this.renderSendIcon()}

                <div style={MainAreaStyle.zbid}> {zb.ZigbeeID}</div>

                <table style={MainAreaStyle.table}>
                    <col width="100px" />
                    <col />
                    <col />
                    <tr>
                        <td style={MainAreaStyle.item}>Type</td>
                        <td> </td>
                        <td>{zb.DeviceType}</td>
                    </tr>
                    <tr>
                        <td style={MainAreaStyle.item}>Name</td>
                        <td> </td>
                        <td><input key={zb.ZigbeeID + "Name"} style={mainStyle.inputStyle} type="text" value={this.state.name} onChange={this.formNameChanged} onBlur={this.formNameChanged}/></td>
                    </tr>
                    <tr>
                        <td style={MainAreaStyle.item}>Group</td>
                        <td> </td>
                        <td><input key={zb.ZigbeeID + "Group"} style={mainStyle.inputStyle} type="text" value={this.state.group} onChange={this.formGroupChanged} onBlur={this.formGroupChanged}/></td>
                    </tr>
                    <tr>
                        <td style={MainAreaStyle.item}>HomeID</td>
                        <td> </td>
                        <td><input key={zb.ZigbeeID + "HomeID"} style={mainStyle.inputStyle} type="text" value={this.state.home} onChange={this.formHomeChanged} onBlur={this.formHomeChanged}/></td>
                    </tr>
                </table>
            </div>
        )
    }

    renderSendIcon() {

        if (this.state.edited){

            return (
                <span style={MainAreaStyle.toolBar}>
                    <img key={"bt_ok_" + this.props.zb.ZigbeeID} style={mainStyle.menuIcon} src="/admin/static/ok.png" width="20" height="20" draggable="false" onClick={this.sendDevice}/>
                </span>
            )
        } else {
            return (null)
        }
    }
  }

/* Export */

MainArea = Radium(MainArea);
ZWDevice = Radium(ZWDevice);
export default connect(mapStateToProps)(MainArea);
