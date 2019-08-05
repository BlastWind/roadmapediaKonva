import React, { Component } from 'react'
import { Card, Image, Icon, Label, Pagination, Popup } from 'semantic-ui-react'
import cloudPic from '../upload.svg'
import { withRouter } from 'react-router-dom'
class Featured extends Component {
    state = {
        imageSrc: cloudPic,
        roadmaps: [],
        isLoading: true
    }
    async componentDidMount() {
        this.ismounted = true

        await fetch('/api/roadmap/getFeaturedRoadmapsButThumbnails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ limit: 12 })
        })
            .then(res => {
                res.json().then(roadmaps => {
                    let data = []
                    roadmaps.forEach(roadmap => {
                        var json = roadmap
                        json.data = JSON.parse(roadmap.data)

                        data.push(json)
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
                    body: JSON.stringify({ limit: 12 })
                }).then(res => {
                    res.json().then(thumbnails => {
                        //roadmaps: [[roadmap1], [roadmap2], ..]
                        var base64Flag = 'data:image/jpeg;base64,'
                        thumbnails.forEach((thumbnail, index) => {
                            var imgStr = this.arrayBufferToBase64(
                                thumbnail.thumbnail.data.data
                            )

                            if (this.ismounted) {
                                this.state.roadmaps[index].convertedThumbnail =
                                    base64Flag + imgStr
                                this.forceUpdate()
                            }
                        })
                    })
                })
            })

            .catch(err => alert(err))
    }

    componentWillUnmount() {
        this.ismounted = false
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
            marginTop: '3rem',
            paddingBottom: '4rem'
        }
        const ImageStyle = {
            width: '256px',
            height: '144px'
        }
        const ContentStyle = {
            paddingTop: '22px',
            paddingBottom: '18px',
            width: '256px'
        }
        const CardStyle = {
            maxWidth: '256px',
            cursor: 'pointer',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
        }
        return (
            <React.Fragment>
                <Card.Group centered style={CardGroupStyle}>
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
                        this.state.roadmaps.map((eachRoadmap, index) => (
                            <Popup
                                position="bottom left"
                                key={index}
                                header={eachRoadmap.title}
                                content={eachRoadmap.description}
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
                                            <Image
                                                src={
                                                    eachRoadmap.convertedThumbnail
                                                }
                                                style={ImageStyle}
                                            />
                                        ) : (
                                            <React.Fragment>
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
                                                            marginLeft: 'auto',
                                                            marginRight: 'auto',
                                                            display: 'block'
                                                        }}
                                                    />
                                                </div>
                                            </React.Fragment>
                                        )}

                                        <Card.Content style={ContentStyle}>
                                            <Card.Header
                                                style={{
                                                    overflow: 'hidden',
                                                    whiteSpace: 'nowrap',
                                                    textOverflow: 'ellipsis'
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
                        ))
                    )}
                </Card.Group>
            </React.Fragment>
        )
    }
}

export default withRouter(Featured)
