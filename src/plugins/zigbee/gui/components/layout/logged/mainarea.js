import React from 'react'
import Radium from 'radium';
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
        var url = "/zigbee/getAll"

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

                            return (
                                <div style={MainAreaStyle.panel}>
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
                                            <td><input style={mainStyle.inputStyle} type="text" value={zb.Name}/></td>
                                        </tr>
                                        <tr>
                                            <td style={MainAreaStyle.item}>Group</td>
                                            <td> </td>
                                            <td><input style={mainStyle.inputStyle} type="text" value={zb.Group}/></td>
                                        </tr>
                                        <tr>
                                            <td style={MainAreaStyle.item}>HomeID</td>
                                            <td> </td>
                                            <td><input style={mainStyle.inputStyle} type="text" value={zb.HomeID}/></td>
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
