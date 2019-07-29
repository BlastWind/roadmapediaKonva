//todo: allow for picture inside of rect/circle/star
//todo: connect using arrow
//todo: for rightToolBar, show fontSize,fontFamily for text for the rest allow to add pictures
//todo: zoomable
import React, { Component } from "react";
import Konva from "konva";
import { render } from "react-dom";
import ReactDOM from "react-dom";
import {
  Stage,
  Layer,
  Rect,
  Transformer,
  Circle,
  Star,
  Text,
  Arrow,
  Image
} from "react-konva";
import Connector from "./Connector.jsx";
import Toolbar from "./Toolbar.js";
import RightToolBar from "./RightToolBar.js";
class TransformerComponent extends React.Component {
  componentDidMount() {
    this.checkNode();
  }
  componentDidUpdate() {
    this.checkNode();
  }
  checkNode() {
    const stage = this.transformer.getStage();

    const { selectedShapeName } = this.props;
    const selectedNode = stage.findOne("." + selectedShapeName);
    if (selectedNode === this.transformer.node()) {
      return;
    }

    if (selectedNode) {
      this.transformer.attachTo(selectedNode);
    } else {
      this.transformer.detach();
    }
    this.transformer.getLayer().batchDraw();
  }
  render() {
    if (this.props.selectedShapeName.includes("text")) {
      var stuff = (
        <Transformer
          ref={node => {
            this.transformer = node;
          }}
          name="transformer"
          boundBoxFunc={(oldBox, newBox) => {
            newBox.width = Math.max(30, newBox.width);
            return newBox;
          }}
          enabledAnchors={["middle-left", "middle-right"]}
        />
      );
    } else {
      var stuff = (
        <Transformer
          ref={node => {
            this.transformer = node;
          }}
          name="transformer"
          keepRatio={false}
        />
      );
    }
    return stuff;
  }
}

var history = [];
var historyStep = 0;

class Graphics extends Component {
  constructor() {
    super();
    this.state = {
      selectedShapeName: "",
      stageX: 0,
      stageY: 0,
      rectangles: [],
      circles: [],
      stars: [],
      texts: [],
      arrows: [],
      connectors: [],
      currentTextRef: "",

      textX: 0,
      textY: 0,
      textEditVisible: false,
      arrowDraggable: false,
      newArrowRef: "",
      count: 0,
      newArrowDropped: false,
      newConnectorDropped: false,
      arrowEndX: 0,
      arrowEndY: 0
    };
  }
  componentDidMount() {
    this.redoing = false;
    history.push(this.state);
  }

  componentDidUpdate(prevProps, prevState) {
    //if arrows, circles, rectorangles, connecotrs, rectangles, stars changed, store it
    let pastShapes = [
      prevState.rectangles,
      prevState.circles,
      prevState.stars,
      prevState.texts,
      prevState.arrows
    ];
    let presentShapes = [
      this.state.rectangles,
      this.state.circles,
      this.state.stars,
      this.state.texts,
      this.state.arrows
    ];

    //if we are not typing text or dragging arrow & states are different,
    //then log in history.

    if (this.state.currentTextRef != "" || this.state.arrowDraggable) {
      console.log("don't log this");
    } else if (!this.state.redoing) {
      if (JSON.stringify(pastShapes) != JSON.stringify(presentShapes)) {
        console.log(pastShapes[0], presentShapes[0]);
        var uh = history;
        history = uh.slice(0, historyStep + 1);
        //console.log("sliced", history);
        var toAppend = this.state;
        history = history.concat(toAppend);
        //console.log("new", history);
        historyStep += 1;
        //console.log(history, historyStep, history[historyStep]);
        console.log("logged in history");
      } else {
        console.log("loggable but nothing changed");
      }
    }
    this.state.redoing = false;
  }

