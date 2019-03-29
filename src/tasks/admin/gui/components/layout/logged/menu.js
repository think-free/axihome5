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
    backgroundColor: mainStyle.menuBackgroundColor,

    '@media (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait), (min-resolution: 192dpi) and (orientation: portrait)': {
        zoom : 2
    }
}

const listStyle = {
    listStyleType: 'none',
    //margin: 7,
    padding: 0,
    marginTop: 50,
    marginBottom: 50,
    width: mainStyle.menuWidth + 1,
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
        this.childEvent=this.childEvent.bind(this);
    }

    async componentDidMount() {

        this.getData();

        // Periodicaly refresh states
        this.interval = setInterval(() => {
            this.getData();
        }, 1000);

        window.addEventListener("message", this.childEvent,false);
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

    childEvent(e) {
        console.log('Parent received message!:  ', e.data);

        let ts = Math.round((new Date()).getTime() / 1000);
        let me = this;

        this.state.sections.map(function(section){

            if (section.url === e.data && section.lastseen + 90 > ts) {

                console.log("Openning section : " + e.data)
                me.props.dispatch(setValue("currentTab", section.name ));
                me.props.dispatch(setValue("currentSection", section ));
            }
        })
    }

    render() {
        const { sections } = this.state;

        if (sections.type === "logout") {
            return (null);
        } else {

            return (
                <div style={layoutStyle}>
                    <ul style={listStyle}>
      
                        <ElementList section={{"name": "Devices", "url": "internal"}}>
                          <img src="/admin/static/devices.png" alt="devices" width="35" height="35" draggable="false"/>
                        </ElementList>
      
                        <ElementList section={{"name": "Variables", "url": "internal"}}>
                          <img src="/admin/static/variables.png" alt="variables" width="35" height="35" draggable="false"/>
                        </ElementList>

                        <ElementList section={{"name": "Users", "url": "internal"}}>
                          <img src="/admin/static/users.png" alt="users" width="35" height="35" draggable="false"/>
                        </ElementList>      
                            
                              {sections && sections.type === undefined && sections.map(function(section){
                                  let im = "/"+section.url+"/static/icon.png"
                                  let ts = Math.round((new Date()).getTime() / 1000);
          
                                  if ( ((section.url != "admin" && section.url != "login" && section.bookmarked ) || section.url == "plugins") && section.lastseen + 90 > ts){
          
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
              )
        }
    }
}

/* Menu element */

const listElement = {
    cursor: "pointer",
    userSelect: "pointer",
    padding: 7,
    ':hover': {
      borderRight: mainStyle.borderOrange,
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
