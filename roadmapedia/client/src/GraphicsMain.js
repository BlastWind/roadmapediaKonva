//thoughts: is positioning righttoolBar absolutely the best option?

import React, { Component } from "react";
import Graphics from "./Graphics.js";
import Toolbar from "./Toolbar.js";
import RightToolBar from "./RightToolBar.js";
import { Stage, Layer, Rect, Transformer } from "react-konva";
class GraphicsMain extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedName: "",
      graphicsStage: ""
    };
  }

  render() {
    return (
      <React.Fragment>
        <Graphics
          rectangles={this.state.rectangles}
          circles={this.state.circles}
          onSelect={name => {
            this.setState({ selectedName: name });
          }}
          stage={e => {
            this.setState({ graphicsStage: e });
          }}
        />
      </React.Fragment>
    );
  }
}

export default GraphicsMain;