  handleUndo = () => {
    if (historyStep === 0) {
      return;
    }
    historyStep -= 1;
    let previous = history[historyStep];
    console.log("undo history to step: " + historyStep);
    console.log("currently we are: ", history[historyStep + 1].rectangles);
    console.log("we are going back to: ", history[historyStep].rectangles);
    this.setState({
      rectangles: history[historyStep].rectangles,
      arrows: history[historyStep].arrows,
      circles: history[historyStep].circles,
      stars: history[historyStep].stars,
      texts: history[historyStep].texts,
      connectors: history[historyStep].connectors,
      redoing: true
    });
    /*this.state.rectangles = history[historyStep].rectangles;
    this.state.circles = history[historyStep].circles;
    this.state.stars = history[historyStep].stars;
    this.state.arrows = history[historyStep].arrows;
    this.state.connectors = history[historyStep].connectors;
    this.forceUpdate();*/
  };
  handleRedo = () => {
    if (historyStep === history.length - 1) {
      return;
    }
    historyStep += 1;
    const next = history[historyStep];
    this.setState({
      rectangles: history[historyStep].rectangles,
      arrows: history[historyStep].arrows,
      circles: history[historyStep].circles,
      stars: history[historyStep].stars,
      texts: history[historyStep].texts,
      connectors: history[historyStep].connectors,
      redoing: true
    });
  };

  handleStageClick = e => {
    console.log(this.refs.graphicStage);
    this.setState({
      selectedShapeName: e.target.name()
    });

    this.props.onSelect(e.target.name());

    //arrow logic
    if (this.state.newArrowRef != "") {
      let ref = this.state.newArrowRef;
      this.setState({ arrowDraggable: false, newArrowRef: "" });

      if (this.state.previousShape) {
        if (this.state.previousShape.attrs.id != "ContainerRect") {
          this.state.previousShape.setAttr("fill", this.state.lastFill);

          //console.log(this.refs.graphicStage.findOne("." + this.state.newArrowRef));
          //

          var newConnector = this.refs.graphicStage.findOne("." + ref);
          this.state.arrows.map(eachArrow => {
            if (eachArrow.attrs.name === ref) {
              eachArrow.setAttr("to", this.state.previousShape);
            }
          });

          //console.log(newConnector, this.state.newArrowRef);
          //newConnector.setAttr("to", this.state.previousShape);
          //console.log(newConnector);
        }
      }

      //handle connector more
      //if the currentArrow ref has a from, and that e.target.attrs.id isn't containerRect,
      //then find the current shape with stage find name and then yeah

      //arrow logic, there's e.evt.pageX, pageY
    }
  };
  handleMouseOver = event => {
    //get the currennt arrow ref and modify its position by filtering & pushing again

    //if we are moving an arrow
    if (this.state.newArrowRef != "") {
      console.log(this.state.newArrowRef);
      //filling color logic:
      var pos = this.refs.layer2.getStage().getPointerPosition();
      var shape = this.refs.layer2.getIntersection(pos);

      this.setState({ arrowEndX: pos.x, arrowEndY: pos.y });

      //last non arrow object
      if (shape && shape.attrs) {
        //  console.log(shape);
        if (!shape.attrs.name.includes("arrow")) {
          //after first frame
          if (this.state.previousShape)
            if (this.state.previousShape !== shape) {
              //arrow entered a new shape

              //the shape we left gets its original color back
              if (this.state.previousShape.attrs.id != "ContainerRect") {
                this.setState({ count: 0 });

                this.state.previousShape.setAttr("fill", this.state.lastFill);
              }
            }
            //if arrow is moving in a single shape
            else if (
              this.state.previousShape.attrs.id != "ContainerRect" &&
              !shape.attrs.name.includes("arrow")
            ) {
              //if it the first time the shapes are same, set shape to blue, store the original color
              if (this.state.count == 0) {
                this.setState({ lastFill: shape.attrs.fill });
                shape.setAttr("fill", "#ccf5ff");
              }
              this.setState({ count: this.state.count + 1 });
            }
        }

        if (!shape.attrs.name.includes("arrow")) {
          this.setState({ previousShape: shape });
        }
      }
    }
    var arrows = this.state.arrows;

    arrows.map(eachArrow => {
      if (eachArrow.attrs.name == this.state.newArrowRef) {
        var index = arrows.indexOf(eachArrow);
        let currentArrow = eachArrow;
        currentArrow.setAttr("points", [
          currentArrow.attrs.points[0],
          currentArrow.attrs.points[1],
          event.evt.pageX,
          event.evt.pageY -
            document.getElementById("NavBar").getBoundingClientRect().height
        ]);

        this.state.arrows[index] = eachArrow;
      }
    });
  };
  handleWheel = event => {
    event.evt.preventDefault();

    const scaleBy = 1.2;
    const stage = this.refs.graphicStage;
    const layer = this.refs.layer2;
    const oldScale = layer.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - this.state.stageX / oldScale,
      y: stage.getPointerPosition().y / oldScale - this.state.stageY / oldScale
    };

