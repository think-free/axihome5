
import { createStore } from 'redux'
import { Provider }  from 'react-redux'

import Store from '../components/redux/store.js'
import { setValue } from '../components/redux/store.js'
import Login from '../components/layout/login.js'
import Logged from '../components/layout/logged.js'

const store = createStore(Store);
const StoreContext = React.createContext();

class Index extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            logged: true
        };
    }

    async componentDidMount() {
        
    }

    render() {

        if (this.state.logged){
            return (
                <div>
                    <Provider store={store}>
                        <StoreContext.Provider store={store}>
                            <Logged />
                        </StoreContext.Provider>
                    </Provider>
                </div>
                
            )
        } else {
            return (
                <div>
                    <Provider store={store}>
                        <StoreContext.Provider store={store}>
                            <Login />
                        </StoreContext.Provider>
                    </Provider>
                </div>
            )
        }
    }
}

export default Index
