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
            MainArea: [],
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
        .then(data => this.setState({ MainArea: data }))
    }

    currentFilterChanged(event) {

        this.setState({ currentFilter: event.target.value })
    }

    // Render
    render() {
        const { MainArea } = this.state;
        let { currentFilter } = this.state;
        if (currentFilter == "")
            currentFilter = ".*"

        return (
            <div style={MainAreaStyle.p100}>
                <div style={MainAreaStyle.MainAreaList}>
                    {MainArea.map(function(variable){

                        if (variable.key.match("^" + currentFilter)){

                            return (
                                <div style={MainAreaStyle.panel}>
                                    <div style={MainAreaStyle.variable}>{variable.key}</div>
                                    <div style={MainAreaStyle.value}>{variable.value}</div>
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

MainArea = Radium(MainArea);
export default connect(mapStateToProps)(MainArea);
