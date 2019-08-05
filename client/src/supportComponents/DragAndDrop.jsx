import React, { Component } from 'react'
class DragAndDrop extends Component {
    dropRef = React.createRef()
    handleDrag = e => {
        e.preventDefault()
        e.stopPropagation()
    }
    state = {
        dragging: false
    }
    handleDragIn = e => {
        e.preventDefault()
        e.stopPropagation()
        this.dragCounter++
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            this.setState({ dragging: true })
        }
    }
    handleDragOut = e => {
        e.preventDefault()
        e.stopPropagation()
        this.dragCounter--
        if (this.dragCounter > 0) return
        this.setState({ dragging: false })
    }
    handleDrop = event => {
        event.preventDefault()
        event.stopPropagation()
        this.setState({ drag: false })
        if (event.dataTransfer.files && event.dataTransfer.files.length === 1) {
            this.props.handleDrop(event.dataTransfer.files[0])
            event.dataTransfer.clearData()
            this.dragCounter = 0
            this.setState({ dragging: false })
        }
    }
    componentDidMount() {
        this.dragCounter = 0
        let div = this.dropRef.current
        div.addEventListener('dragenter', this.handleDragIn)
        div.addEventListener('dragleave', this.handleDragOut)
        div.addEventListener('dragover', this.handleDrag)
        div.addEventListener('drop', this.handleDrop)
    }
    componentWillUnmount() {
        let div = this.dropRef.current
        div.removeEventListener('dragenter', this.handleDragIn)
        div.removeEventListener('dragleave', this.handleDragOut)
        div.removeEventListener('dragover', this.handleDrag)
        div.removeEventListener('drop', this.handleDrop)
    }
    render() {
        return (
            <div
                style={{ display: 'inline-block', position: 'relative' }}
                ref={this.dropRef}
            >
                {this.state.dragging && (
                    <div
                        style={{
                            border: 'dashed grey 4px',
                            backgroundColor: 'rgba(255,255,255,.8)',
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            zIndex: 9999
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                right: 0,
                                left: 0,
                                textAlign: 'center',
                                color: 'grey',
                                fontSize: 36
                            }}
                        >
                            <div>Drop it like it's hot :)</div>
                        </div>
                    </div>
                )}
                {this.props.children}
            </div>
        )
    }
}
export default DragAndDrop
