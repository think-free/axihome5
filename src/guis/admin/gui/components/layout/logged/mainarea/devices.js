import React from 'react'
import Radium from 'radium';
import { connect } from 'react-redux'
import { setValue } from '../../../redux/store.js'

import mainStyle from '../../../../styles/global.js'


/* Devices */

const toolbarStyle = {
    display: 'block',
    height: 100,
    width: 100,
    color: mainStyle.textColor,
    border: mainStyle.border
}

const mapStateToProps = (state) => {
    return {
        Devices: state.Devices
    }
}

class Devices extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sections: [],
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
        var url = "/core/getTasks"

        fetch(url)
        .then(response => response.json())
        .then(data => this.setState({ sections: data }))
    }

    buttonClick(e) {
        this.props.dispatch(setValue("Devices", "clicked"));
    }

    render() {
        const { sections } = this.state;

        return (
          <div>
                <div style={toolbarStyle}> </div>
          </div>
        );
    }
}

Devices = Radium(Devices);
export default connect(mapStateToProps)(Devices);
