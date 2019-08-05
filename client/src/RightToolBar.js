import React, { Component } from 'react'
import { Segment, Input, Dropdown } from 'semantic-ui-react'
import './RightToolBar.css'

import shapeClick from './shapeClick.svg'

class ColorGrid extends Component {
    render() {
        return (
            <div className="colorGrid">
                {this.props.colors.map(eachColor => (
                    <div
                        style={{
                            backgroundColor: eachColor,
                            borderColor: 'grey',
                            borderWidth: '.5px',
                            borderStyle: 'solid',
                            width: '30px',
                            height: '30px',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                        onClick={() => {
                            let shape = this.props.stage.findOne(
                                '.' + this.props.selectedName
                            )
                            var yeah = {
                                shape: shape,
                                color: eachColor,
                                type: this.props.type
                            }
                            this.props.useFill(yeah)
                        }}
                    />
                ))}
            </div>
        )
    }
}
const countryOptions = [
    { key: 'ar', value: 'Arial', text: 'Arial' },
    { key: 'ax', value: 'Belgrano', text: 'Belgrano' },
    { key: 'al', value: 'Times New Roman', text: 'Times New Roman' }
]

class RightToolBar extends Component {
    constructor(props) {
        super(props)
        this.state = { collapsed: false }
        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(event) {
        var reader = new FileReader()
        var newImage = new window.Image()
        reader.readAsDataURL(event.target.files[0])
        reader.onload = function() {
            newImage.src = reader.result
        }

        let shape = this.props.stage.findOne('.' + this.props.selectedName)

        shape.setAttr('fillPatternImage', newImage)
        shape.setAttr('useImage', true)
        this.setState({ image: newImage.src })

        this.props.newImage(shape)
    }

    render() {
        const colors = [
            '#000000',
            '#737373',
            '#a6a6a6',
            '#fff',
            '#ff5757',
            '#ffde59',
            '#ffbd59',
            '#ff914d',
            '#ff66c4',
            '#cb6ce6',
            '#8c52ff',
            '#5271ff',
            '#38b6ff',
            '#5ce1e6',
            '#7ed957',
            '#c9e265'
        ]
        let inputs
        if (this.props.selectedName === '') {
            inputs = (
                <div
                    style={{
                        marginTop: '.75rem',
                        height: 'auto',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        display: 'block',
                        textAlign: 'center'
                    }}
                >
                    <img
                        alt="placeholder"
                        src={shapeClick}
                        style={{
                            width: '140px',
                            height: 'auto',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            display: 'block'
                        }}
                    />
                    <br />
                    <a>Click a shape to edit its properties</a>
                </div>
            )
        } else if (this.props.selectedName.includes('text')) {
            inputs = (
                <React.Fragment>
                    <div style={{ position: 'relative', top: '1rem' }}>
                        <span
                            style={{
                                position: 'relative',
                                left: '1.25rem',

                                color: 'grey'
                            }}
                        >
                            Fill
                        </span>
                        <ColorGrid
                            type="shapeFill"
                            colors={colors}
                            stage={this.props.stage}
                            selectedName={this.props.selectedName}
                            useFill={stuff => {
                                this.props.useFill(stuff)
                            }}
                        />
                    </div>
                    <br />
                    <span
                        style={{
                            position: 'relative',
                            left: '1.25rem',
                            top: '1rem',
                            color: 'grey'
                        }}
                    >
                        FontSize:
                    </span>
                    <br />
                    <Input
                        style={{
                            marginLeft: '1.25rem',
                            marginTop: '2rem',
                            overflow: 'hidden',
                            width: '10rem'
                        }}
                        defaultValue={
                            this.props.stage.findOne(
                                '.' + this.props.selectedName
                            )
                                ? this.props.stage.findOne(
                                    '.' + this.props.selectedName
                                ).attrs.fontSize
                                : null
                        }
                        onBlur={event => {
                            //careful, state is not updated but refs is
                            var toChange = this.props.stage.findOne(
                                '.' + this.props.selectedName
                            )
                            if (
                                toChange !== undefined &&
                                event.target.value > 1 &&
                                event.target.value <= 100
                            ) {
                                var toSet = {
                                    target: toChange,
                                    attribute: 'fontSize',
                                    value: event.target.value
                                }
                                this.props.setTextAttr(toSet)
                            }
                        }}
                        onKeyDown={event => {
                            if (event.keyCode === 13) {
                                var toChange = this.props.stage.findOne(
                                    '.' + this.props.selectedName
                                )
                                if (
                                    toChange !== undefined &&
                                    event.target.value > 1 &&
                                    event.target.value <= 100
                                ) {
                                    var toSet = {
                                        target: toChange,
                                        attribute: 'fontSize',
                                        value: event.target.value
                                    }
                                    this.props.setTextAttr(toSet)
                                }
                            }
                        }}
                    />

                    <span
                        style={{
                            position: 'relative',
                            left: '1.25rem',
                            top: '1rem',
                            color: 'grey'
                        }}
                    >
                        Font:
                    </span>

                    <Dropdown
                        style={{
                            marginLeft: '1.25rem',
                            marginTop: '2rem',

                            width: '10rem'
                        }}
                        defaultValue={
                            this.props.stage.findOne(
                                '.' + this.props.selectedName
                            )
                                ? this.props.stage.findOne(
                                    '.' + this.props.selectedName
                                ).attrs.fontFamily
                                : null
                        }
                        fluid
                        search
                        selection
                        options={countryOptions}
                        onChange={(event, data) => {
                            let newFont = data.value
                            var toChange = this.props.stage.findOne(
                                '.' + this.props.selectedName
                            )
                            if (toChange) {
                                let toPush = {
                                    target: toChange,
                                    attribute: 'fontFamily',
                                    value: newFont
                                }

                                this.props.setTextAttr(toPush)
                            }
                        }}
                    />

                    <span
                        style={{
                            position: 'relative',
                            left: '1.25rem',
                            top: '1rem',
                            color: 'grey'
                        }}
                    >
                        External URL Link to:
                    </span>
                    <br />
                    <Input
                        style={{
                            marginLeft: '1.25rem',
                            marginTop: '2rem',
                            overflow: 'hidden',
                            width: '10rem',
                            fontSize: '13px'
                        }}
                        defaultValue={
                            this.props.stage.findOne(
                                '.' + this.props.selectedName
                            )
                                ? this.props.stage.findOne(
                                    '.' + this.props.selectedName
                                ).attrs.link
                                : null
                        }
                        placeholder="Include https:// plz!"
                        onBlur={event => {
                            //careful, state is not updated but refs is
                            var toChange = this.props.stage.findOne(
                                '.' + this.props.selectedName
                            )
                            if (toChange) {
                                var toSet = {
                                    target: toChange,
                                    attribute: 'link',
                                    value: event.target.value
                                }
                                toChange.setAttr('link', event.target.value)

                                this.props.setTextAttr(toSet)
                            }
                        }}
                        onKeyDown={event => {
                            if (event.keyCode === 13) {
                                var toChange = this.props.stage.findOne(
                                    '.' + this.props.selectedName
                                )
                                if (toChange) {
                                    var toSet = {
                                        target: toChange,
                                        attribute: 'link',
                                        value: event.target.value
                                    }
                                    toChange.setAttr('link', event.target.value)
                                    this.props.setTextAttr(toSet)
                                }
                            }
                        }}
                    />
                </React.Fragment>
            )
        } else if (this.props.selectedName.includes('arrow')) {
            inputs = (
                <div style={{ position: 'relative', top: '1rem' }}>
                    <span
                        style={{
                            position: 'relative',
                            left: '1.25rem',

                            color: 'grey'
                        }}
                    >
                        Arrow Head
                    </span>
                    <ColorGrid
                        type="shapeFill"
                        colors={colors}
                        stage={this.props.stage}
                        selectedName={this.props.selectedName}
                        useFill={stuff => {
                            this.props.useFill(stuff)
                        }}
                    />

                    <div>
                        <div
                            style={{
                                width: '200px',
                                display: 'inline-block',
                                textAlign: 'center',
                                paddingLeft: '10px',
                                paddingRight: '10px',
                                wordWrap: 'break-word'
                            }}
                        >
                            <input
                                ref="fileInputRef"
                                type="file"
                                hidden
                                onChange={this.handleChange}
                            />
                        </div>
                    </div>
                    <div style={{ position: 'relative', top: '.25rem' }}>
                        <span
                            style={{
                                position: 'relative',
                                marginLeft: '1.25rem',

                                color: 'grey'
                            }}
                        >
                            Arrow Body
                        </span>
                        <ColorGrid
                            type="strokeFill"
                            colors={colors}
                            stage={this.props.stage}
                            selectedName={this.props.selectedName}
                            useFill={stuff => {
                                this.props.useFill(stuff)
                            }}
                        />
                    </div>
                </div>
            )
        } else {
            inputs = (
                <div style={{ position: 'relative', top: '1rem' }}>
                    <span
                        style={{
                            position: 'relative',
                            left: '1.25rem',

                            color: 'grey'
                        }}
                    >
                        Fill
                    </span>
                    <ColorGrid
                        type="shapeFill"
                        colors={colors}
                        stage={this.props.stage}
                        selectedName={this.props.selectedName}
                        useFill={stuff => {
                            this.props.useFill(stuff)
                        }}
                    />

                    <div>
                        <div
                            style={{
                                width: '200px',
                                display: 'inline-block',
                                textAlign: 'center',
                                paddingLeft: '10px',
                                paddingRight: '10px',
                                wordWrap: 'break-word'
                            }}
                        >
                            <input
                                ref="fileInputRef"
                                type="file"
                                hidden
                                onChange={this.handleChange}
                            />
                        </div>
                    </div>
                    <div style={{ position: 'relative', top: '.25rem' }}>
                        <span
                            style={{
                                position: 'relative',
                                marginLeft: '1.25rem',

                                color: 'grey'
                            }}
                        >
                            Stroke
                        </span>
                        <ColorGrid
                            type="strokeFill"
                            colors={colors}
                            stage={this.props.stage}
                            selectedName={this.props.selectedName}
                            useFill={stuff => {
                                this.props.useFill(stuff)
                            }}
                        />
                    </div>
                    <span
                        style={{
                            position: 'relative',
                            left: '1.25rem',
                            top: '1rem',
                            color: 'grey'
                        }}
                    >
                        External URL Link to:
                    </span>
                    <br />
                    <Input
                        style={{
                            marginLeft: '1.25rem',
                            marginTop: '2rem',
                            overflow: 'hidden',
                            width: '10rem',
                            fontSize: '13px'
                        }}
                        defaultValue={
                            this.props.stage.findOne(
                                '.' + this.props.selectedName
                            )
                                ? this.props.stage.findOne(
                                    '.' + this.props.selectedName
                                ).attrs.link
                                : null
                        }
                        placeholder="Include https:// plz!"
                        onBlur={event => {
                            //careful, state is not updated but refs is
                            var toChange = this.props.stage.findOne(
                                '.' + this.props.selectedName
                            )
                            if (toChange) {
                                var toSet = {
                                    target: toChange,
                                    attribute: 'link',
                                    value: event.target.value
                                }
                                toChange.setAttr('link', event.target.value)
                                this.props.setObjectAttr(toSet)
                            }
                        }}
                        onKeyDown={event => {
                            if (event.keyCode === 13) {
                                var toChange = this.props.stage.findOne(
                                    '.' + this.props.selectedName
                                )
                                if (toChange) {
                                    var toSet = {
                                        target: toChange,
                                        attribute: 'link',
                                        value: event.target.value
                                    }
                                    toChange.setAttr('link', event.target.value)
                                    this.props.setObjectAttr(toSet)
                                }
                            }
                        }}
                    />
                </div>
            )
        }

        return (
            <React.Fragment>
                {this.props.stage ? (
                    <React.Fragment>
                        <Segment.Group
                            id="collapsedSegment"
                            className="collapsedSegment"
                        >
                            <Segment
                                style={{
                                    height: window.innerHeight,
                                    overflow: 'auto'
                                }}
                            >
                                {inputs}
                            </Segment>
                        </Segment.Group>
                        <div
                            style={{
                                position: 'absolute',
                                top: window.innerHeight / 2,
                                width: '25px',
                                height: '50px',
                                backgroundColor: 'white',
                                borderBottomLeftRadius: '200px',
                                borderTopLeftRadius: '200px',
                                border: '2px solid gray',
                                borderRight: '0'
                            }}
                            className={
                                this.state.collapsed
                                    ? 'uncollapsed'
                                    : 'collapsed'
                            }
                            ref={() => {
                                this.top =
                                    document
                                        .getElementById('collapsedSegment')
                                        .getBoundingClientRect().height / 2
                            }}
                            onClick={() => {
                                const collapsed = document.getElementById(
                                    'collapsedSegment'
                                )
                                collapsed.classList.toggle('uncollapsedSegment')
                                //at first collapsed, set to uncollpased
                                this.setState({
                                    collapsed: !this.state.collapsed
                                })
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
                ) : null}
            </React.Fragment>
        )
    }
}

export default RightToolBar
