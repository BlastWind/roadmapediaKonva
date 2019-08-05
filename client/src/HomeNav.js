import React, { Component } from 'react'
import { Menu } from 'semantic-ui-react'
import './HomeNav.css'
import { Link, withRouter } from 'react-router-dom'
class HomeNav extends Component {
    render() {
        const white = {
            color: 'white',
            fontFamily: 'Saira, sans-serif',

            paddingBottom: '.75rem'
        }
        const fixedMenuStyle = {
            border: '.5px solid #ffffff'
        }
        return (
            <Menu borderless style={fixedMenuStyle} className="HomeNav">
                <Menu.Item as="a" style={white}>
                    <Link style={{ color: 'white' }} to="/home/featured">
                        Featured
                    </Link>
                </Menu.Item>
                <Menu.Item as="a" style={white}>
                    <Link style={{ color: 'white' }} to="/home/bestbycategory">
                        By Hottest Category
                    </Link>
                </Menu.Item>
                <Link to="/home/about">
                    <Menu.Item as="a" style={white}>
                        About Roadmapedia
                    </Menu.Item>
                </Link>
            </Menu>
        )
    }
}

export default withRouter(HomeNav)