    const newScale =
      event.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    layer.scale({ x: newScale, y: newScale });

    console.log(
      oldScale,
      mousePointTo,
      stage.getPointerPosition().x,
      stage.getPointerPosition().y
    );

    this.setState({
      stageScale: newScale,
      stageX:
        -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      stageY:
        -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
    });
  };

  render() {
    return (
      <React.Fragment>
        <div
          onKeyDown={event => {
            if (event.ctrlKey && event.keyCode == 88) {
              console.log("delete elements if there is!");

              if (this.state.selectedShapeName != "") {
                this.refs.graphicStage
                  .findOne("." + this.state.selectedShapeName)
                  .destroy();
                this.setState({ selectedShapeName: "" });
                this.refs.layer2.draw();
                console.log(
                  "our state:" + this.state,
                  "our stage:" + this.refs.graphicStage
                );
              }
            }
            if (event.ctrlKey && event.keyCode == 67) {
              if (this.state.selectedShapeName != "") {
                this.setState(
                  {
                    copiedElement: this.refs.graphicStage.findOne(
                      "." + this.state.selectedShapeName
                    )
                  }
                  //  () => console.log(this.state.copiedElement)
                );
              }
            }
            if (event.ctrlKey && event.keyCode == 86) {
              let copiedElement = this.state.copiedElement;
              var length;
              if (copiedElement) {
                console.log(this.state.rectangles, copiedElement);
                if (copiedElement.attrs.name.includes("rectangle")) {
                  length = this.state.rectangles.length + 1;
                  var toPush = {
                    x: copiedElement.attrs.x + 10,
                    y: copiedElement.attrs.y + 10,
                    width: copiedElement.attrs.width,
                    height: copiedElement.attrs.height,
                    stroke: copiedElement.attrs.stroke,
                    strokeWidth: copiedElement.attrs.strokeWidth,
                    name: "rectangle" + this.state.rectangles.length + 1,
                    ref: "rectangle" + this.state.rectangles.length + 1,
                    fill: copiedElement.attrs.fill,
                    useImage: copiedElement.attrs.useImage
                  };
                  this.setState(
                    prevState => ({
                      rectangles: [...prevState.rectangles, toPush]
                    }),
                    () => {
                      console.log(this.state.rectangles);
                      this.setState({
                        selectedShapeName: "rectangle" + length
                      });
                    }
                  );
                }
              }
            }

            if (event.ctrlKey && event.keyCode == 90) {
              this.handleUndo();
            } else if (event.ctrlKey && event.keyCode == 89) {
              this.handleRedo();
            }
          }}
          tabIndex="0"
          style={{ outline: "none", overflow: "hidden" }}
        >
          <Stage
            onClick={this.handleStageClick}
            height={window.innerHeight}
            width={window.innerWidth}
            ref="graphicStage"
          >
            <Layer
              scaleX={this.state.stageScale}
              scaleY={this.state.stageScale}
              height={window.innerHeight}
              width={window.innerWidth}
              onWheel={this.handleWheel}
              x={this.state.stageX}
              y={this.state.stageY}
              draggable
              ref="layer2"
            >
              <Rect
                width={window.innerWidth}
                height={window.innerHeight}
                name=""
                id="ContainerRect"
              />

              {this.state.rectangles.map(eachRect => {
                if (eachRect.useImage) {
                  return (
                    <Rect
                      ref={eachRect.ref}
                      fillPatternImage={eachRect.fillPatternImage}
                      name={eachRect.name}
                      x={eachRect.x}
                      y={eachRect.y}
                      width={eachRect.width}
                      height={eachRect.height}
                      stroke={eachRect.stroke}
                      strokeWidth={eachRect.strokeWidth}
                      draggable
                      onDragMove={() => {
                        this.state.arrows.map(eachArrow => {
                          if (eachArrow.attrs.from != undefined) {
                            if (
                              eachRect.name == eachArrow.attrs.from.attrs.name
                            ) {
                              eachArrow.setAttr("points", [
                                eachRect.x,
                                eachRect.y,
                                eachArrow.attrs.points[2],
                                eachArrow.attrs.points[3]
                              ]);
                              this.forceUpdate();
                              this.refs.layer2.batchDraw();
                            }
                          }

                          if (eachArrow.attrs.to != undefined) {
                            if (
                              eachRect.name == eachArrow.attrs.to.attrs.name
                            ) {
                              eachArrow.setAttr("points", [
                                eachArrow.attrs.points[0],
                                eachArrow.attrs.points[1],
                                eachRect.x,
                                eachRect.y
                              ]);
                              this.forceUpdate();
                              this.refs.layer2.batchDraw();
                            }
                          }
                        });
                      }}
                    />
                  );
                } else
                  return (
                    <Rect
                      ref={eachRect.ref}
                      fill={eachRect.fill}
                      name={eachRect.name}
                      x={eachRect.x}
                      y={eachRect.y}
                      width={eachRect.width}
                      height={eachRect.height}
                      stroke={eachRect.stroke}
                      strokeWidth={eachRect.strokeWidth}
                      draggable
                      onDragEnd={event => {
                        var shape = this.refs[eachRect.ref];
                        this.state.rectangles.map(eachRect => {
                          if (eachRect.name === shape.attrs.name) {
                            var index = this.state.rectangles.indexOf(eachRect);
                            this.setState(prevState => {
                              console.log(prevState.rectangles[index]);
                              let oldRects = [...prevState.rectangles];
                              oldRects[index].x = event.target.x();
                              oldRects[index].y = event.target.y();
                              console.log("new rects: ", oldRects);
                              var uh = history;
                              history = uh.slice(0, historyStep + 1);

                              var toAppend = this.state;
                              let hmm = this.state;
                              hmm.rectangles = oldRects;
                              history = history.concat(hmm);
                              console.log(history);
                              //console.log("new", history);
                              historyStep += 1;
                              return { rectangles: oldRects };
                            });
                          }
                        });
                      }}
                      onDragMove={() => {
                        this.state.arrows.map(eachArrow => {
                          if (eachArrow.attrs.from != undefined) {
                            if (
                              eachRect.name == eachArrow.attrs.from.attrs.name
                            ) {
                              eachArrow.setAttr("points", [
                                eachRect.x,
                                eachRect.y,
                                eachArrow.attrs.points[2],
                                eachArrow.attrs.points[3]
                              ]);
                              this.forceUpdate();
                              this.refs.layer2.batchDraw();
                            }
                          }

                          if (eachArrow.attrs.to != undefined) {
                            if (
                              eachRect.name == eachArrow.attrs.to.attrs.name
                            ) {
                              eachArrow.setAttr("points", [
                                eachArrow.attrs.points[0],
                                eachArrow.attrs.points[1],
                                eachRect.x,
                                eachRect.y
                              ]);
                              this.forceUpdate();
                              this.refs.layer2.batchDraw();
                            }
                          }
                        });
                      }}
                    />
                  );
              })}
              {this.state.circles.map(eachCircle => (
                <Circle
                  ref={eachCircle.ref}
                  name={eachCircle.name}
                  x={eachCircle.x}
                  y={eachCircle.y}
                  radius={eachCircle.radius}
                  fill={eachCircle.fill}
                  stroke={eachCircle.stroke}
                  strokeWidth={eachCircle.strokeWidth}
                  draggable
                />
              ))}
              {this.state.stars.map(eachStar => (
                <Star
                  ref={eachStar.ref}
                  name={eachStar.name}
                  x={eachStar.x}
                  y={eachStar.y}
                  innerRadius={eachStar.innerRadius}
                  outerRadius={eachStar.outerRadius}
                  numPoints={eachStar.numPoints}
                  stroke={eachStar.stroke}
                  strokeWidth={eachStar.strokeWidth}
                  fill={eachStar.fill}
                  draggable
                />
              ))}
              {this.state.texts.map(eachText => (
                //perhaps this.state.texts only need to contain refs?
                //so that we only need to store the refs to get more information
                <Text
                  onTransform={() => {
                    var currentText = this.refs[this.state.currentTextRef];
                    if (currentText) {
                      currentText.setAttr(
                        "width",
                        currentText.width() * currentText.scaleX()
                      );
                      currentText.setAttr("scaleX", 1);
                      currentText.draw();
                    }
                  }}
                  fill="black"
                  name={eachText.name}
                  ref={eachText.ref}
                  fontFamily={eachText.fontFamily}
                  fontSize={eachText.fontSize}
                  x={eachText.x}
                  y={eachText.y}
                  text={eachText.text}
                  draggable
                  onDblClick={() => {
                    // turn into textarea
                    var stage = this.refs.graphicStage;
                    var text = stage.findOne("." + eachText.name);

                    this.setState({
                      textX: text.absolutePosition().x,
                      textY: text.absolutePosition().y,
                      textEditVisible: !this.state.textEditVisible,
                      text: eachText.text,
                      textNode: eachText,
                      currentTextRef: eachText.ref,
                      textareaWidth: text.textWidth,
                      textareaHeight: text.textHeight,
                      textareaFill: text.attrs.fill,
                      textareaFontFamily: text.attrs.fontFamily,
                      textareaFontSize: text.attrs.fontSize
                    });
                    let textarea = this.refs.textarea;
                    textarea.focus();
                    text.hide();
                    var transformer = stage.findOne(".transformer");
                    transformer.hide();
                    this.refs.layer2.draw();
                  }}
                />
              ))}
              {this.state.arrows.map(eachArrow => {
                if (!eachArrow.attrs.from && !eachArrow.attrs.to) {
                  return (
                    <Arrow
                      name={eachArrow.attrs.name}
                      points={[
                        eachArrow.attrs.points[0],
                        eachArrow.attrs.points[1],
                        eachArrow.attrs.points[2],
                        eachArrow.attrs.points[3]
                      ]}
                      x={eachArrow.attrs.x}
                      y={eachArrow.attrs.y}
                      stroke="black"
                      fill="black"
                      draggable
                    />
                  );
                }

                if (
                  eachArrow.attrs.name == this.state.newArrowRef &&
                  (eachArrow.attrs.from || eachArrow.attrs.to)
                ) {
                  return (
                    <Connector
                      name={eachArrow.attrs.name}
                      from={eachArrow.attrs.from}
                      to={eachArrow.attrs.to}
                      arrowEndX={this.state.arrowEndX}
                      arrowEndY={this.state.arrowEndY}
                      current={true}
                    />
                  );
                } else if (eachArrow.attrs.from || eachArrow.attrs.to) {
                  //if not current
                  return (
                    <Connector
                      name={eachArrow.attrs.name}
                      from={eachArrow.attrs.from}
                      to={eachArrow.attrs.to}
                      points={eachArrow.attrs.points}
                      current={false}
                    />
                  );
                }
              })}

              {this.state.selectedShapeName.includes("text") ? (
                <TransformerComponent
                  selectedShapeName={this.state.selectedShapeName}
                />
              ) : (
                <TransformerComponent
                  selectedShapeName={this.state.selectedShapeName}
                />
              )}
            </Layer>

            <Layer
              height={window.innerHeight}
              width={window.innerWidth}
              ref="layer"
              draggable
            >
              <Toolbar
                layer={this.refs.layer2}
                rectName={this.state.rectangles.length + 1}
                circleName={this.state.circles.length + 1}
                starName={this.state.stars.length + 1}
                textName={this.state.texts.length + 1}
                newArrowOnDragEnd={position => {
                  if (position.from != undefined) {
                    //  console.log("we are making a connector");
                    var newArrow = new Konva.Arrow({
                      points: [position.x, position.y, position.x, position.y],
                      x: -this.refs.layer2.attrs.x,
                      y: -this.refs.layer2.attrs.y,
                      ref: "arrow" + (this.state.arrows.length + 1),
                      name: "arrow" + (this.state.arrows.length + 1),
                      from: position.from
                    });
                    this.setState({
                      newArrowRef: newArrow.attrs.name,
                      arrowEndX: position.x,
                      arrowEndY: position.y
                    });
                    //  console.log(newArrow);
                    this.setState(prevState => ({
                      arrows: [...prevState.arrows, newArrow],
                      newArrowDropped: true
                    }));
                  } else {
                    //  console.log("we are making just an aarrow");

                    var newArrow = new Konva.Arrow({
                      points: [position.x, position.y, position.x, position.y],
                      x: -this.refs.layer2.attrs.x,
                      y: -this.refs.layer2.attrs.y,
                      ref: "arrow" + (this.state.arrows.length + 1),
                      name: "arrow" + (this.state.arrows.length + 1)
                    });
                    this.setState({
                      newArrowRef: newArrow.attrs.name,
                      arrowEndX: position.x,
                      arrowEndY: position.y
                    });

                    this.setState(prevState => ({
                      arrows: [...prevState.arrows, newArrow],
                      newArrowDropped: true
                    }));
                  }

                  //this.refs updates after forceUpdate (because arrow gets instantiated), might be risky in the future
                  //only this.state.arrows.length because it was pushed earlier, cancelling the +1
                }}
                newConnectorOnDragEnd={shape => {
                  var newConnector = {
                    from: shape,
                    to: null,
                    name: this.state.connectors.length + 1
                  };
                  this.setState(prevState => ({
                    connectors: [...prevState.connectors, newConnector],
                    newConnectorDropped: true
                  }));
                }}
                appendToRectangles={stuff => {
                  var layer = this.refs.layer;
                  var toPush = stuff;
                  if (layer.attrs.x != null || layer.attrs.x != undefined) {
                    toPush.x = (stuff.x + layer.attrs.x) / this.state.scaleX;
                    toPush.y = stuff.y + layer.attrs.y;
                  }

                  toPush.x = toPush.x - this.refs.layer2.attrs.x;
                  toPush.y = toPush.y - this.refs.layer2.attrs.y;
                  this.setState(prevState => ({
                    rectangles: [...prevState.rectangles, toPush]
                  }));
                  this.setState({ selectedShapeName: toPush.name });
                }}
                appendToCircles={stuff => {
                  var layer = this.refs.layer;
                  var toPush = stuff;
                  if (layer.attrs.x != null || layer.attrs.x != undefined) {
                    toPush.x = stuff.x + layer.attrs.x;
                    toPush.y = stuff.y + layer.attrs.y;
                  }
                  //  console.log(this.refs.layer2);

                  toPush.x = toPush.x - this.refs.layer2.attrs.x;
                  toPush.y = toPush.y - this.refs.layer2.attrs.y;

                  this.setState(prevState => ({
                    circles: [...prevState.circles, toPush]
                  }));
                }}
                appendToStars={stuff => {
                  var layer = this.refs.layer;
                  var toPush = stuff;
                  if (layer.attrs.x != null || layer.attrs.x != undefined) {
                    toPush.x = stuff.x + layer.attrs.x;
                    toPush.y = stuff.y + layer.attrs.y;
                  }

                  toPush.x = toPush.x - this.refs.layer2.attrs.x;
                  toPush.y = toPush.y - this.refs.layer2.attrs.y;
                  this.setState(prevState => ({
                    stars: [...prevState.stars, toPush]
                  }));
                }}
                appendToTexts={stuff => {
                  var layer = this.refs.layer;
                  var toPush = stuff;
                  if (layer.attrs.x != null || layer.attrs.x != undefined) {
                    toPush.x =
                      stuff.x + layer.attrs.x + this.refs.layer2.attrs.x;
                    toPush.y =
                      stuff.y + layer.attrs.y + this.refs.layer2.attrs.y;
                  }

                  toPush.x = toPush.x - this.refs.layer2.attrs.x;
                  toPush.y = toPush.y - this.refs.layer2.attrs.y;
                  this.setState(prevState => ({
                    texts: [...prevState.texts, toPush]
                  }));
                  //we can also just get element by this.refs.toPush.ref
                  let stage = this.refs.graphicStage;
                  //  let text = stage.findOne("." + toPush.name);
                  let text = this.refs[toPush.ref];
                  //this.setState({firstTimeTextEditing: true});
                  text.fire("dblclick");
                }}
              />
            </Layer>
          </Stage>
          <textarea
            ref="textarea"
            id="textarea"
            value={this.state.text}
            onChange={e => {
              this.setState({ text: e.target.value });
            }}
            onKeyDown={e => {
              let textNode = this.refs[this.state.currentTextRef];
              let width = this.refs[this.state.currentTextRef].width();

              if (e.keyCode === 13) {
                // get the current textNode we are editing, get the name from there
                //match name with elements in this.state.texts,
                let node = this.refs[this.state.currentTextRef];

                let name = node.attrs.name;
                let matched = this.state.texts.filter(eachText => {
                  if (eachText.name == name) {
                    return eachText;
                  }
                });

                matched[0].text = this.state.text;
                node.show();
                this.refs.graphicStage.findOne(".transformer").show();
                this.refs.graphicStage.draw();
              }
            }}
            onBlur={() => {
              this.setState({ textEditVisible: false });

              // get the current textNode we are editing, get the name from there
              //match name with elements in this.state.texts,
              let node = this.refs[this.state.currentTextRef];
              if (node) {
                let name = node.attrs.name;
                let matched = this.state.texts.filter(eachText => {
                  if (eachText.name == name) {
                    return eachText;
                  }
                });

                matched[0].text = this.state.text;
                node.show();
                this.refs.graphicStage.findOne(".transformer").show();
                this.refs.graphicStage.draw();
              }
            }}
            style={{
              //set position, width, height, fontSize, overflow, lineHeight, color
              display: this.state.textEditVisible ? "block" : "none",
              position: "absolute",
              top: this.state.textY + 80 + "px",
              left: this.state.textX + "px",
              width: "500px",
              overflow: "hidden",
              fontSize: this.state.textareaFontSize,
              fontFamily: this.state.textareaFontFamily,
              color: this.state.textareaFill,
              border: "none",
              padding: "0px",
              margin: "0px",
              outline: "none",
              resize: "none",
              background: "none"
            }}
          />
          <RightToolBar
            selectedName={this.state.selectedShapeName}
            stage={this.refs.graphicStage}
            newImage={shape => {
              this.state.rectangles.map(eachRect => {
                console.log(
                  eachRect,
                  this.state.rectangles,
                  this.state.rectangles[0]
                );
                if (eachRect.name === shape.attrs.name) {
                  var index = this.state.rectangles.indexOf(eachRect);
                  this.state.rectangles[index].fillPatternImage =
                    shape.attrs.fillPatternImage;

                  this.state.rectangles[index].useImage = shape.attrs.useImage;
                  this.forceUpdate();
                }
              });
              console.log(this.state.rectangles);
            }}
            useFill={stuff => {
              let shapeName = stuff.shape.attrs.name;
              if (shapeName.includes("rect")) {
                this.state.rectangles.map(eachRect => {
                  if (eachRect.name === shapeName) {
                    var index = this.state.rectangles.indexOf(eachRect);
                    this.state.rectangles[index].useImage = false;

                    this.forceUpdate();
                    this.refs[shapeName].setAttr("useImage", false);
                    if (stuff.type === "shapeFill") {
                      this.refs[shapeName].setAttr("fill", stuff.color);

                      this.state.rectangles[index].fill = stuff.color;
                    } else if (stuff.type === "strokeFill") {
                      this.state.rectangles[index].stroke = stuff.color;
                      this.refs[shapeName].setAttr("stroke", stuff.colors);
                    }
                  }
                });
              }
              if (shapeName.includes("circle")) {
                this.state.circles.map(eachCircle => {
                  if (eachCircle.name === shapeName) {
                    var index = this.state.circles.indexOf(eachCircle);
                    this.state.circles[index].useImage = false;
                    this.state.circles[index].fill = stuff.color;
                    this.forceUpdate();
                    this.refs[shapeName].setAttr("useImage", false);
                    this.refs[shapeName].setAttr("fill", stuff.color);
                  }
                });
              }
              if (shapeName.includes("star")) {
                this.state.stars.map(eachstar => {
                  if (eachstar.name === shapeName) {
                    var index = this.state.stars.indexOf(eachstar);
                    this.state.stars[index].useImage = false;
                    this.state.stars[index].fill = stuff.color;
                    this.forceUpdate();
                    console.log("shapeName");
                    this.refs[shapeName].setAttr("useImage", false);
                    this.refs[shapeName].setAttr("fill", stuff.color);
                  }
                });
              }
              if (shapeName.includes("text")) {
                this.state.texts.map(eachText => {
                  if (eachText.name === shapeName) {
                    var index = this.state.texts.indexOf(eachText);
                    this.state.texts[index].fill = stuff.color;

                    console.log("shapeName");
                    this.refs[shapeName].setAttr("fill", stuff.color);
                    this.refs[shapeName].draw();
                  }
                });
              }
            }}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default Graphics;
