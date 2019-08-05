import React, { Component } from 'react'
import { Card, Image, Icon, Label } from 'semantic-ui-react'

import HomeNav from './HomeNav.js'

import cloudPic from './upload.svg'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { setModalState } from './actions/authActions'
import Featured from './HomeComponents/Featured.jsx'
import BestByCategory from './HomeComponents/BestByCategory.jsx'
import About from './HomeComponents/About.jsx'
//currently incorrect, getAllRoadaps should only return ID & thumbnail
//right now, getAllRoadmaps is also returning the data,

class Home extends Component {
    state = { imageSrc: cloudPic, roadmaps: [], isLoading: true }

    componentWillUnmount() {
        this.ismounted = false
    }

    render() {
        //CSS BREAKPOINTS: 576px, 768px,  1200px
        let content
        if (this.props.history.location.pathname.slice(5) === '/featured') {
            content = <Featured />
        } else if (
            this.props.history.location.pathname.slice(5) === '/bestbycategory'
        ) {
            content = <BestByCategory />
        } else if (this.props.history.location.pathname.slice(5) === '/about') {
            content = <About />
        }
        return (
            <React.Fragment>
                <HomeNav />
                <div>{content}</div>
            </React.Fragment>
        )
    }
}
const mapStateToProps = state => ({
    auth: state.auth,
    modal: state.modal
})
export default connect(
    mapStateToProps,
    { setModalState }
)(withRouter(Home))
