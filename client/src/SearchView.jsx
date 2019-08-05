import React, { Component } from 'react'
import { Card, Image, Icon, Label, Pagination } from 'semantic-ui-react'
class SearchView extends Component {
    state = { roadmaps: [], isLoading: true }
    async componentDidMount() {
        let searchPhrase = this.props.history.location.pathname.slice(8)

        await fetch('/api/roadmap/getRoadmapsBySearch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ searchPhrase: decodeURI(searchPhrase) })
        })
            .then(res => {
                res.json().then(roadmaps => {
                    this.setState({ roadmaps: roadmaps, isLoading: false })
                })
            })
            .then(res => {
                fetch('/api/roadmap/getRoadmapsBySearchThumbnails', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        searchPhrase: decodeURI(searchPhrase)
                    })
                })
                    .then(res => {
                        res.json().then(thumbnails => {
                            var base64Flag = 'data:image/jpeg;base64,'
                            thumbnails.forEach((thumbnail, index) => {
                                var imgStr = this.arrayBufferToBase64(
                                    thumbnail.thumbnail.data.data
                                )

                                this.state.roadmaps[index].convertedThumbnail =
                                    base64Flag + imgStr
                                this.forceUpdate()
                            })
                        })
                    })
                    .catch(err => alert(err))
            })

            .catch(err => alert(err))
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
            marginTop: '3rem'
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
            <div>
                <h1
                    style={{
                        marginTop: '1.5rem',
                        marginLeft: '1.5rem'
                    }}
                >
                    {this.props.history.location.pathname.slice(8)}
                </h1>
                {this.state.isLoading ? (
                    <Icon
                        loading
                        name="circle notch"
                        size="massive"
                        id="centerIcon"
                    />
                ) : this.state.roadmaps.length === 0 ? (
                    <div style={{ marginLeft: '1.5rem' }}>Nothing found</div>
                ) : (
                    <Card.Group centered style={CardGroupStyle}>
                        {this.state.roadmaps.map((eachRoadmap, index) => (
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
                                        src={eachRoadmap.convertedThumbnail}
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
                                                    position: 'relative',
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
                                        {eachRoadmap.title}asdf
                                    </Card.Header>
                                    <Card.Description>
                                        <Icon name="eye" />
                                        {eachRoadmap.views}
                                    </Card.Description>
                                </Card.Content>
                            </Card>
                        ))}
                    </Card.Group>
                )}
            </div>
        )
    }
}

export default SearchView
