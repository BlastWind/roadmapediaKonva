import React from "react";
import logo from "./logo.svg";
import "./App.css";
import react from "./react.svg";
import R from "./R.png";
import Landing from "./Landing.js";
import Home from "./Home.js";
import GraphicsMain from "./GraphicsMain.js";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  Switch
} from "react-router-dom";
import NavBar from "./NavBar.js";
import { Provider } from "react-redux";
import store from "./store";
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./actions/authActions";
import Profile from "./Profile.jsx";
import RoadmapView from "./RoadmapView.jsx";
import PrivateRoute from "./PrivateRoute.js";

if (localStorage.jwtToken) {
  //this means, we have stored jwtToekn before (aka we are logged in)
  const token = localStorage.jwtToken;
  setAuthToken(token);
  const decoded = jwt_decode(token);
  store.dispatch(setCurrentUser(decoded));

  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    store.dispatch(logoutUser());

    window.location.href = "/";
  }
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

            <Route path="/" component={NavBar} />
          </Switch>
          <Route exact path="/" component={Landing} />
          <Route exact path="/home" component={Home} />
        </React.Fragment>
      </Router>
    </Provider>
  );
}

export default App;
