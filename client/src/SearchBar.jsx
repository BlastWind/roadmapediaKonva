import React, { Component } from 'react'
import { Transition, Icon, Container } from 'semantic-ui-react'
import { withRouter } from 'react-router-dom'
class SearchBar extends Component {
    componentWillUnmount() {}
    componentDidMount() {
        this.setState({ visible: true })
    }
    state = { visible: false, searchValue: '' }

    toggleVisibility = () =>
        this.setState(prevState => ({ visible: !prevState.visible }))
    render() {
        const { visible } = this.state
        return (
            <Transition visible={visible} animation="scale" duration={500}>
                <Container style={{ padding: '26px 0' }} id="container">
                    <Icon
                        name="delete"
                        onClick={() => {
                            this.props.setSearch()
                            this.toggleVisibility()
                        }}
                        style={{ cursor: 'pointer' }}
                    />

                    <input
                        maxLength={50}
                        style={{
                            borderTop: '0',
                            borderLeft: '0',
                            borderRight: '0',
                            outline: 'none'
                        }}
                        onChange={e => {
                            this.setState({ searchValue: e.target.value })
                        }}
                    />
                    <Icon
                        name="search"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            if (this.state.searchValue) {
                                if (
                                    this.props.history.location.pathname.includes(
                                        'search'
                                    )
                                ) {
                                    this.props.history.push(
                                        `/search/${this.state.searchValue}`
                                    )
                                    window.location.reload()
                                } else {
                                    this.props.history.push(
                                        `/search/${this.state.searchValue}`
                                    )
                                }
                            }
                        }}
                    />
                </Container>
            </Transition>
        )
    }
}

export default withRouter(SearchBar)
