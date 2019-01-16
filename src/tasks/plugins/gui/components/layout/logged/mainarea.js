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
        float: 'right'
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
    }
}

const mapStateToProps = (state) => {
    return {
        storeShow: state.storeShow
    }
}

class MainArea extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            plugins: [],
            store: [],
            storeShow: false
        };

        this.addPlugin=this.addPlugin.bind(this);
        this.showPlugins=this.showPlugins.bind(this);
        this.tooglePluginState=this.tooglePluginState.bind(this);
        this.downloadPluginFromStore=this.downloadPluginFromStore.bind(this);
    }

    async componentDidMount() {

        this.getData();
        this.getStoreContent();

        // Periodicaly refresh states
        this.interval = setInterval(() => {
            this.getData();
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    async getData(url){
        var url = "/plugins/getAll"

        fetch(url)
        .then(response => response.json())
        .then(data => this.setState({ plugins: data }))
    }

    async getStoreContent(){

        var url = "/plugins/getStoreContent"

        fetch(url)
        .then(response => response.json())
        .then(data => this.setState({ store: data }))
    }

    async downloadPluginFromStore(name){

        var url = "/plugins/downloadPluginFromStore?plugin=" + name

        fetch(url)
    }

    addPlugin() {

        this.props.dispatch(setValue("storeShow", true));
    }

    showPlugins() {

        this.props.dispatch(setValue("storeShow", false));
    }

    tooglePluginState(name, disabled) {

        if (disabled) {
            fetch("/plugins/enablePlugin?plugin=" + name)
        } else {
            fetch("/plugins/disablePlugin?plugin=" + name)
        }
    }

    // Render
    render() {

        const me = this;
        const storeShow = this.props.storeShow;
        const { plugins } = this.state;
        const { store } = this.state;

        if (storeShow)

            return (
                <div style={MainAreaStyle.p100}>
                    <span style={MainAreaStyle.toolBar}>
                        <div style={mainStyle.menuIcon} onClick={me.showPlugins}>Close store</div>
                    </span>
                    <div style={MainAreaStyle.MainAreaList}>
                        {store.map(function(plugin){
                            return (
                                <div onClick={() => me.downloadPluginFromStore(plugin.Url)}>{plugin.Name}</div>
                            )
                        })}
                    </div>
                </div>
            )
        else
            return (
                <div style={MainAreaStyle.p100}>
                    <span style={MainAreaStyle.toolBar}>
                        <img key="bt_add" style={mainStyle.menuIcon} src="/plugins/static/add.png" width="20" height="20" draggable="false" onClick={me.addPlugin}/>
                    </span>

                    <div style={MainAreaStyle.MainAreaList}>
                        {plugins.map(function(plugin){

                            let status = plugin.disabled ? "/plugins/static/disabled.png" : "/plugins/static/enabled.png"
                            return (

                                    <div style={MainAreaStyle.cellStyle}>
                                        <div style={MainAreaStyle.cellContent} key={plugin.name} onClick={() => me.tooglePluginState(plugin.name, plugin.disabled)}>
                                            <img src={"/plugins/getIcon?plugin=" + plugin.name} alt={plugin.name} width="64" height="64" />
                                            <div style={MainAreaStyle.plugin}>{plugin.name}</div>
                                            <img src={status} width="32" height="32" />
                                        </div>
                                    </div>

                            )
                        })}
                    </div>
                </div>
            )
    }
}

/* Export */

MainArea = Radium(MainArea);
export default connect(mapStateToProps)(MainArea);
