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

class Profile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            descriptionHovered: false,
            showDescriptionInput: false,
            userDescription: '',
            userPic: '',
            savedRoadmaps: [],
            draftRoadmaps: [],
            yourRoadmaps: [],
            isLoading: true
        }
        this.input = React.createRef()
        this.fileInput = React.createRef()
    }
    async componentDidMount() {
        //get roadmap without thumbnail, then with thumbnail like home

        await fetch('/api/users/getUserById', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: this.props.auth.user.id })
        }).then(res => {
            res.json().then(data => {
                var arr = new Uint8Array(
                    new ArrayBuffer(data.userInfo.profilePic)
                )
                let userInfo = data.userInfo
                let savedRoadmaps = data.savedRoadmapsInfo
                let draftRoadmaps = data.draftRoadmapsInfo
                let yourRoadmaps = data.yourRoadmapsInfo

                let pic
                if (userInfo.profilePic && userInfo.profilePic.default) {
                    pic = userIcon
                    this.props.setClientSideUserPic(userIcon)
                } else {
                    pic = userInfo.profilePic
                    this.props.setClientSideUserPic(
                        'data:image/jpeg;base64,' + userInfo.profilePic
                    )
                }

                this.setState(
                    {
                        savedRoadmaps: savedRoadmaps,
                        yourRoadmaps: yourRoadmaps,
                        userInfo: userInfo,
                        draftRoadmaps: draftRoadmaps,
                        userPic: 'data:image/jpeg;base64,' + pic,
                        userDescription: userInfo.userDescription,
                        isLoading: false
                    },
                    () => {
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
                        fetch('/api/roadmap/getRoadmapThumbnailsByIds', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ ids: userInfo.savedRoadmap })
                        }).then(thumbnails =>
                            thumbnails.json().then(thumbnails => {
                                var base64Flag = 'data:image/jpeg;base64,'
                                thumbnails.forEach((thumbnail, index) => {
                                    var imgStr = this.arrayBufferToBase64(
                                        thumbnail.thumbnail.data.data
                                    )

                                    this.state.savedRoadmaps[
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

    updateUserDescription = value => {
        fetch('/api/users/updateUserDescription', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: this.props.auth.user.id,
                userDescription: value
            })
        }).then(res => {
            if (res.status === 200) {
                alert('user description updated')
            } else {
                alert(
                    'something went wrong, user description might not be stored'
                )
            }
        })
    }
    render() {
        const ImageStyle = {
            width: '256px',
            height: '144px'
        }
        const ContentStyle = {
            paddingTop: '22px',
            paddingBottom: '18px'
        }
        const CardStyle = {
            width: '256px',
            cursor: 'pointer'
        }

        let profileComponent
        const url = this.props.location.pathname

        if (url === '/profile/starred' || url === '/profile/starred/') {
            this.state.isLoading
                ? (profileComponent = (
                      <Icon
                          loading
                          name="circle notch"
                          size="massive"
                          color="black"
                          style={{
                              position: 'relative',
                              top: '3rem',
                              marginLeft: 'auto',
                              marginRight: 'auto',
                              display: 'block'
                          }}
                      />
                  ))
                : this.state.savedRoadmaps.length === 0
                ? (profileComponent = (
                      <div style={{ marginLeft: '1.5rem' }}>
                          Nothing saved yet, go out and star a roadmap!
                      </div>
                  ))
                : (profileComponent = (
                      <Card.Group
                          centered
                          style={{
                              position: 'relative',
                              top: '3rem',
                              paddingBottom: '5rem'
                          }}
                      >
                          {this.state.savedRoadmaps.map(
                              (eachRoadmap, index) => (
                                  <Popup
                                      header={eachRoadmap.title}
                                      content={eachRoadmap.description}
                                      position="bottom left"
                                      trigger={
                                          <Card
                                              style={CardStyle}
                                              onClick={() => {
                                                  this.props.history.push(
                                                      `/roadmap/${
                                                          eachRoadmap._id
                                                      }`
                                                  )
                                              }}
                                          >
                                              {eachRoadmap.convertedThumbnail ? (
                                                  <SemanticImage
                                                      src={
                                                          eachRoadmap.convertedThumbnail
                                                      }
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
                                                              position:
                                                                  'relative',
                                                              top: '1rem',

                                                              marginLeft:
                                                                  'auto',
                                                              marginRight:
                                                                  'auto',
                                                              display: 'block'
                                                          }}
                                                      />
                                                  </div>
                                              )}
                                              <Card.Content
                                                  style={ContentStyle}
                                              >
                                                  <Card.Header
                                                      style={{
                                                          textOverflow:
                                                              'ellipsis',
                                                          overflow: 'hidden',
                                                          whiteSpace: 'nowrap'
                                                      }}
                                                  >
                                                      {eachRoadmap.title}
                                                  </Card.Header>
                                                  <Card.Description>
                                                      <Icon name="eye" />
                                                      {eachRoadmap.views}
                                                  </Card.Description>
                                              </Card.Content>
                                          </Card>
                                      }
                                  />
                              )
                          )}
                      </Card.Group>
                  ))
        } else if (
            url === '/profile/yourroadmaps' ||
            url === '/profile/yourroadmaps/'
        ) {
            this.state.isLoading
                ? (profileComponent = (
                      <Icon
                          loading
                          name="circle notch"
                          size="massive"
                          color="black"
                          style={{
                              position: 'relative',
                              top: '3rem',
                              marginLeft: 'auto',
                              marginRight: 'auto',
                              display: 'block'
                          }}
                      />
                  ))
                : this.state.yourRoadmaps.length === 0
                ? (profileComponent = (
                      <div style={{ marginLeft: '1.5rem' }}>
                          You haven't created a roadmap yet, go{' '}
                          <a
                              onClick={() => {
                                  this.props.history.push('/create')
                              }}
                              style={{ cursor: 'pointer' }}
                          >
                              make
                          </a>{' '}
                          one!
                      </div>
                  ))
                : (profileComponent = (
                      <div>
                          <Card.Group
                              centered
                              style={{
                                  position: 'relative',
                                  top: '3rem',
                                  paddingBottom: '5rem'
                              }}
                          >
                              {this.state.yourRoadmaps.map(
                                  (eachRoadmap, index) => (
                                      <Popup
                                          header={eachRoadmap.title}
                                          content={eachRoadmap.description}
                                          position="bottom left"
                                          trigger={
                                              <Card
                                                  style={CardStyle}
                                                  onClick={() => {
                                                      this.props.history.push(
                                                          `/roadmap/${
                                                              eachRoadmap._id
                                                          }`
                                                      )
                                                  }}
                                              >
                                                  {eachRoadmap.convertedThumbnail ? (
                                                      <SemanticImage
                                                          src={
                                                              eachRoadmap.convertedThumbnail
                                                          }
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
                                                                  position:
                                                                      'relative',
                                                                  top: '1rem',

                                                                  marginLeft:
                                                                      'auto',
                                                                  marginRight:
                                                                      'auto',
                                                                  display:
                                                                      'block'
                                                              }}
                                                          />
                                                      </div>
                                                  )}
                                                  <Card.Content
                                                      style={ContentStyle}
                                                  >
                                                      <Card.Header
                                                          style={{
                                                              textOverflow:
                                                                  'ellipsis',
                                                              overflow:
                                                                  'hidden',
                                                              whiteSpace:
                                                                  'nowrap'
                                                          }}
                                                      >
                                                          {eachRoadmap.title}
                                                      </Card.Header>
                                                      <Card.Description>
                                                          <Icon name="eye" />
                                                          {eachRoadmap.views}
                                                      </Card.Description>
                                                  </Card.Content>
                                              </Card>
                                          }
                                      />
                                  )
                              )}
                          </Card.Group>
                      </div>
                  ))
        } else if (url === '/profile/drafts' || url === '/profile/drafts/') {
            this.state.isLoading
                ? (profileComponent = (
                      <Icon
                          loading
                          name="circle notch"
                          size="massive"
                          color="black"
                          style={{
                              position: 'relative',
                              top: '3rem',
                              marginLeft: 'auto',
                              marginRight: 'auto',
                              display: 'block'
                          }}
                      />
                  ))
                : this.state.draftRoadmaps.length === 0
                ? (profileComponent = (
                      <div style={{ marginLeft: '1.5rem' }}>
                          No Drafts yet! Save during{' '}
                          <a
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                  this.props.history.push('/create')
                              }}
                          >
                              create
                          </a>{' '}
                          mode to create a draft
                      </div>
                  ))
                : (profileComponent = (
                      <Card.Group
                          centered
                          style={{
                              position: 'relative',
                              top: '4rem',
                              paddingBottom: '5rem'
                          }}
                      >
                          {this.state.draftRoadmaps.map(
                              (eachRoadmap, index) => (
                                  <Popup
                                      header={eachRoadmap.title}
                                      content={eachRoadmap.description}
                                      position="bottom left"
                                      trigger={
                                          <Card
                                              style={CardStyle}
                                              onClick={() => {
                                                  this.props.history.push(
                                                      `/create/draft/${
                                                          eachRoadmap._id
                                                      }`
                                                  )
                                              }}
                                          >
                                              <Card.Content
                                                  style={ContentStyle}
                                              >
                                                  <Card.Header>
                                                      {eachRoadmap.title}
                                                  </Card.Header>
                                              </Card.Content>
                                          </Card>
                                      }
                                  />
                              )
                          )}
                      </Card.Group>
                  ))
        } else {
            profileComponent = <div>should be a 404 page</div>
        }
        let username
        if (this.props.auth && this.props.auth.user) {
            username = this.props.auth.user.name
        } else {
            username = 'uh'
        }

        let descriptionComponent
        if (this.state.isLoading) {
            descriptionComponent = <span>loading...</span>
        } else if (this.state.userDescription === '') {
            if (this.state.descriptionHovered) {
                if (!this.state.showDescriptionInput) {
                    descriptionComponent = (
                        <span
                            onMouseOut={() => {
                                this.setState({
                                    descriptionHovered: !this.state
                                        .descriptionHovered
                                })
                            }}
                            onClick={() => {
                                this.setState({ showDescriptionInput: true })
                            }}
                            style={{
                                cursor: 'pointer',
                                color: 'grey',
                                borderBottom: '1px solid black'
                            }}
                        >
                            Write a description about yourself
                        </span>
                    )
                } else {
                    descriptionComponent = (
                        <input
                            ref={this.input}
                            maxLength={50}
                            autoFocus
                            onBlur={event => {
                                this.setState({
                                    showDescriptionInput: false,
                                    descriptionHovered: false,
                                    userDescription: event.target.value
                                })
                                if (event.target.value !== '')
                                    this.updateUserDescription(
                                        event.target.value
                                    )
                            }}
                        />
                    )
                }
            } else {
                descriptionComponent = (
                    <span
                        onMouseEnter={() => {
                            this.setState({
                                descriptionHovered: !this.state
                                    .descriptionHovered
                            })
                        }}
                        style={{ cursor: 'pointer', color: 'grey' }}
                    >
                        Write a description about yourself
                    </span>
                )
            }
        } else {
            if (this.state.descriptionHovered) {
                if (!this.state.showDescriptionInput) {
                    descriptionComponent = (
                        <span
                            onMouseOut={() => {
                                this.setState({
                                    descriptionHovered: !this.state
                                        .descriptionHovered
                                })
                            }}
                            onClick={() => {
                                this.setState({ showDescriptionInput: true })
                            }}
                            style={{
                                cursor: 'pointer',
                                color: 'grey',
                                borderBottom: '1px solid black',
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
                } else {
                    descriptionComponent = (
                        <input
                            ref={this.input}
                            maxLength={50}
                            autoFocus
                            onBlur={event => {
                                this.setState({
                                    showDescriptionInput: false,
                                    descriptionHovered: false,
                                    userDescription: event.target.value
                                })
                                if (event.target.value !== '')
                                    this.updateUserDescription(
                                        event.target.value
                                    )
                            }}
                        />
                    )
                }
            } else {
                descriptionComponent = (
                    <span
                        onMouseEnter={() => {
                            this.setState({
                                descriptionHovered: !this.state
                                    .descriptionHovered
                            })
                        }}
                        style={{
                            cursor: 'pointer',
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
            }
        }

        var that = this
        return (
            <React.Fragment>
                <NavBar />

                <div style={{ margin: '2rem' }}>
                    <input
                        type="file"
                        accept="image/x-png, image/jpeg"
                        hidden
                        ref={this.fileInput}
                        onChange={event => {
                            var that = this
                            if (event.target && event.target.files[0]) {
                                var file = event.target.files[0]

                                var picSrc = URL.createObjectURL(file)
                                var img = new Image()
                                img.onload = function() {
                                    var MAX_WIDTH = 150
                                    var MAX_HEIGHT = 150

                                    var width = img.naturalWidth
                                    var height = img.naturalHeight

                                    if (width > height) {
                                        if (width > MAX_WIDTH) {
                                            height *= MAX_WIDTH / width
                                            width = MAX_WIDTH
                                        } else {
                                            if (height > MAX_HEIGHT) {
                                                width *= MAX_HEIGHT / height
                                                height = MAX_HEIGHT
                                            }
                                        }
                                    }
                                    var canvas = document.createElement(
                                        'canvas'
                                    )
                                    var ctx = canvas.getContext('2d')

                                    canvas.width = width
                                    canvas.height = height

                                    ctx.drawImage(img, 0, 0, width, height)

                                    var dataurl = canvas.toDataURL('image/jpeg')

                                    that.setState({ userPic: dataurl }, () => {
                                        var mime = dataurl
                                            .split(',')[0]
                                            .split(':')[1]
                                            .split(';')[0]
                                        var binary = atob(dataurl.split(',')[1])
                                        var array = []
                                        for (
                                            var i = 0;
                                            i < binary.length;
                                            i++
                                        ) {
                                            array.push(binary.charCodeAt(i))
                                        }

                                        var uh = new Blob(
                                            [new Uint8Array(array)],
                                            { type: mime }
                                        )

                                        let formData = new FormData()
                                        formData.append('file', uh)
                                        formData.append(
                                            'userId',
                                            that.props.auth.user.id
                                        )

                                        fetch('/api/users/updateProfilePic', {
                                            method: 'PUT',
                                            body: formData
                                        }).then(res => {
                                            if (res.status === 200) {
                                                alert(
                                                    'updated, refresh later to see effect'
                                                )

                                                that.props.setClientSideUserPic(
                                                    'data:image/jpeg;base64,' +
                                                        dataurl
                                                )
                                            } else {
                                                alert(
                                                    'it appears there was some problem'
                                                )
                                            }
                                        })
                                    })
                                }
                                img.src = picSrc
                            }
                        }}
                    />

                    <div>
                        {this.state.imgHovered ? (
                            <div
                                style={{ position: 'relative' }}
                                onMouseLeave={() => {
                                    this.setState({ imgHovered: false })
                                }}
                            >
                                <div>
                                    <span
                                        style={{
                                            cursor: 'pointer',
                                            position: 'absolute',
                                            top: '50px',
                                            left: '50px',
                                            backgroundColor: 'white',
                                            padding: '1rem',
                                            borderRadius: '50%'
                                        }}
                                        onClick={() => {
                                            this.fileInput.current.click()
                                            this.setState({ imgHovered: false })
                                        }}
                                    >
                                        edit
                                    </span>
                                </div>
                                {this.props.auth.userPic ? (
                                    <img
                                        src={this.props.auth.userPic}
                                        style={{
                                            borderRadius: '50%',
                                            width: '150px',
                                            height: '150px',
                                            float: 'left'
                                        }}
                                    />
                                ) : (
                                    <img
                                        style={{
                                            borderRadius: '50%',
                                            width: '150px',
                                            height: '150px',
                                            float: 'left',
                                            backgroundColor: 'grey'
                                        }}
                                    />
                                )}
                            </div>
                        ) : (
                            <img
                                src={
                                    this.props.auth.userPic
                                        ? this.props.auth.userPic
                                        : null
                                }
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
                        )}
                        <div>
                            <h1
                                style={{
                                    position: 'relative',
                                    top: '2rem',
                                    left: '2rem'
                                }}
                            >
                                {username}
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
                    <Menu.Item
                        as="a"
                        onClick={() => {
                            this.props.history.push('/profile/yourroadmaps')
                        }}
                    >
                        Your Roadmaps
                    </Menu.Item>
                    <Menu.Item
                        as="a"
                        onClick={() => {
                            this.props.history.push('/profile/starred')
                        }}
                    >
                        Starred
                    </Menu.Item>
                    <Menu.Item
                        as="a"
                        onClick={() => {
                            this.props.history.push('/profile/drafts')
                        }}
                    >
                        Drafts
                    </Menu.Item>
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
)(withRouter(Profile))
