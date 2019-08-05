import React from 'react'

import './App.css'

import Landing from './Landing.js'
import Home from './Home.js'
import GraphicsMain from './GraphicsMain.js'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import NavBar from './NavBar.js'
import { Provider } from 'react-redux'
import store from './store'
import jwt_decode from 'jwt-decode'
import setAuthToken from './utils/setAuthToken'
import { setCurrentUser, logoutUser } from './actions/authActions'
import Profile from './Profile.jsx'
import RoadmapView from './RoadmapView.jsx'
import PrivateRoute from './PrivateRoute.js'
import AuthorView from './AuthorView.jsx'
import SearchView from './SearchView.jsx'

if (localStorage.jwtToken) {
    //this means, we have stored jwtToekn before (aka we are logged in)
    const token = localStorage.jwtToken
    setAuthToken(token)
    const decoded = jwt_decode(token)
    store.dispatch(setCurrentUser(decoded))

    const currentTime = Date.now() / 1000
    if (decoded.exp < currentTime) {
        store.dispatch(logoutUser())

        window.location.href = '/home/featured'
    }
}

if (
    window.location.pathname === '' ||
    window.location.pathname === '/home' ||
    window.location.pathname === '/'
) {
    window.location.href = '/home/featured'
}
function App() {
    return (
        <Provider store={store}>
            <Router>
                <React.Fragment>
                    <Switch>
                        <Route path="/roadmap" component={RoadmapView} />
                        <PrivateRoute path="/profile" component={Profile} />
                        <PrivateRoute path="/create" component={GraphicsMain} />
                        <Route path="/user" component={AuthorView} />
                        <Route path="/" component={NavBar} />
                    </Switch>
                    <Switch>
                        <Route path="/search" component={SearchView} />
                        <Route path="/home" component={Home} />
                    </Switch>
                </React.Fragment>
            </Router>
        </Provider>
    )
}

export default App
