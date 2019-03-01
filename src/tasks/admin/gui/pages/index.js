import Link from 'next/link'
import fetch from 'isomorphic-unfetch'
import { createStore } from 'redux'
import { Provider }  from 'react-redux'

import Store from '../components/redux/store.js'
import { setValue } from '../components/redux/store.js'
import Login from '../components/layout/login.js'
import Logged from '../components/layout/logged.js'

import "../static/scrollbar.css"

const store = createStore(Store);

class Index extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            logged: true,
            loginInfo: {}
        };

        store.subscribe(() =>
            console.log(store.getState())
        )
    }

    async componentDidMount() {

        document.title = "Administration";

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
        var url = "/core/getLoginInfo"

        fetch(url)
        .then(response => response.json())
        .then(data => this.setState({ loginInfo: data }))

        if (this.state.loginInfo.type === "logout") {
            this.setState({ logged : false });
        } else {
            this.setState({ logged : true });
        }

        store.setValue("loginInfo", this.state.loginInfo);
    }

    render() {

        if (this.state.logged){
            return (
                <Provider store={store}>
                    <Logged />
                </Provider>
            )
        } else {
            return (
                <Provider store={store}>
                    <Login />
                </Provider>
            )
        }
    }
}

export default Index
