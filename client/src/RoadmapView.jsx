import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import { Segment, Button, Icon, Label, Menu, Modal } from 'semantic-ui-react'

import { Stage, Layer, Rect, Ellipse, Star, Text, Arrow } from 'react-konva'
import './RoadmapView.css'
import Connector from './Connector.jsx'
import userIcon from './defaultUser.jpg'
class RoadmapView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            roadmap: null,
            show: true,
            profilePic: null,
            starText: true,
            stars: '',
            sameAuthor: false,
            deleteModalOpen: false,
            stageX: 0,
            stageY: 0,
            starLoading: true
        }
        this.IsJsonString = this.IsJsonString.bind(this)
        this.handleWheel = this.handleWheel.bind(this)
    }

    IsJsonString(str) {
        try {
            JSON.parse(str)
        } catch (e) {
            return false
        }

        return true
    }

    handleMouseOver = () => {
        var pos = this.refs.stage.getPointerPosition()
        var shape = this.refs.stage.getIntersection(pos)

        if (shape && shape.attrs.link) {
            document.body.style.cursor = 'pointer'
        } else {
            document.body.style.cursor = 'default'
        }
    }

    componentWillUnmount() {
        document.body.style.cursor = 'default'
        document.title = "Roadmapedia - Let's share Knowledge"
    }

    async componentDidMount() {
        //get relative URL with this.props.histoyr.path.name and then slice
        //then do a post request to retrieve roadmap data,
        var path = this.props.history.location.pathname.slice(9)

        await fetch('/api/roadmap/incrementView', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roadmapId: path })
        }).catch(err => alert(err))
        await fetch('/api/roadmap/getRoadmapById', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roadmapId: path })
        }).then(res => {
            res.json().then(roadmap => {
                if (roadmap.message) {
                    alert(roadmap.message)
                    this.props.history.push('/home/featured')
                } else {
                    if (
                        this.props.auth.isAuthenticated &&
                        roadmap.author_id === this.props.auth.user.id
                    ) {
                        this.setState({ sameAuthor: true })
                    }

                    var data = roadmap.data

                    var roadmapData = JSON.parse(JSON.parse(data))
                    roadmapData.arrows.forEach(eachArrow => {
                        if (eachArrow.from && this.IsJsonString(eachArrow.from))
                            eachArrow.from = JSON.parse(eachArrow.from)
                        if (eachArrow.to && this.IsJsonString(eachArrow.to))
                            eachArrow.to = JSON.parse(eachArrow.to)
                    })
                    this.setState(
                        {
                            _id: roadmap._id,
                            roadmap: roadmapData,
                            rectangles: roadmapData.rects,
                            ellipses: roadmapData.ellipses,
                            arrows: roadmapData.arrows,
                            stars: roadmapData.stars,
                            texts: roadmapData.texts,
                            starCount: roadmap.hearts,
                            title: roadmap.title,
                            views: roadmap.views,
                            author_id: roadmap.author_id,
                            category: roadmap.category,
                            date: roadmap.date
                        },
                        () => {
                            document.title = this.state.title + ' - Roadmapedia'
                            fetch('/api/users/getUserInfoOnly', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    userId: this.state.author_id
                                })
                            })
                                .then(res =>
                                    res.json().then(authorInfo => {
                                        if (
                                            authorInfo.profilePic &&
                                            authorInfo.profilePic.default
                                        ) {
                                            this.setState({
                                                date: authorInfo.date,
                                                name: authorInfo.name,
                                                userDescription:
                                                    authorInfo.userDescription,
                                                profilePic: ''
                                            })
                                        } else {
                                            this.setState({
                                                profilePic:
                                                    'data:image/jpeg;base64,' +
                                                    authorInfo.profilePic,
                                                name: authorInfo.name,
                                                userDescription:
                                                    authorInfo.userDescription,
                                                date: authorInfo.date
                                            })
                                        }
                                    })
                                )
                                .then(res => {
                                    if (this.props.auth.isAuthenticated) {
                                        fetch('/api/users/getUserAttribute', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type':
                                                    'application/json'
                                            },
                                            body: JSON.stringify({
                                                userId: this.props.auth.user.id,
                                                attribute: 'savedRoadmap'
                                            })
                                        }).then(res =>
                                            res.json().then(returned => {
                                                let savedRoadmap =
                                                    returned.attribute
                                                if (
                                                    savedRoadmap.includes(
                                                        this.state._id
                                                    )
                                                ) {
                                                    this.setState({
                                                        starText: false,
                                                        starLoading: false
                                                    })
                                                } else {
                                                    this.setState({
                                                        starText: true,
                                                        starLoading: false
                                                    })
                                                }
                                            })
                                        )
                                    } else {
                                        this.setState({
                                            starText: true,
                                            starLoading: false
                                        })
                                    }
                                })
                        }
                    )
                }
            })
        })
    }

    saveRoadmapToUser = () => {
        if (this.props.auth.isAuthenticated) {
            fetch('/api/users/saveRoadmapToUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roadmapId: this.state._id,
                    userId: this.props.auth.user.id
                })
            })
        } else {
            //Make em login

            this.props.history.push('/profile/starred')
        }
    }

    removeRoadmapFromUser = () => {
        if (this.props.auth.isAuthenticated) {
            fetch('/api/users/removeRoadmapFromUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roadmapId: this.state._id,
                    userId: this.props.auth.user.id
                })
            })
        }
    }

    handleRoadmapEdit = () => {
        var roadmapId = this.state._id

        this.props.history.push(`/create/draft/${roadmapId}`)
    }

    handleRoadmapDelete = () => {
        this.setState({ deleting: true })

        this.setState({ deleteModalOpen: false })

        fetch('/api/roadmap/deleteRoadmap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                roadmapId: this.state._id
            })
        }).then(res => {
            this.setState({ deleting: false })
            window.location.reload()
        })
    }

    handleAuthorClick = () => {
        this.props.history.push(`/user/${this.state.author_id}`)
    }

    handleWheel(event) {
        event.evt.preventDefault()

        const scaleBy = 1.2
        const stage = this.refs.stage

        const oldScale = stage.scaleX()
        const mousePointTo = {
            x:
                stage.getPointerPosition().x / oldScale -
                this.state.stageX / oldScale,
            y:
                stage.getPointerPosition().y / oldScale -
                this.state.stageY / oldScale
        }

        const newScale =
            event.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy

        stage.scale({ x: newScale, y: newScale })

        this.setState({
            stageScale: newScale,
            stageX:
                -(mousePointTo.x - stage.getPointerPosition().x / newScale) *
                newScale,
            stageY:
                -(mousePointTo.y - stage.getPointerPosition().y / newScale) *
                newScale
        })
    }

    render() {
        let content
        let profilePicSrc

        if (this.state.profilePic === null) {
            profilePicSrc = null
        } else {
            if (this.state.profilePic === '') {
                profilePicSrc = userIcon
            } else {
                profilePicSrc = this.state.profilePic
            }
        }

        if (this.state.roadmap) {
            content = (
                <div
                    style={{
                        textAlign: 'center',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        display: 'block',
                        marginTop: '1.75rem'
                    }}
                >
                    <img
                        src={profilePicSrc}
                        style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            backgroundColor: 'grey'
                        }}
                    />
                    <div>
                        <h1 style={{ marginTop: '1rem' }}>
                            {this.state.name ? (
                                <span
                                    style={{ cursor: 'pointer' }}
                                    onClick={this.handleAuthorClick}
                                >
                                    {this.state.name}
                                </span>
                            ) : (
                                'loading...'
                            )}
                        </h1>
                    </div>
                    <div
                        style={{
                            marginTop: '1rem',
                            paddingLeft: '1rem',
                            paddingRight: '1rem'
                        }}
                    >
                        <p>
                            {this.state.userDescription
                                ? this.state.userDescription
                                : null}
                        </p>
                    </div>
                </div>
            )
        } else {
            content = <div>content</div>
        }

        let saveButton

        this.state.starLoading
            ? (saveButton = (
                  <Button as="div" labelPosition="right" size="small">
                      <Button icon size="medium">
                          <Icon
                              name="star outline"
                              style={{ paddingRight: '0.25rem' }}
                          />
                          <span style={{ paddingLeft: '0.25rem' }}>
                              Loading
                          </span>
                      </Button>
                  </Button>
              ))
            : this.state.starText
            ? (saveButton = (
                  <Button as="div" labelPosition="right" size="small">
                      <Button
                          icon
                          size="medium"
                          onClick={() => {
                              this.setState({
                                  starText: false,
                                  starCount: this.state.starCount + 1
                              })
                              this.saveRoadmapToUser()
                          }}
                      >
                          <Icon
                              name="star outline"
                              style={{ paddingRight: '0.25rem' }}
                          />
                          <span style={{ paddingLeft: '0.25rem' }}>Star</span>
                      </Button>
                  </Button>
              ))
            : (saveButton = (
                  <Button as="div" labelPosition="right" size="small">
                      <Button
                          icon
                          size="medium"
                          onClick={() => {
                              this.setState({
                                  starText: true,
                                  starCount: this.state.starCount - 1
                              })
                              this.removeRoadmapFromUser()
                          }}
                      >
                          <Icon
                              name="star"
                              style={{ paddingRight: '0.25rem' }}
                          />
                          <span style={{ paddingLeft: '0.25rem' }}>Unstar</span>
                      </Button>
                  </Button>
              ))

        return (
            <div>
                <Modal
                    open={this.state.deleteModalOpen}
                    onClose={() => {
                        this.setState({ deleteModalOpen: false })
                    }}
                >
                    <Modal.Content>
                        <p>Are you sure you want to delete this roadmap?</p>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button
                            onClick={() => {
                                this.setState({ deleteModalOpen: false })
                            }}
                            negative
                        >
                            No
                        </Button>
                        <Button
                            onClick={this.handleRoadmapDelete}
                            positive
                            labelPosition="right"
                            icon="checkmark"
                            content="Yes"
                        />
                    </Modal.Actions>
                </Modal>

                {this.state.roadmap ? (
                    <React.Fragment>
                        <Menu
                            borderless
                            className="navbar"
                            id="mavbar"
                            ref="mavbar"
                        >
                            <Menu.Item as="a">
                                <Link
                                    to="/home/featured"
                                    style={{ color: 'white' }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="18"
                                        viewBox="0 0 20 18"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M15.45 17.97L9.5 12.01a.25.25 0 0 1 0-.36l5.87-5.87a.75.75 0 0 0-1.06-1.06l-5.87 5.87c-.69.68-.69 1.8 0 2.48l5.96 5.96a.75.75 0 0 0 1.06-1.06z"
                                        />
                                    </svg>
                                    Home
                                </Link>
                            </Menu.Item>
                            <Menu.Item
                                as="a"
                                style={{
                                    color: 'white',
                                    display: 'block',
                                    marginTop: '.25rem',
                                    width: '50%',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {this.state.title}
                            </Menu.Item>
                            <Menu.Menu position="right">
                                <Menu.Item
                                    style={{ padding: '0px !important' }}
                                    className="save"
                                >
                                    {saveButton}
                                </Menu.Item>

                                {this.state.sameAuthor ? (
                                    <React.Fragment>
                                        <Menu.Item
                                            style={{
                                                padding: '0px !important'
                                            }}
                                        >
                                            <Button
                                                onClick={this.handleRoadmapEdit}
                                            >
                                                Edit
                                            </Button>
                                        </Menu.Item>
                                        <Menu.Item
                                            style={{
                                                padding: '0px !important'
                                            }}
                                        >
                                            {this.state.deleting ? (
                                                <Button color="grey">
                                                    Deleting
                                                </Button>
                                            ) : (
                                                <Button
                                                    color="red"
                                                    onClick={() => {
                                                        this.setState({
                                                            deleteModalOpen: true
                                                        })
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                        </Menu.Item>
                                    </React.Fragment>
                                ) : null}
                            </Menu.Menu>
                        </Menu>
                        <Stage
                            x={this.state.stageX}
                            y={this.state.stageY}
                            scaleX={this.state.stageScale}
                            scaleY={this.state.stageScale}
                            height={window.innerHeight}
                            width={window.innerWidth}
                            onWheel={event => this.handleWheel(event)}
                            onMouseMove={this.handleMouseOver}
                            draggable
                            onDragEnd={() => {
                                this.setState({
                                    stageX: this.refs.stage.x(),
                                    stageY: this.refs.stage.y()
                                })
                            }}
                            ref="stage"
                        >
                            <Layer
                                height={window.innerHeight}
                                width={window.innerWidth}
                            >
                                {this.state.rectangles.map(eachRect => (
                                    <Rect
                                        x={eachRect.x}
                                        y={eachRect.y}
                                        fill={eachRect.fill}
                                        width={eachRect.width}
                                        height={eachRect.height}
                                        stroke={eachRect.stroke}
                                        strokeWidth={eachRect.strokeWidth}
                                        rotation={eachRect.rotation}
                                        name={eachRect.name}
                                        draggable
                                        link={eachRect.link}
                                        onClick={() => {
                                            if (
                                                eachRect.link &&
                                                eachRect.link !== ''
                                            ) {
                                                var win = window.open(
                                                    eachRect.link,
                                                    '_blank'
                                                )
                                                win.focus()
                                            }
                                        }}
                                    />
                                ))}
                                {this.state.ellipses.map(eachEllipse => (
                                    <Ellipse
                                        x={eachEllipse.x}
                                        y={eachEllipse.y}
                                        fill={eachEllipse.fill}
                                        radiusX={eachEllipse.radiusX}
                                        radiusY={eachEllipse.radiusY}
                                        stroke={eachEllipse.stroke}
                                        strokeWidth={eachEllipse.strokeWidth}
                                        rotation={eachEllipse.rotation}
                                        draggable
                                        link={eachEllipse.link}
                                        onClick={() => {
                                            if (
                                                eachEllipse.link &&
                                                eachEllipse.link !== ''
                                            ) {
                                                var win = window.open(
                                                    eachEllipse.link,
                                                    '_blank'
                                                )
                                                win.focus()
                                            }
                                        }}
                                    />
                                ))}
                                {this.state.stars.map(eachStar => (
                                    <Star
                                        x={eachStar.x}
                                        y={eachStar.y}
                                        innerRadius={eachStar.innerRadius}
                                        outerRadius={eachStar.outerRadius}
                                        fill={eachStar.fill}
                                        stroke={eachStar.stroke}
                                        strokeWidth={eachStar.strokeWidth}
                                        rotation={eachStar.rotation}
                                        link={eachStar.link}
                                        onClick={() => {
                                            if (
                                                eachStar.link &&
                                                eachStar.link !== ''
                                            ) {
                                                var win = window.open(
                                                    eachStar.link,
                                                    '_blank'
                                                )
                                                win.focus()
                                            }
                                        }}
                                    />
                                ))}
                                {this.state.texts.map(eachText => (
                                    <Text
                                        fontFamily={eachText.fontFamily}
                                        fontSize={eachText.fontSize}
                                        text={eachText.text}
                                        x={eachText.x}
                                        y={eachText.y}
                                        fill={eachText.fill}
                                        width={eachText.width}
                                        height={eachText.height}
                                        stroke={eachText.stroke}
                                        strokeWidth={eachText.strokeWidth}
                                        rotation={eachText.rotation}
                                        textDecoration={
                                            eachText.link ? 'underline' : ''
                                        }
                                        link={eachText.link}
                                        onClick={() => {
                                            if (
                                                eachText.link &&
                                                eachText.link !== ''
                                            ) {
                                                var win = window.open(
                                                    eachText.link,
                                                    '_blank'
                                                )
                                                win.focus()
                                            }
                                        }}
                                    />
                                ))}
                                {this.state.arrows.map(eachArrow => {
                                    if (!eachArrow.from && !eachArrow.to) {
                                        return (
                                            <Arrow
                                                x={eachArrow.x}
                                                y={eachArrow.y}
                                                fill={eachArrow.fill}
                                                points={eachArrow.points}
                                                stroke={eachArrow.stroke}
                                                strokeWidth={
                                                    eachArrow.strokeWidth
                                                }
                                            />
                                        )
                                    } else if (
                                        eachArrow.name ===
                                            this.state.newArrowRef &&
                                        (eachArrow.from || eachArrow.to)
                                    ) {
                                        return (
                                            <Connector
                                                name={eachArrow.name}
                                                from={eachArrow.from}
                                                to={eachArrow.to}
                                                arrowEndX={this.state.arrowEndX}
                                                arrowEndY={this.state.arrowEndY}
                                                current={true}
                                                stroke={eachArrow.stroke}
                                                fill={eachArrow.fill}
                                            />
                                        )
                                    } else if (eachArrow.from || eachArrow.to) {
                                        //if not current
                                        return (
                                            <Connector
                                                name={eachArrow.name}
                                                from={eachArrow.from}
                                                to={eachArrow.to}
                                                points={eachArrow.points}
                                                current={false}
                                                stroke={eachArrow.stroke}
                                                fill={eachArrow.fill}
                                            />
                                        )
                                    }
                                })}
                            </Layer>
                        </Stage>
                        <Segment.Group
                            id="roadmapFloat"
                            className="roadmapFloatShow"
                        >
                            <Segment
                                style={{
                                    overflow: 'auto'
                                }}
                            >
                                {content}
                            </Segment>
                        </Segment.Group>
                        <div
                            style={{
                                position: 'absolute',

                                width: '25px',
                                height: '50px',
                                backgroundColor: 'white',
                                borderBottomLeftRadius: '200px',
                                borderTopLeftRadius: '200px',
                                border: '2px solid gray',
                                borderRight: '0'
                            }}
                            className={this.state.show ? 'show' : 'hide'}
                            onClick={() => {
                                const roadmapFloat = document.getElementById(
                                    'roadmapFloat'
                                )
                                roadmapFloat.classList.toggle(
                                    'roadmapFloatHide'
                                )
                                //at first collapsed, set to uncollpased
                                this.setState({ show: !this.state.show })
                            }}
                        >
                            <div
                                style={{
                                    marginLeft: '10px',
                                    marginTop: '16px',
                                    width: 0,
                                    height: 0,
                                    borderStyle: 'solid',
                                    borderWidth: '5px 8.7px 5px 0',
                                    borderColor:
                                        'transparent gray transparent transparent'
                                }}
                            />
                        </div>
                    </React.Fragment>
                ) : (
                    <Icon
                        loading
                        name="circle notch"
                        size="massive"
                        id="centerIcon"
                    />
                )}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    auth: state.auth
})
export default connect(mapStateToProps)(withRouter(RoadmapView))
