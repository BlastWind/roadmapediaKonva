import React, { Component } from 'react'
import './NavBar.css'
import { Dropdown, Icon, Menu } from 'semantic-ui-react'

import logo from './logo.png'
import { Link, withRouter } from 'react-router-dom'

import { connect } from 'react-redux'
import {
    registerUser,
    loginUser,
    setRegistrationStatus,
    setLoginStatus,
    clearErrors,
    logoutUser,
    setModalState,
    setClientSideUserPic
} from './actions/authActions'

import SearchBar from './SearchBar.jsx'

import './NavBar.css'

import userIcon from './defaultUser.jpg'
import LoginModal from './LoginModal.jsx'

class NavBar extends Component {
    constructor(props) {
        super(props)

        this.state = {
            open: false,
            emailInputTextMoved: false,
            password: '',
            email: '',
            showSearchBar: false
        }
    }

    async componentDidMount() {
        await fetch('/api/users/getUserById', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: this.props.auth.user.id })
        }).then(res => {
            res.json().then(data => {
                let userInfo = data.userInfo

                if (userInfo.profilePic && userInfo.profilePic.default) {
                    this.props.setClientSideUserPic(userIcon)
                } else {
                    this.props.setClientSideUserPic(
                        'data:image/jpeg;base64,' + userInfo.profilePic
                    )
                }
            })
        })
    }

    componentDidUpdate() {}

    componentWillReceiveProps(nextProps) {
        if (
            nextProps.history.location.state &&
            nextProps.history.location.pathname === '/home/featured'
        ) {
        }

        if (JSON.stringify(this.props) !== JSON.stringify(nextProps)) {
            if (nextProps.auth.loginStatus === 'loginCompleted') {
                this.props.setModalState(false)
            }

            if (Object.keys(nextProps.errors).length > 0) {
                this.setState({
                    errors: true
                })
                this.props.setRegistrationStatus('notRegistering')
                this.props.setLoginStatus('notLogging')
            }
            if (nextProps.auth.registrationStatus === 'registrationCompleted') {
                this.setState({ modalMode: 'login' })
            }
        }
    }
    handleTriggerClick = () => {
        this.props.setModalState(true)
        this.setState({ modalMode: 'login' })
    }

    handleLogout = () => {
        this.props.logoutUser()
        this.props.history.push('/home/featured')
        this.props.setLoginStatus('notLogging')
    }

    arrayBufferToBase64 = buffer => {
        var binary = ''
        var bytes = [].slice.call(new Uint8Array(buffer))
        bytes.forEach(b => (binary += String.fromCharCode(b)))
        return window.btoa(binary)
    }
    render() {
        const fixedMenuStyle = {
            backgroundColor: '#fff',
            border: '.5px solid #ffffff'
        }
        const imageStyle = {
            height: '3.5rem',
            width: 'auto'
        }
        const white = {
            color: 'grey',
            fontFamily: 'Saira, sans-serif',

            paddingBottom: '.75rem'
        }
        const dropDown = {
            color: 'grey',
            fontFamily: 'Saira, sans-serif',
            paddingRight: '1.25rem',
            paddingBottom: '.75rem'
        }

        /*  let profilePicSrc;

    if (this.props.auth.isAuthenticated) {
      if (
        this.props.auth.user.profilePic &&
        this.props.auth.user.profilePic.default
      ) {
        profilePicSrc = userIcon;
      } else {
        profilePicSrc = this.props.auth.userPic;
      }
    } */

        return (
            <div id="NavBar">
                <LoginModal />

                <Menu borderless style={fixedMenuStyle}>
                    {this.state.showSearchBar ? (
                        <React.Fragment>
                            <Menu.Item>
                                <Link to="/home/featured">
                                    <img
                                        style={imageStyle}
                                        size="mini"
                                        src={logo}
                                    />
                                </Link>
                            </Menu.Item>

                            <SearchBar
                                setSearch={() => {
                                    this.setState({ showSearchBar: false })
                                }}
                            />
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <Menu.Item>
                                <Link to="/home/featured">
                                    <img
                                        style={imageStyle}
                                        size="mini"
                                        src={logo}
                                    />
                                </Link>
                            </Menu.Item>

                            <Menu.Item style={white}>
                                <Link to="/create" style={{ color: 'grey' }}>
                                    Create
                                </Link>
                            </Menu.Item>
                            <Menu.Item>
                                <Icon
                                    name="search"
                                    onClick={() => {
                                        this.setState({ showSearchBar: true })
                                    }}
                                    style={{ cursor: 'pointer' }}
                                />
                            </Menu.Item>

                            <Menu.Menu position="right">
                                {this.props.auth.isAuthenticated ? (
                                    <React.Fragment>
                                        <Menu.Item>
                                            {this.props.auth.userPic ? (
                                                <img
                                                    src={
                                                        this.props.auth.userPic
                                                    }
                                                    style={{
                                                        borderRadius: '50%',
                                                        width: '25px',
                                                        height: '25px',
                                                        float: 'left'
                                                    }}
                                                />
                                            ) : (
                                                <img
                                                    style={{
                                                        borderRadius: '50%',
                                                        width: '25px',
                                                        height: '25px',
                                                        float: 'left',
                                                        backgroundColor: 'grey'
                                                    }}
                                                />
                                            )}
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
                                                            this.props.history.push(
                                                                '/profile/yourroadmaps'
                                                            )
                                                        }}
                                                    >
                                                        Profile
                                                    </Dropdown.Item>
                                                    <Dropdown.Item
                                                        onClick={() => {
                                                            this.props.history.push(
                                                                '/profile/starred'
                                                            )
                                                        }}
                                                    >
                                                        Starred Roadmap
                                                    </Dropdown.Item>
                                                    <Dropdown.Item
                                                        onClick={() => {
                                                            this.props.history.push(
                                                                '/profile/yourroadmaps'
                                                            )
                                                        }}
                                                    >
                                                        Your Roadmap
                                                    </Dropdown.Item>
                                                    <Dropdown.Item
                                                        onClick={() => {
                                                            this.props.history.push(
                                                                '/profile/drafts'
                                                            )
                                                        }}
                                                    >
                                                        Draft
                                                    </Dropdown.Item>
                                                    <Dropdown.Divider />
                                                    <Dropdown.Item
                                                        onClick={
                                                            this.handleLogout
                                                        }
                                                    >
                                                        Logout
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </Menu.Item>
                                    </React.Fragment>
                                ) : (
                                    <Menu.Item
                                        as="a"
                                        style={white}
                                        onClick={this.handleTriggerClick}
                                    >
                                        Login
                                    </Menu.Item>
                                )}
                            </Menu.Menu>
                        </React.Fragment>
                    )}
                </Menu>
            </div>
        )
    }
}
const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors
})

export default connect(
    mapStateToProps,
    {
        registerUser,
        loginUser,
        setRegistrationStatus,
        setLoginStatus,
        clearErrors,
        logoutUser,
        setModalState,
        setClientSideUserPic
    }
)(withRouter(NavBar))
