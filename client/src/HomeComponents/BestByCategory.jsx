import React, { Component } from 'react'
import { Card, Image, Icon, Label, Popup } from 'semantic-ui-react'
import cloudPic from '../upload.svg'
import { withRouter } from 'react-router-dom'
class BestByCategory extends Component {
    state = { imageSrc: cloudPic, roadmaps: [], isLoading: true }
    async componentDidMount() {
        this.ismounted = true

        await fetch('/api/roadmap/getFeaturedRoadmapsButThumbnails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ limit: 25 })
        })
            .then(res => {
                res.json().then(roadmaps => {
                    let data = []
                    roadmaps.forEach(roadmap => {
                        var json = roadmap
                        json.data = JSON.parse(roadmap.data)

                        if (!data[json.category]) {
                            data[json.category] = []
                        }
                        data[json.category].push(json)

                        //    data.push(json)
                    })
                    if (this.ismounted) {
                        this.setState({ roadmaps: data, isLoading: false })
                    }
                })
            })
            .then(res => {
                fetch('/api/roadmap/getFeaturedRoadmapsThumbnails', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ limit: 25 })
                }).then(res => {
                    res.json().then(thumbnails => {
                        var base64Flag = 'data:image/jpeg;base64,'
                        thumbnails.forEach(thumbnail => {
                            var imgStr = this.arrayBufferToBase64(
                                thumbnail.thumbnail.data.data
                            )

                            if (this.ismounted) {
                                var roadmaps = this.state.roadmaps
                                var thumbnailRoadmapId = thumbnail._id
                                var newRoadmaps
                                for (let eachCategory in this.state.roadmaps) {
                                    for (let eachRoadmap in this.state.roadmaps[
                                        eachCategory
                                    ]) {
                                        if (
                                            this.state.roadmaps[eachCategory][
                                                eachRoadmap
                                            ]._id === thumbnailRoadmapId
                                        ) {
                                            this.state.roadmaps[eachCategory][
                                                eachRoadmap
                                            ].convertedThumbnail =
                                                base64Flag + imgStr
                                            this.forceUpdate()
                                        }
                                    }
                                }
                            }
                        })
                    })
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
        const CardGroupStyle = {
            maxWidth: '80rem',
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingTop: '1rem',

            paddingBottom: '1rem'
        }
        const ImageStyle = {
            width: '256px',
            height: '144px'
        }
        const ContentStyle = {
            paddingTop: '22px',
            paddingBottom: '18px'
        }
        const CardStyle = {
            maxWidth: '256px',
            cursor: 'pointer'
        }

        var that = this

        return (
            <React.Fragment>
                {this.state.isLoading ? (
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
                ) : (
                    Object.keys(that.state.roadmaps).map(function(key) {
                        return (
                            <div>
                                <h1
                                    style={{
                                        marginTop: '1.5rem',
                                        marginLeft: '1.5rem'
                                    }}
                                >
                                    {key}
                                </h1>
                                <br />
                                <Card.Group centered style={CardGroupStyle}>
                                    {that.state.roadmaps[key].map(
                                        eachRoadmap => {
                                            {
                                                return (
                                                    <Popup
                                                        position="bottom left"
                                                        header={
                                                            eachRoadmap.title
                                                        }
                                                        content={
                                                            eachRoadmap.description
                                                        }
                                                        trigger={
                                                            <Card
                                                                style={
                                                                    CardStyle
                                                                }
                                                                onClick={() => {
                                                                    that.props.history.push(
                                                                        `/roadmap/${
                                                                            eachRoadmap._id
                                                                        }`
                                                                    )
                                                                }}
                                                            >
                                                                {eachRoadmap.convertedThumbnail ? (
                                                                    <Image
                                                                        src={
                                                                            eachRoadmap.convertedThumbnail
                                                                        }
                                                                        style={
                                                                            ImageStyle
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <React.Fragment>
                                                                        <div
                                                                            style={
                                                                                ImageStyle
                                                                            }
                                                                        >
                                                                            <Icon
                                                                                loading
                                                                                name="circle notch"
                                                                                size="massive"
                                                                                color="black"
                                                                                style={{
                                                                                    position:
                                                                                        'relative',
                                                                                    top:
                                                                                        '1rem',
                                                                                    marginLeft:
                                                                                        'auto',
                                                                                    marginRight:
                                                                                        'auto',
                                                                                    display:
                                                                                        'block'
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </React.Fragment>
                                                                )}

                                                                <Card.Content
                                                                    style={
                                                                        ContentStyle
                                                                    }
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
                                                                        {
                                                                            eachRoadmap.title
                                                                        }
                                                                    </Card.Header>
                                                                    <Card.Description>
                                                                        <Icon name="eye" />
                                                                        {
                                                                            eachRoadmap.views
                                                                        }
                                                                    </Card.Description>
                                                                </Card.Content>
                                                            </Card>
                                                        }
                                                    />
                                                )
                                            }
                                        }
                                    )}
                                </Card.Group>
                            </div>
                        )
                    })
                )}
            </React.Fragment>
        )
    }
}

export default withRouter(BestByCategory)
