import React, { Component } from "react";
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
  Message,
  Transition
} from "semantic-ui-react";
import { Link, withRouter } from "react-router-dom";
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
import "./LoginModal.css";
class LoginModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalMode: "login",
      errorMsg: "",
      visible: true,
      hide: 500,
      show: 500,
      animating: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props) !== JSON.stringify(nextProps)) {
      //    console.log(nextProps);
      if (nextProps.auth.loginStatus === "loginCompleted") {
        this.props.setModalState(false);
      }

      if (Object.keys(nextProps.errors).length > 0) {
        console.log(nextProps.errors);
        this.setState({
          errorMsg: nextProps.errors[Object.keys(nextProps.errors)[0]],
          animating: true
        });
        //console.log("there are errors");
        this.props.setRegistrationStatus("notRegistering");
        this.props.setLoginStatus("notLogging");
      }
      if (nextProps.auth.registrationStatus === "registrationCompleted") {
        this.props.setRegistrationStatus("notRegistering");
        this.setState({ modalMode: "login" });
      }
    }
  }

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

  closeModal = () => {
    this.props.setModalState(false);
  };

  render() {
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
          <span style={{ color: "white" }}>Loading</span>
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
          <span style={{ color: "white" }}>Loading</span>
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
            {this.state.errorMsg !== "" ? (
              <span style={{ color: "white" }}>{this.state.errorMsg}</span>
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
                this.setState({
                  modalMode: "register",
                  errorMsg: "",
                  animating: false
                });
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
            {this.state.errorMsg !== "" ? (
              <span
                style={{ position: "relative", color: "white", top: "1.5rem" }}
              >
                {this.state.errorMsg}
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
                this.setState({
                  modalMode: "login",
                  errorMsg: "",
                  animating: false
                });
              }}
            >
              Login
            </a>
          </Message>
        </Grid.Column>
      </Grid>
    );
    let open;
    if (this.props.modal.open) {
      open = open;
    } else {
      open = this.props.modal.open.state;
    }

    const { hide, show, visible } = this.state;
    console.log(hide, show, visible);
    return (
      <Modal
        open={this.props.modal.open.state}
        onClose={this.closeModal}
        className={this.state.animating ? "animate" : ""}
        onAnimationEnd={() => {
          console.log("animation ended!");
          this.setState({ animating: false });
        }}
      >
        {this.state.modalMode === "login" ? <LoginForm /> : <RegisterForm />}
      </Modal>
    );
  }
}
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  modal: state.modal
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
)(withRouter(LoginModal));
