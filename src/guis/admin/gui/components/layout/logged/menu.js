import React from 'react'
import Radium from 'radium';
import { connect } from 'react-redux'
import { setValue } from '../../redux/store.js'

import mainStyle from '../../../styles/global.js'


/* Menu */

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

const listStyle = {
    listStyleType: 'none',
    margin: 7,
    padding: 0,
    marginTop: 50,
    width: mainStyle.menuWidth + 50,
    overflowY: 'auto'
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
        this.props.dispatch(setValue("Menu", "clicked"));
    }

    render() {
        const { sections } = this.state;

        return (
          <div style={layoutStyle}>
              <ul style={listStyle}>

                  <ElementList section={{"name": "Devices", "url": "internal"}}>
                    <img src="/admin/static/devices.png" alt="devices" width="35" height="35" draggable="false"/>
                  </ElementList>

                  <ElementList section={{"name": "Variables", "url": "internal"}}>
                    <img src="/admin/static/variables.png" alt="variables" width="35" height="35" draggable="false"/>
                  </ElementList>

                  {sections.map(function(section){
                      let im = "/"+section.url+"/static/icon.png"

                      if (section.url != "admin"){

                          return (
                              <ElementList section={section}>
                                <img src={im} alt={section.name} width="35" height="35" draggable="false"/>
                              </ElementList>
                          )

                      } else {

                          return (null);
                      }

                  })}
              </ul>
          </div>
        );
    }
}

/* Menu element */

const listElement = {
    cursor: "pointer",
    userSelect: "pointer",
    border: mainStyle.interactable,
    marginTop: 10,
    ':hover': {
      backgroundColor: mainStyle.menuBackgroundColor,
      borderRight: mainStyle.borderOrange,
      width: mainStyle.menuWidth
    }
}

const mapStateToPropsElementList = (state) => {
    return {
        currentTab: state.currentTab
    }
}

class ElementList extends React.Component {

    constructor(props) {
        super(props);

        this.handleClick=this.handleClick.bind(this); // For 'this' to be available in 'handleClick' function
    }

    handleClick(e) {
        this.props.dispatch(setValue("currentTab",this.props.section.name ));
        this.props.dispatch(setValue("currentSection",this.props.section ));
    }

    render(){

        return (
            <li onClick={this.handleClick} style={listElement}>
                {this.props.children}
            </li>
        )

    }
}

ElementList = Radium(ElementList);
ElementList = connect(mapStateToPropsElementList)(ElementList)

Menu = Radium(Menu);
export default connect(mapStateToProps)(Menu);
