import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'

import { connect } from 'react-redux'
import {
    Icon,
    Menu,
    Card,
    Image as SemanticImage,
    Popup
} from 'semantic-ui-react'
import NavBar from './NavBar.js'
import './Profile.css'

import { uploadUserPhoto, setClientSideUserPic } from './actions/authActions.js'

import userIcon from './defaultUser.jpg'

class AuthorView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            descriptionHovered: false,
            showDescriptionInput: false,
            userDescription: '',
            userPic: '',
            savedRoadmaps: [],

            yourRoadmaps: [],
            picIsLoading: true
        }
    }
    async componentDidMount() {
        //get roadmap without thumbnail, then with thumbnail like home

        const userId = this.props.history.location.pathname.slice(6)
        await fetch('/api/users/getUserById', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId })
        }).then(res => {
            res.json().then(data => {
                console.log('data returned', data)

                let userInfo = data.userInfo

                let yourRoadmaps = data.yourRoadmapsInfo
                let pic = userInfo.profilePic
                this.setState(
                    {
                        yourRoadmaps: yourRoadmaps,
                        userInfo: userInfo,
                        profilePic: pic,
                        userDescription: userInfo.userDescription,
                        picIsLoading: false,
                        username: userInfo.name
                    },
                    () => {
                        //console.log('what??', this.state.userPic)
                        fetch('/api/roadmap/getRoadmapThumbnailsByIds', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ ids: userInfo.yourRoadmap })
                        }).then(thumbnails =>
                            thumbnails.json().then(thumbnails => {
                                var base64Flag = 'data:image/jpeg;base64,'
                                thumbnails.forEach((thumbnail, index) => {
                                    var imgStr = this.arrayBufferToBase64(
                                        thumbnail.thumbnail.data.data
                                    )

                                    this.state.yourRoadmaps[
                                        index
                                    ].convertedThumbnail = base64Flag + imgStr

                                    this.forceUpdate()
                                })
                            })
                        )
                    }
                )
            })
        })
    }

    arrayBufferToBase64 = buffer => {
        var binary = ''
        var bytes = [].slice.call(new Uint8Array(buffer))
        bytes.forEach(b => (binary += String.fromCharCode(b)))
        return window.btoa(binary)
    }

    render() {
        const ImageStyle = {
            width: '256px',
            height: '144px'
        }
        const ContentStyle = {
            paddingTop: '22px',
            paddingBottom: '18px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
        }
        const CardStyle = {
            width: '256px',
            cursor: 'pointer'
        }

        let picSrc
        if (this.state.picIsLoading) {
            picSrc = null
        } else if (this.state.profilePic && this.state.profilePic.default) {
            picSrc = userIcon
        } else {
            picSrc = 'data:image/jpeg;base64,' + this.state.profilePic
        }

        const profileComponent = (
            <Card.Group
                centered
                style={{
                    position: 'relative',
                    top: '3rem',
                    paddingBottom: '5rem'
                }}
            >
                {this.state.yourRoadmaps.map((eachRoadmap, index) => (
                    <Popup
                        header={eachRoadmap.title}
                        content={eachRoadmap.description}
                        position="bottom left"
                        trigger={
                            <Card
                                style={CardStyle}
                                onClick={() => {
                                    this.props.history.push(
                                        `/roadmap/${eachRoadmap._id}`
                                    )
                                }}
                            >
                                {eachRoadmap.convertedThumbnail ? (
                                    <SemanticImage
                                        src={eachRoadmap.convertedThumbnail}
                                        style={ImageStyle}
                                    />
                                ) : (
                                    <div style={ImageStyle}>
                                        <Icon
                                            loading
                                            name="circle notch"
                                            size="massive"
                                            color="black"
                                            style={{
                                                position: 'relative',
                                                top: '1rem',

                                                marginLeft: 'auto',
                                                marginRight: 'auto',
                                                display: 'block'
                                            }}
                                        />
                                    </div>
                                )}
                                <Card.Content style={ContentStyle}>
                                    <Card.Header>
                                        {eachRoadmap.title}
                                    </Card.Header>
                                    <Card.Description>
                                        {eachRoadmap.description}
                                    </Card.Description>
                                </Card.Content>
                            </Card>
                        }
                    />
                ))}
            </Card.Group>
        )

        const descriptionComponent = (
            <span
                style={{
                    color: 'grey',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    width: '300px',
                    wordBreak: 'break-all'
                }}
            >
                {this.state.userDescription}
            </span>
        )

        return (
            <React.Fragment>
                <NavBar />

                <div style={{ margin: '2rem' }}>
                    <div>
                        <img
                            src={picSrc}
                            style={{
                                width: '150px',
                                height: '150px',
                                borderRadius: '50%',
                                float: 'left',
                                backgroundColor: 'grey'
                            }}
                            onMouseEnter={() => {
                                this.setState({ imgHovered: true })
                            }}
                        />
                        <div>
                            <h1
                                style={{
                                    position: 'relative',
                                    top: '2rem',
                                    left: '2rem'
                                }}
                            >
                                {this.state.username}
                            </h1>

                            <span
                                style={{
                                    position: 'relative',
                                    left: '2rem',
                                    top: '2rem',
                                    maxWidth: '300px'
                                }}
                            >
                                {descriptionComponent}
                            </span>
                        </div>
                    </div>
                </div>

                <Menu
                    style={{
                        clear: 'both',
                        margin: '0 auto',
                        position: 'relative',
                        top: '2rem'
                    }}
                    size="mini"
                >
                    <Menu.Item as="a">Created Roadmaps</Menu.Item>
                </Menu>
                <div style={{ marginTop: '5rem' }}> {profileComponent}</div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = state => ({
    auth: state.auth
})
export default connect(
    mapStateToProps,
    { uploadUserPhoto, setClientSideUserPic }
)(withRouter(AuthorView))
