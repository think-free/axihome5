import React from 'react'
import { connect } from 'react-redux'
import { setValue } from '../../redux/store.js'

import mainStyle from '../../../styles/global.js'

const layoutStyle = {
    display: 'block',
    position: 'fixed',
    height: 'auto',
    width: mainStyle.menuWidth,
    top:mainStyle.headerHeight,
    left:0,
    bottom:0,
    color: mainStyle.textColor,
    backgroundColor: mainStyle.menuBackgroundColor
}

const mapStateToProps = (state) => {
    return {
        Menu: state.Menu
    }
}

class Menu extends React.Component {
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
        }, 2000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    async getData(url){
        var url = "http://localhost:8080/core/getTasks"

        fetch(url)
        .then(response => response.json())
        .then(data => this.setState({ sections: data }))
    }

    buttonClick(e) {
        this.props.dispatch(setValue("Menu", "clicked"));
    }

    render() {
        const { sections } = this.state;

        return (
          <div style={layoutStyle}>
              <ul>
                  {sections.map(function(section){
                      return (
                          <li>AAA</li>
                      )
                  })}
              </ul>
          </div>
        );
    }
}

export default connect(mapStateToProps)(Menu);
