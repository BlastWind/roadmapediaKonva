import React, { Component } from "react";
import { Menu } from "semantic-ui-react";
import "./HomeNav.css";
class HomeNav extends Component {
  render() {
    const white = {
      color: "white",
      fontFamily: "Saira, sans-serif",

      paddingBottom: ".75rem"
    };
    const fixedMenuStyle = {
      border: ".5px solid #ffffff"
    };
    return (
      <Menu borderless style={fixedMenuStyle} className="HomeNav">
        <Menu.Item as="a" style={white}>
          Featured
        </Menu.Item>
        <Menu.Item as="a" style={white}>
          Best of All Time
        </Menu.Item>
        <Menu.Item as="a" style={white}>
          By Category
        </Menu.Item>
      </Menu>
    );
  }
}

export default HomeNav;
