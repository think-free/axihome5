import React from 'react'
import { connect } from 'react-redux'
import { setValue } from '../../redux/store.js'
import Iframe from 'react-iframe'

import Devices from "./mainarea/devices.js"
import Variables from "./mainarea/variables.js"
import Users from "./mainarea/users.js"

import mainStyle from '../../../styles/global.js'

const layoutStyle = {
    position: 'fixed',
    height: 'calc(100%-300px)',
    width: 'auto',
    top:mainStyle.headerHeight + 20,
    left:mainStyle.menuWidth + 20,
    bottom:20,
    right:20,
    color: mainStyle.textColor
}

const mapStateToProps = (state) => {
    return {
        currentSection: state.currentSection
    }
}

class MainArea extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        };

        this.buttonClick=this.buttonClick.bind(this);
    }

    buttonClick(e) {
        this.props.dispatch(setValue("MainArea", "clicked"));
    }

    render() {

        const currentSection = this.props.currentSection

        if (currentSection != undefined) {

            if (currentSection.url != "internal"){

                var currentUrl = window.location.href;
                var arr = currentUrl.split("/");
                var url = arr[0] + "//" + arr[2] + "/" + currentSection.url;

                return (
                  <div style={layoutStyle}>
                    <Iframe url={url}
                        width="100%"
                        height="100%"
                        id="apllicationFrame"
                        className="myClassname"
                        display="initial"
                        position="relative"
                        allowFullScreen
                        name="mainAreaFrame"/>
                  </div>
                );
            } else {

                if (currentSection.name == "Devices") {
                    return (
                        <div style={layoutStyle}>
                            <Devices/>
                        </div>
                    )

                } else if (currentSection.name == "Variables") {
                    return (
                        <div style={layoutStyle}>
                            <Variables/>
                        </div>
                    )
                } else if (currentSection.name == "Users") {
                    return (
                        <div style={layoutStyle}>
                            <Users/>
                        </div>
                    )
                } else {
                    return (
                        <div style={layoutStyle}>
                        </div>
                    )
                }
            }


        } else {
            return (
                <div style={layoutStyle}>
                </div>
            )
        }
    }
}

export default connect(mapStateToProps)(MainArea);
