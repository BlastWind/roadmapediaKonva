import React, { Component } from "react";
import "./NavBar.css";
import {
  Container,
  Divider,
  Dropdown,
  Grid,
  Header,
  Icon,
  List,
  Menu,
  Segment,
  Visibility,
  Modal,
  Form,
  Checkbox,
  Button,
  Message
} from "semantic-ui-react";
import logo from "./logo.png";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  registerUser,
  loginUser,
  setRegistrationStatus,
  setLoginStatus,
  clearErrors,
  logoutUser,
  setModalState
} from "./actions/authActions";
import classnames from "classnames";
import R from "./R.png";

import "./NavBar.css";
import axios from "axios";
import userIcon from "./defaultUser.jpg";
import LoginModal from "./LoginModal.jsx";
class NavBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      emailInputTextMoved: false,
      password: "",
      email: ""
    };
  }

  componentDidUpdate() {
    console.log("wo cao");
  }

  componentWillReceiveProps(nextProps) {
    console.log("hi");
    if (
      nextProps.history.location.state &&
      nextProps.history.location.pathname === "/home"
    ) {
      console.log("hi2");
    }

    if (JSON.stringify(this.props) !== JSON.stringify(nextProps)) {
      console.log(nextProps);
      if (nextProps.auth.loginStatus === "loginCompleted") {
        this.props.setModalState(false);
      }

      if (Object.keys(nextProps.errors).length > 0) {
        console.log(nextProps.errors);
        this.setState({
          errors: true
        });
        console.log("there are errors");
        this.props.setRegistrationStatus("notRegistering");
        this.props.setLoginStatus("notLogging");
      }
      if (nextProps.auth.registrationStatus === "registrationCompleted") {
        this.props.setRegistrationStatus("notRegistering");
        this.setState({ modalMode: "login" });
      }
    }
  }
  handleTriggerClick = () => {
    this.props.setModalState(true);
    this.setState({ modalMode: "login" });
  };

  closeModal = () => {
    this.props.setModalState(false);
  };

  handleRegister = () => {
    this.props.setRegistrationStatus("registrationLoading");

    this.props.registerUser({
      name: document.getElementById("usernameRegister").value,
      email: document.getElementById("emailRegister").value,
      password: document.getElementById("passwordRegister1").value,
      password2: document.getElementById("passwordRegister2").value
    });
  };

  handleLogin = () => {
    this.props.setLoginStatus("loginLoading");
    this.props.loginUser({
      email: document.getElementById("emailLogin").value,
      password: document.getElementById("passwordLogin").value
    });
    this.props.history.push("/home");
  };

  handleLogout = () => {
    this.props.logoutUser();
    this.props.history.push("/");
    this.props.setLoginStatus("notLogging");
  };

  arrayBufferToBase64 = buffer => {
    var binary = "";
    var bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach(b => (binary += String.fromCharCode(b)));
    return window.btoa(binary);
  };
  render() {
    const fixedMenuStyle = {
      backgroundColor: "#fff",
      border: ".5px solid #ffffff"
    };
    const imageStyle = {
      height: "3.5rem",
      width: "auto"
    };
    const white = {
      color: "grey",
      fontFamily: "Saira, sans-serif",

      paddingBottom: ".75rem"
    };
    const dropDown = {
      color: "grey",
      fontFamily: "Saira, sans-serif",
      paddingRight: "1.25rem",
      paddingBottom: ".75rem"
    };
    let RegisterButton;
    let loginButton;
    if (this.props.auth.registrationStatus === "notRegistering") {
      RegisterButton = (
        <Button
          id="loginButton"
          fluid
          size="large"
          onClick={() => {
            this.handleRegister();
          }}
        >
          Register
        </Button>
      );
    }
    if (this.props.auth.registrationStatus === "registrationLoading") {
      RegisterButton = (
        <Button style={{ backgroundColor: "grey" }} fluid size="large">
          <span style={{ color: white }}>Loading</span>
        </Button>
      );
    }
    if (this.props.auth.loginStatus === "notLogging") {
      loginButton = (
        <Button
          id="loginButton"
          fluid
          size="large"
          onClick={() => {
            this.handleLogin();
          }}
        >
          <span>Login</span>
        </Button>
      );
    }
    if (this.props.auth.loginStatus === "loginLoading") {
      loginButton = (
        <Button fluid size="large" style={{ backgroundColor: "grey" }}>
          <span style={{ color: white }}>Loading</span>
        </Button>
      );
    }

    const LoginForm = () => (
      <Grid
        textAlign="center"
        style={{ height: "75vh" }}
        verticalAlign="middle"
      >
        <Grid.Column>
          <Header as="h1" color="white" textAlign="center">
            {this.state.errors ? (
              <span style={{ color: "white" }}>Didn't work, try again?</span>
            ) : (
              <span style={{ color: "white" }}>Welcome back!</span>
            )}
          </Header>
          <Form size="large">
            <Segment stacked>
              <Form.Input
                id="emailLogin"
                fluid
                placeholder="Email"
                icon="mail"
                iconPosition="left"
              />
              <Form.Input
                id="passwordLogin"
                fluid
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                type="password"
              />

              {loginButton}
            </Segment>
          </Form>
          <Message>
            New to us?{" "}
            <a
              onClick={() => {
                this.props.clearErrors();
                this.setState({ modalMode: "register", errors: false });
              }}
            >
              Sign Up
            </a>
          </Message>
        </Grid.Column>
      </Grid>
    );

    const RegisterForm = () => (
      <Grid
        textAlign="center"
        style={{ height: "80vh" }}
        verticalAlign="middle"
      >
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" color="white" textAlign="center">
            {this.state.errors ? (
              <span
                style={{ position: "relative", color: "white", top: "1.5rem" }}
              >
                Didn't work, try again?
              </span>
            ) : (
              <span
                style={{ position: "relative", color: "white", top: "1.5rem" }}
              >
                Hello!
              </span>
            )}
          </Header>
          <Form size="large">
            <Segment stacked>
              <Form.Input
                id="usernameRegister"
                fluid
                icon="user"
                iconPosition="left"
                placeholder="username"
              />

              <Form.Input
                id="emailRegister"
                fluid
                icon="mail"
                iconPosition="left"
                placeholder="E-mail address"
              />
              <Form.Input
                id="passwordRegister1"
                fluid
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                type="password"
              />
              <Form.Input
                id="passwordRegister2"
                fluid
                icon="lock"
                iconPosition="left"
                placeholder="Confirm password"
                type="password"
              />

              {RegisterButton}
            </Segment>
          </Form>
          <Message>
            Already have an account?{" "}
            <a
              onClick={() => {
                this.props.clearErrors();
                this.setState({ modalMode: "login", errors: false });
              }}
            >
              Login
            </a>
          </Message>
        </Grid.Column>
      </Grid>
    );

    let profilePicSrc;
    if (this.props.auth.isAuthenticated) {
      if (
        this.props.auth.user.profilePic &&
        this.props.auth.user.profilePic.default
      ) {
        profilePicSrc = userIcon;
      } else {
        var imgStr = this.arrayBufferToBase64(
          this.props.auth.user.profilePic.buffer.data
        );
        var base64Flag = "data:image/jpeg;base64,";
        profilePicSrc = base64Flag + imgStr;
      }
    }

    return (
      <div id="NavBar">
        <LoginModal />

        <Menu borderless style={fixedMenuStyle}>
          <Menu.Item>
            <Link to="/">
              <img style={imageStyle} size="mini" src={logo} />
            </Link>
          </Menu.Item>

          <Menu.Item style={white}>
            <Link to="/create" style={{ color: "grey" }}>
              Create
            </Link>
          </Menu.Item>

          <Menu.Menu position="right">
            {this.props.auth.isAuthenticated ? (
              <React.Fragment>
                <Menu.Item>
                  <img src={profilePicSrc} />
                </Menu.Item>
                <Menu.Item>
                  <Dropdown
                    style={dropDown}
                    text={this.props.auth.user.name}
                    pointing
                    className="link item"
                  >
                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() => {
                          this.props.history.push("/profile/edit");
                        }}
                      >
                        Profile
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          this.props.history.push("/profile/starred");
                        }}
                      >
                        Starred Roadmap
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          this.props.history.push("/profile/yourroadmaps");
                        }}
                      >
                        Your Roadmap
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          this.props.history.push("/profile/drafts");
                        }}
                      >
                        Draft
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={this.handleLogout}>
                        Logout
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Menu.Item>
              </React.Fragment>
            ) : (
              <Menu.Item as="a" style={white} onClick={this.handleTriggerClick}>
                Login
              </Menu.Item>
            )}
          </Menu.Menu>
        </Menu>
      </div>
    );
  }
}
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  {
    registerUser,
    loginUser,
    setRegistrationStatus,
    setLoginStatus,
    clearErrors,
    logoutUser,
    setModalState
  }
)(withRouter(NavBar));
