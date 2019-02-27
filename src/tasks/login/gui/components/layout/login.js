import Link from 'next/link'
import fetch from 'isomorphic-unfetch'
import { connect } from 'react-redux';

import MainArea from './login/mainarea.js'

import mainStyle from '../../styles/global.js'

const htmlStyle = {
    backgroundColor: mainStyle.mainBackgroundColor
}

const layoutStyle = {
    display: 'block',
    position: 'fixed',
    height: 'auto',
    bottom:0,
    top:0,
    left:0,
    right:0,
    color: mainStyle.textColor,
    backgroundColor: mainStyle.mainBackgroundColor
}

class Login extends React.Component {

    constructor(props) {
        super(props);
    }

    async componentDidMount() {

    }

    render() {

        return (
            <div style={htmlStyle}>
                <style global jsx>{`
                  html,
                  body,
                  body > div:first-child,
                  div#__next,
                  div#__next > div,
                  div#__next > div > div {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                  }
                `}</style>

                <div style={layoutStyle}>
                    <MainArea />
                </div>
            </div>
        )
    }
}

Login = connect()(Login)

export default connect()(Login)
