import React, { Component } from 'react'
import { Button, Icon } from 'semantic-ui-react'
import './About.css'
class About extends Component {
    render() {
        return (
            <div>
                <div
                    style={{
                        marginTop: '1.5rem',
                        marginLeft: '1.5rem',
                        maxWidth: '80%',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}
                >
                    Hi! My name is Andrew Chen, I was born in China and
                    currently reside in Virginia, and I am the maker and
                    maintainer of Roadmapedia. If you have any questions, throw
                    me an email at andrewchen14250@gmail or
                    andrew.chen@roadmapedia.com. This is version 1.0 of
                    Roadmapedia, so new updates with better features will be
                    coming soon.
                </div>
                <span>
                    <Button
                        className="discord"
                        style={{ marginTop: '1rem' }}
                        onClick={() =>
                            window.open('https://discord.gg/WD82qNM', '_blank')
                        }
                        target="_blank"
                    >
                        <Icon name="discord" />
                        <span>Join The Roadmapedia discord community!</span>
                    </Button>
                </span>
            </div>
        )
    }
}

export default About
