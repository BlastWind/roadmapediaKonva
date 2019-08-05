//thoughts: is positioning righttoolBar absolutely the best option?

import React, { Component } from 'react'
import Graphics from './Graphics.js'



class GraphicsMain extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedName: '',
            graphicsStage: ''
        }
    }

    render() {
        return (
            <React.Fragment>
                <Graphics
                    rectangles={this.state.rectangles}
                    circles={this.state.circles}
                    onSelect={name => {
                        this.setState({ selectedName: name })
                    }}
                    stage={e => {
                        this.setState({ graphicsStage: e })
                    }}
                />
            </React.Fragment>
        )
    }
}

export default GraphicsMain
