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
        textTransform: 'capitalize',
        fontSize: "1.1em",
        textDecoration: "underline"
    },
    version : {
        color: mainStyle.textDarkerColor,
        paddingLeft: 10,
        display:"inline-block",
        textAlign: 'center',
        userSelect:"none",
        fontSize: "0.8em"
    },
    menuIcon : {
        float: 'right'
    },
    description : {
        padding: 10,
        color: mainStyle.textDarkerColor,
        marginLeft: 50,
        marginRight: 50
    },
    pluginOk : {
        paddingTop: 10,
        paddingRight: 20,
        paddingBottom: 10,
        paddingLeft: 20
    },
    bookmark : {
        position: 'absolute',
        top: 5,
        right: 5,
        float: 'right',
        paddingTop: 5,
        paddingRight: 5,
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
            storeShow: false,
            currentFilter: ""
        };

        this.addPlugin=this.addPlugin.bind(this);
        this.showPlugins=this.showPlugins.bind(this);
        this.tooglePluginState=this.tooglePluginState.bind(this);
        this.toogleBookmark=this.toogleBookmark.bind(this);
        
        this.goToPluginPage=this.goToPluginPage.bind(this);
        
        this.deletePlugin=this.deletePlugin.bind(this);
        this.downloadPluginFromStore=this.downloadPluginFromStore.bind(this);

        this.currentFilterChanged=this.currentFilterChanged.bind(this);

    }

    async componentDidMount() {

        this.getData();
        this.getStoreContent();

        // Periodicaly refresh states
        this.interval = setInterval(() => {
            this.getData();
            this.getStoreContent();
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

    goToPluginPage(name) {
        /*var currentUrl = window.location.href;
        var arr = currentUrl.split("/");
        var url = arr[0] + "//" + arr[2] + "/" + name
        location.href=url
        console.log(name + " -> " + url)*/
        window.parent.postMessage(name,window.location.href);
    }

    toogleBookmark (name) {
        fetch("/core/toogleTaskBookmark?name=" + name)
    }

    deletePlugin(name) {
        fetch("/plugins/deletePlugin?plugin=" + name)
    }

    currentFilterChanged(event) {

        this.setState({ currentFilter: event.target.value })
    }

    // Render
    render() {

        const me = this;
        const storeShow = this.props.storeShow;
        const { plugins } = this.state;
        const { store } = this.state;
        let { currentFilter } = this.state;

        if (currentFilter == "")
            currentFilter = ".*"

        /* STORE */
        if (storeShow)

            return (
                <div style={MainAreaStyle.p100}>
                    <span style={MainAreaStyle.toolBar}>
                        {/*<input key="filter" style={mainStyle.inputStyle} type="text" value={this.state.currentFilter} onChange={this.currentFilterChanged} onBlur={this.currentFilterChanged}/> !!! WTF CSS POSITION ¡¡¡*/}
                        <img key="bt_add" style={mainStyle.menuIcon} src="/plugins/static/close.png" width="20" height="20" draggable="false" onClick={me.showPlugins}/>
                    </span>
                    <div style={MainAreaStyle.MainAreaList}>
                        {store && store.map(function(plugin){

                            if (plugin.Name.match("^" + currentFilter)){

                                let img = "/plugins/static/download.png";
                                let fct = function(){me.downloadPluginFromStore(plugin.Url)};
                                let showActionIcon = true;
                                let showDeleteIcon = false;

                                if (plugin.Installed) {
                                    if (!plugin.UpToDate){
                                        img = "/plugins/static/update.png";
                                        fct = function(){me.downloadPluginFromStore(plugin.Url)};
                                        showDeleteIcon = true;
                                    } else {
                                        img = "/plugins/static/ok.png";
                                        fct = null;
                                        showActionIcon = false;
                                        showDeleteIcon = true;
                                    }
                                }

                                return (
                                    <div style={MainAreaStyle.panel}>
                                        <img style={MainAreaStyle.icon} src={plugin.Icon} alt="devices" width="20" height="20" draggable="false"/>
                                        <span style={MainAreaStyle.name}> {plugin.Name}</span>
                                        <span style={MainAreaStyle.version}> {plugin.Version}</span>
                                        <div style={MainAreaStyle.menuIcon}>
                                            {(() => {
                                                if (showDeleteIcon) {
                                                    return (<img key={plugin.Name + "_del"} style={mainStyle.menuIcon} src="/plugins/static/delete.png" alt="delete" width="20" height="20" draggable="false" onClick={() => me.deletePlugin(plugin.Name)}/>)
                                                }
                                                else {
                                                    return (null)
                                                }
                                            })()}

                                            {(() => {
                                                if (showActionIcon) {
                                                    return (<img key={plugin.Name + "_action"} style={mainStyle.menuIcon} src={img} alt="devices" width="20" height="20" draggable="false" onClick={fct}/>)
                                                }
                                                else {
                                                    return (<img style={MainAreaStyle.pluginOk} src={img} alt="devices" width="20" height="20" draggable="false"/>)
                                                }
                                            })()}
                                        </div>

                                        <div style={MainAreaStyle.description}> {plugin.Description} </div>
                                    </div>
                                )
                            } else {
                                return(null)
                            }
                        })}
                    </div>
                </div>
            )
        /* NOT STORE */
        else
            return (
                <div style={MainAreaStyle.p100}>
                    <span style={MainAreaStyle.toolBar}>
                        <img key="bt_add" style={mainStyle.menuIcon} src="/plugins/static/store.png" width="20" height="20" draggable="false" onClick={me.addPlugin}/>
                    </span>

                    <div style={MainAreaStyle.MainAreaList}>
                        {plugins && plugins.map(function(plugin){

                            let status = plugin.disabled ? "/plugins/static/disabled.png" : "/plugins/static/enabled.png"
                            let bookmarkImage = plugin.hasgui ? "/plugins/static/bookmark.png" : "/plugins/static/bookmark-disabled.png"
                            return (

                                    <div style={MainAreaStyle.cellStyle}>
                                        <div style={MainAreaStyle.cellContent} key={plugin.name} >
                                            <img src={bookmarkImage} style={MainAreaStyle.bookmark} width="15" height="15" onClick={() => me.toogleBookmark(plugin.name)} />
                                            <img src={"/plugins/getIcon?plugin=" + plugin.name} alt={plugin.name} width="64" height="64" onClick={() => me.goToPluginPage(plugin.name)} />
                                            <div style={MainAreaStyle.plugin}>{plugin.name}</div>
                                            <img src={status} width="32" height="32" onClick={() => me.tooglePluginState(plugin.name, plugin.disabled)} />
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
