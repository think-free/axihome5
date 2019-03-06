import React from 'react'
import Radium from 'radium';
import { connect } from 'react-redux'
import { setValue } from '../../../redux/store.js'

import mainStyle from '../../../../styles/global.js'

/* Devices */

const variablesStyle = {

    p100 : {
        height: '100%',
        display:'block'
    },
    toolBar : {
        position: 'relative',
        float: 'right'
    },
    variablesList : {
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
    panel : {
        color: mainStyle.textColor,
        marginTop: 10,
        minHeight: 40,
        padding: 10,
        width: "calc(100% - 30px)",
        backgroundColor: mainStyle.panelBackgroundColor
    },
    variable : {
        color: mainStyle.textItemColor
    },
    value : {
        position: 'absolute',
        paddingLeft: 10,
        paddingRight: 10,
        marginTop: 5,
        backgroundColor: mainStyle.mainBackgroundColor,
    },
    menuIcon : {
        float: 'right'
    }
}

const mapStateToProps = (state) => {
    return {
    }
}

class Variables extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            variables: [],
            currentFilter: ""
        };

        this.currentFilterChanged=this.currentFilterChanged.bind(this);
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
        var url = "/core/getValues"

        fetch(url)
        .then(response => response.json())
        .then(data => this.setState({ variables: data }))
    }

    currentFilterChanged(event) {

        this.setState({ currentFilter: event.target.value })
    }

    deleteVariable (key) {
        fetch("/core/deleteValue?key=" + key)
    }

    // Render
    render() {
        const { variables } = this.state;
        let { currentFilter } = this.state;
        if (currentFilter == "")
            currentFilter = ".*"

        const me = this;

        return (
            <div style={variablesStyle.p100}>
                <span style={variablesStyle.toolBar}>
                    <input key="filter" style={mainStyle.inputStyle} type="text" value={this.state.currentFilter} onChange={this.currentFilterChanged} onBlur={this.currentFilterChanged}/>
                </span>
                <div style={variablesStyle.variablesList}>
                    {variables && Array.isArray(variables) && variables.map(function(variable){

                        if (variable.key.match("^" + currentFilter)){

                            return (
                                <div style={variablesStyle.panel}>
                                    <span style={variablesStyle.menuIcon}>
                                        <img key={"bt_delete_" + variable.key} style={mainStyle.menuIcon} src="/admin/static/delete.png" alt="devices" width="20" height="20" draggable="false" onClick={() => me.deleteVariable(variable.key)}/>
                                    </span>
                                    <div style={variablesStyle.variable}>{variable.key}</div>
                                    <div style={variablesStyle.value}>{variable.value}</div>
                                </div>
                            )

                        } else {

                            return(null)
                        }
                    })}
                </div>
            </div>
        )
    }
}

/* Export */

Variables = Radium(Variables);
export default connect(mapStateToProps)(Variables);
