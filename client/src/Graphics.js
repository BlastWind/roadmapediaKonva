//todo: allow for picture inside of rect/ellipse/star
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
  Ellipse,
  Circle,
  Star,
  Text,
  Arrow
} from "react-konva";
import Connector from "./Connector.jsx";
import Toolbar from "./Toolbar.js";
import RightToolBar from "./RightToolBar.js";
import {
  Container,
  Divider,
  Dropdown,
  Grid,
  Header,
  Icon,
  List,
  Menu,
  Segment,
  Visibility,
  Modal,
  Form,
  Checkbox,
  Button,
  Input,
  From,
  TextArea
} from "semantic-ui-react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from "react-router-dom";
import "./Graphics.css";
import R from "./R.png";
import cloudPic from "./upload.svg";
import DragAndDrop from "./supportComponents/DragAndDrop.jsx";
import axios from "axios";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";

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
    if (selectedShapeName === "") {
      this.transformer.detach();
      return;
    }
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
    } else if (this.props.selectedShapeName.includes("star")) {
      var stuff = (
        <Transformer
          ref={node => {
            this.transformer = node;
          }}
          name="transformer"
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right"
          ]}
        />
      );
    } else if (this.props.selectedShapeName.includes("arrow")) {
      var stuff = (
        <Transformer
          ref={node => {
            this.transformer = node;
          }}
          name="transformer"
          resizeEnabled={false}
          rotateEnabled={false}
        />
      );
    } else {
      var stuff = (
        <Transformer
          ref={node => {
            this.transformer = node;
          }}
          name="transformer"
          keepRatio={true}
        />
      );
    }
    return stuff;
  }
}

var history = [];
var historyStep = 0;

class Graphics extends Component {
  constructor(props) {
    super(props);

    this.state = {
      layerX: 0,
      layerY: 0,
      layerScale: 1,
      selectedShapeName: "",
      errMsg: "",
      rectangles: [],
      ellipses: [],
      stars: [],
      texts: [],
      arrows: [],
      connectors: [],
      currentTextRef: "",
      shouldTextUpdate: true,
      textX: 0,
      textY: 0,
      textEditVisible: false,
      arrowDraggable: false,
      newArrowRef: "",
      count: 0,
      newArrowDropped: false,
      newConnectorDropped: false,
      arrowEndX: 0,
      arrowEndY: 0,
      isTransforming: false,
      lastFill: null,
      displayThumbnail: cloudPic,
      saving: null,
      saved: [],
      roadmapId: null
    };

    this.handleWheel = this.handleWheel.bind(this);
    this.handleRoadmapPublish = this.handleRoadmapPublish.bind(this);
  }

  handleSave = () => {
    const rects = this.state.rectangles,
      ellipses = this.state.ellipses,
      stars = this.state.stars,
      texts = this.state.texts,
      arrows = this.state.arrows;
    if (
      JSON.stringify(this.state.saved) !==
      JSON.stringify([rects, ellipses, stars, texts, arrows])
    ) {
      this.setState({ saved: [rects, ellipses, stars, texts, arrows] });

      if (this.state.roadmapId) {
        //if draft already exists
        this.setState({ saving: true });
        fetch("/api/roadmap/modifyDraftDB", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roadmapId: this.state.roadmapId,

            data: {
              rects: rects,
              ellipses: ellipses,
              stars: stars,
              texts: texts,
              arrows: arrows
            }
          })
        }).then(res => {
          console.log(res);
          this.setState({ saving: false });
        });
      } else {
        //if first time pressing sav
        this.setState({ saving: true });
        fetch("/api/roadmap/saveRoadmapToDB", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: this.props.auth.user.id,
            roadmapType: "draft",
            data: {
              rects: rects,
              ellipses: ellipses,
              stars: stars,
              texts: texts,
              arrows: arrows
            }
          })
        }).then(res =>
          res.json().then(data => {
            this.setState({ saving: false });
            console.log(data);
            this.setState({ roadmapId: data.roadmap._id });
          })
        );
      }
    }
  };

  handleStageClick = e => {
    var pos = this.refs.layer2.getStage().getPointerPosition();
    var shape = this.refs.layer2.getIntersection(pos);
    console.log("seelctedShape is: ", shape);
    if (shape != undefined && shape.name() != undefined) {
      this.setState(
        {
          selectedShapeName: shape.name()
        },
        () => {
          this.refs.graphicStage.draw();
        }
      );
    }

    //arrow logic
    if (this.state.newArrowRef != "") {
      if (this.state.previousShape) {
        if (this.state.previousShape.attrs.id != "ContainerRect") {
          this.state.previousShape.setAttr("fill", this.state.lastFill);

          //console.log(this.refs.graphicStage.findOne("." + this.state.newArrowRef));
          //

          var newConnector = this.refs.graphicStage.findOne(
            "." + this.state.newArrowRef
          );
          this.state.arrows.map(eachArrow => {
            if (eachArrow.name === this.state.newArrowRef) {
              eachArrow.to = this.state.previousShape;
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
      this.setState({ arrowDraggable: false, newArrowRef: "" });
    }
  };
  handleMouseOver = event => {
    //get the currennt arrow ref and modify its position by filtering & pushing again
    //console.log("lastFill: ", this.state.lastFill);

    //if we are moving an arrow
    if (this.state.newArrowRef !== "") {
      //filling color logic:
      var pos = this.refs.layer2.getStage().getPointerPosition();
      var transform = this.refs.layer2.getAbsoluteTransform().copy();
      transform.invert();
      var shape = this.refs.layer2.getIntersection(pos);
      pos = transform.point(pos);
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

                if (this.state.lastFill)
                  this.state.previousShape.setAttr("fill", this.state.lastFill);
              }
            }
            //if arrow is moving in a single shape
            else if (this.state.previousShape.attrs.id != "ContainerRect") {
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
      if (eachArrow.name == this.state.newArrowRef) {
        var index = arrows.indexOf(eachArrow);
        let currentArrow = eachArrow;
        currentArrow.points = [
          currentArrow.points[0],
          currentArrow.points[1],
          pos.x,
          pos.y
          /*  event.evt.pageY -
            document.getElementById("NavBar").getBoundingClientRect().height */
        ];

        this.state.arrows[index] = currentArrow;
      }
    });
  };
  handleWheel(event) {
    event.evt.preventDefault();
    const scaleBy = 1.2;
    const stage = this.refs.graphicStage;
    const layer = this.refs.layer2;
    const oldScale = layer.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - this.state.layerX / oldScale,
      y: stage.getPointerPosition().y / oldScale - this.state.layerY / oldScale
    };

    const newScale =
      event.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    layer.scale({ x: newScale, y: newScale });

    /*  console.log(
      oldScale,
      mousePointTo,
      stage.getPointerPosition().x,
      stage.getPointerPosition().y
    );
*/
    this.setState({
      layerScale: newScale,
      layerX:
        -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      layerY:
        -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
    });
  }
  componentDidUpdate(prevProps, prevState) {
    let prevMainShapes = [
      prevState.rectangles,
      prevState.ellipses,
      prevState.stars,
      prevState.arrows,
      prevState.connectors,
      prevState.texts
    ];
    let currentMainShapes = [
      this.state.rectangles,
      this.state.ellipses,
      this.state.stars,
      this.state.arrows,
      this.state.connectors,
      this.state.texts
    ];

    if (!this.state.redoing && !this.state.isTransforming)
      if (JSON.stringify(this.state) != JSON.stringify(prevState)) {
        if (
          JSON.stringify(prevMainShapes) != JSON.stringify(currentMainShapes)
        ) {
          //if text shouldn't update, don't append to  history
          if (this.state.shouldTextUpdate) {
            var uh = history;
            history = uh.slice(0, historyStep + 1);
            //console.log("sliced", history);
            var toAppend = this.state;
            history = history.concat(toAppend);
            //console.log("new", history);
            historyStep += 1;
            //console.log(history, historyStep, history[historyStep]);
            console.log("logged in history");
          }
        }
      } else {
        //console.log("compoenntDidUpdate but attrs didn't change");
      }
    this.state.redoing = false;
  }

  handleUndo = () => {
    if (!this.state.isTransforming) {
      if (!this.state.textEditVisible) {
        if (historyStep === 0) {
          return;
        }
        historyStep -= 1;
        let previous = history[historyStep];
        console.log("undo history to step: " + historyStep);
        console.log("currently we are: ", history[historyStep + 1].rectangles);
        console.log("we are going back to: ", history[historyStep].rectangles);
        console.log(this.state.selectedShapeName);
        this.setState(
          {
            rectangles: history[historyStep].rectangles,
            arrows: history[historyStep].arrows,
            ellipses: history[historyStep].ellipses,
            stars: history[historyStep].stars,
            texts: history[historyStep].texts,
            connectors: history[historyStep].connectors,
            redoing: true,
            selectedShapeName: this.shapeIsGone(history[historyStep])
              ? ""
              : this.state.selectedShapeName
          },
          () => {
            this.forceUpdate();
          }
        );
      }
    }
  };

  handleRedo = () => {
    if (historyStep === history.length - 1) {
      return;
    }
    historyStep += 1;
    const next = history[historyStep];
    this.setState(
      {
        rectangles: next.rectangles,
        arrows: next.arrows,
        ellipses: next.ellipses,
        stars: next.stars,
        texts: next.texts,
        redoing: true,
        selectedShapeName: this.shapeIsGone(history[historyStep])
          ? ""
          : this.state.selectedShapeName
      },
      () => {
        this.forceUpdate();
      }
    );
  };

  shapeIsGone = returnTo => {
    var toReturn = true;
    let currentShapeName = this.state.selectedShapeName;
    console.log(returnTo);
    let [rectangles, ellipses, stars, arrows, connectors, texts] = [
      returnTo.rectangles,
      returnTo.ellipses,
      returnTo.stars,
      returnTo.arrows,
      returnTo.connectors,
      returnTo.texts
    ];
    rectangles.map(eachRect => {
      if (eachRect.name === currentShapeName) {
        console.log("rectanlges still same");
        toReturn = false;
      }
    });
    ellipses.map(eachEllipse => {
      if (eachEllipse.name === currentShapeName) {
        console.log("rectanlges still same");
        toReturn = false;
      }
    });
    stars.map(eachStar => {
      if (eachStar.name === currentShapeName) {
        console.log("rectanlges still same");
        toReturn = false;
      }
    });
    arrows.map(eachArrow => {
      if (eachArrow.name === currentShapeName) {
        console.log("rectanlges still same");
        toReturn = false;
      }
    });

    texts.map(eachText => {
      if (eachText.name === currentShapeName) {
        console.log("rectanlges still same");
        toReturn = false;
      }
    });

    return toReturn;
  };

  async componentDidMount() {
    var stage = this.refs.graphicStage;
    history.push(this.state);
    this.refs.layer2.fire("click");
    console.log(this.props.auth);

    var path = this.props.history.location.pathname;
    if (path.includes("draft")) {
      path = path.slice(14);
      await fetch("/api/roadmap/getRoadmapById", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roadmapId: path,
          userId: this.props.auth.user.id
        })
      }).then(res => {
        res.json().then(roadmap => {
          console.log("returned info: ", roadmap);
          if (roadmap && roadmap.message) {
            alert(roadmap.message);
            this.props.history.push("/");
          } else {
            let data = roadmap;
            console.log(data.data);
            let roadmapData = JSON.parse(data.data);
            console.log(roadmapData.arrows);

            roadmapData.arrows.forEach(eachArrow => {
              console.log("this arrow: ", eachArrow);
              if (eachArrow.from) eachArrow.from = JSON.parse(eachArrow.from);
              if (eachArrow.to) eachArrow.to = JSON.parse(eachArrow.to);
            });
            console.log("data", roadmapData);
            this.setState(
              {
                rectangles: roadmapData.rects,
                ellipses: roadmapData.ellipses,
                stars: roadmapData.stars,
                arrows: roadmapData.arrows,
                texts: roadmapData.texts,
                roadmapId: roadmap._id
              },
              () => {
                console.log(this.state);
              }
            );
          }
        });
      });
    }
  }

  handleRoadmapPublish() {
    const title = this.state.title,
      category = this.state.category,
      description = this.state.description,
      thumbnail = this.state.thumbnail,
      author_id = this.props.auth.user.id;
    let data = {
      rects: this.state.rectangles,
      ellipses: this.state.ellipses,
      stars: this.state.stars,
      arrows: this.state.arrows,
      texts: this.state.texts
    };
    data = JSON.stringify(data);

    let formData = new FormData();
    formData.append("file", thumbnail);
    formData.append("title", title);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("data", data);
    formData.append("author_id", author_id);
    formData.append("is_draft", false);
    const config = { headers: { "content-type": "multipart/form-data" } };

    fetch("/api/roadmap/saveRoadmapToDB", {
      method: "POST",
      body: formData
    })
      .then(res => {
        console.log(res);
      })
      .catch(err => console.log(err));

    /*    axios
      .post("/api/roadmap/saveRoadmapToDB", formData, config)
      .then(res => alert("uploaded")); */
  }
  render() {
    let saveText;
    let saveButton;
    let saving = this.state.saving;
    if (saving !== null) {
      if (saving) {
        saveText = <div style={{ color: "white" }}>Saving</div>;
      } else {
        saveText = <div style={{ color: "white" }}>Saved</div>;
      }
    }
    if (!saving || saving === null) {
      saveButton = (
        <Button
          style={{ backgroundColor: "#5a10b9", color: "white" }}
          onClick={this.handleSave}
        >
          Save
        </Button>
      );
    } else {
      saveButton = (
        <Button style={{ backgroundColor: "grey", color: "white" }}>
          Saving
        </Button>
      );
    }
    const white = {
      color: "grey",
      fontFamily: "Saira, sans-serif",
      paddingBottom: ".75rem"
    };

    const errMsg = this.state.errMsg;
    let errDisplay;
    if (errMsg !== "") {
      errDisplay = (
        <div className="errMsginner">
          <span style={{ color: "white" }}>
            {errMsg !== "" ? errMsg : null}
          </span>
        </div>
      );
    } else {
    }

    return (
      <React.Fragment>
        <div className="errMsg">{errDisplay}</div>
        <div>
          <Menu borderless className="navbar" id="mavbar" ref="mavbar">
            <Menu.Item as="a">
              <Link to="/" style={{ color: "white" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="18"
                  viewBox="0 0 20 18"
                >
                  <path
                    fill="currentColor"
                    d="M15.45 17.97L9.5 12.01a.25.25 0 0 1 0-.36l5.87-5.87a.75.75 0 0 0-1.06-1.06l-5.87 5.87c-.69.68-.69 1.8 0 2.48l5.96 5.96a.75.75 0 0 0 1.06-1.06z"
                  />
                </svg>
                Home
              </Link>
            </Menu.Item>

            <Menu.Menu position="right">
              <Menu.Item style={{ padding: "0px !important" }} className="save">
                {saveText}
              </Menu.Item>
              <Menu.Item style={{ padding: "0px !important" }} className="save">
                {saveButton}
              </Menu.Item>

              <Modal
                style={{ padding: "3rem" }}
                trigger={
                  <Menu.Item className="publish">
                    <Button
                      style={{
                        backgroundColor: "white",
                        color: "black"
                      }}
                    >
                      Publish
                    </Button>
                  </Menu.Item>
                }
              >
                <Form>
                  <Form.Group widths="equal">
                    <Form.Field>
                      <label>Title</label>
                      <Input
                        id="form-input-control-first-name"
                        maxLength="100"
                        onChange={event => {
                          this.setState({ title: event.target.value });
                        }}
                      />
                    </Form.Field>
                    <Form.Field>
                      <label>Category</label>
                      <Input
                        id="form-input-control-last-name"
                        maxLength="20"
                        onChange={event => {
                          this.setState({ category: event.target.value });
                        }}
                      />
                    </Form.Field>
                  </Form.Group>
                  <Form.Group widths="equal">
                    <Form.Field
                      style={{ minHeight: 50, maxHeight: 50 }}
                      id="form-textarea-control-about-you"
                      control={TextArea}
                      label="Description:"
                      maxLength="200"
                      fluid
                      onChange={event => {
                        this.setState({ description: event.target.value });
                      }}
                    />
                  </Form.Group>
                  <Form.Field>
                    <label>Thumbnail</label>
                  </Form.Field>
                </Form>
                <div
                  style={{
                    marginLeft: "auto",
                    marginRight: "auto",
                    display: "block",
                    textAlign: "center"
                  }}
                >
                  <DragAndDrop
                    handleDrop={file => {
                      if (file.type.includes("image")) {
                        console.log("will create image");
                        var img = new Image();
                        var that = this;
                        img.src = URL.createObjectURL(file);
                        img.onload = function() {
                          if (this.width / this.height !== 16 / 9) {
                            alert("Please upload a 16:9 image");
                          } else {
                            that.setState({
                              thumbnail: file,
                              displayThumbnail: URL.createObjectURL(file)
                            });
                          }
                        };
                      }
                    }}
                  >
                    <img
                      src={this.state.displayThumbnail}
                      style={{
                        width: "160px",
                        height: "auto",
                        marginLeft: "auto",
                        marginRight: "auto",
                        display: "block"
                      }}
                    />

                    <input
                      ref="fileInputRef"
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={event => {
                        var that = this;
                        var okay = false;
                        var img = new Image();
                        let yuh = event.target.files[0];
                        let uh = URL.createObjectURL(event.target.files[0]);

                        img.src = uh;
                        img.onload = function() {
                          if (this.width / this.height !== 16 / 9) {
                            alert("please upload a 16:9 image!");
                          } else {
                            that.setState({
                              thumbnail: yuh,
                              displayThumbnail: uh
                            });
                          }
                        };
                      }}
                    />
                    <span
                      style={{
                        textAlign: "center",
                        marginLeft: "auto",
                        marginRight: "auto",
                        display: "block",
                        lineHeight: "1.3rem"
                      }}
                    >
                      Drop image here or use the{" "}
                      <a
                        onClick={() => {
                          this.refs.fileInputRef.click();
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        file browser
                      </a>
                    </span>
                  </DragAndDrop>
                </div>

                <div id="thumbnailLineBreak" />

                <Button
                  fluid
                  id="publishButton"
                  onClick={this.handleRoadmapPublish}
                >
                  Publish
                </Button>
              </Modal>
            </Menu.Menu>
          </Menu>
        </div>
        <div
          onKeyDown={event => {
            if (event.ctrlKey && event.keyCode == 88) {
              console.log("delete elements if there is!");

              if (this.state.selectedShapeName != "") {
                //delete it from the state too
                let name = this.state.selectedShapeName;

                var rects = this.state.rectangles.filter(function(eachRect) {
                  return eachRect.name != name;
                });

                var ellipses = this.state.ellipses.filter(function(eachRect) {
                  return eachRect.name != name;
                });

                var stars = this.state.stars.filter(function(eachRect) {
                  return eachRect.name != name;
                });

                var arrows = this.state.arrows.filter(function(eachRect) {
                  return eachRect.name != name;
                });

                var texts = this.state.texts.filter(function(eachRect) {
                  return eachRect.name != name;
                });

                console.log("arrows before: ", this.state.arrows);
                this.setState(
                  {
                    rectangles: rects,
                    ellipses: ellipses,
                    stars: stars,
                    arrows: arrows,
                    texts: texts
                  },
                  () => {
                    console.log("arrows now: ", this.state.arrows);
                  }
                );
                this.refs.graphicStage
                  .findOne("." + this.state.selectedShapeName)
                  .destroy();
                this.setState({ selectedShapeName: "" });
              }
            }
            if (event.ctrlKey && event.keyCode == 90) {
              this.handleUndo();
            } else if (event.ctrlKey && event.keyCode == 89) {
              this.handleRedo();
            } else if (event.ctrlKey && event.keyCode == 67) {
              if (this.state.selectedShapeName != "") {
                //find it
                let name = this.state.selectedShapeName;
                let copiedElement = null;
                if (name.includes("rect")) {
                  copiedElement = this.state.rectangles.filter(function(
                    eachRect
                  ) {
                    return eachRect.name === name;
                  });
                } else if (name.includes("ellipse")) {
                  copiedElement = this.state.ellipses.filter(function(
                    eachRect
                  ) {
                    return eachRect.name === name;
                  });
                } else if (name.includes("star")) {
                  copiedElement = this.state.stars.filter(function(eachRect) {
                    return eachRect.name === name;
                  });
                } else if (name.includes("text")) {
                  copiedElement = this.state.texts.filter(function(eachRect) {
                    return eachRect.name === name;
                  });
                } else if (name.includes("arrow")) {
                  copiedElement = this.state.arrows.filter(function(eachRect) {
                    return eachRect.name === name;
                  });
                }

                this.setState({ copiedElement: copiedElement }, () =>
                  console.log(this.state.copiedElement)
                );
              }
            } else if (event.ctrlKey && event.keyCode == 86) {
              let copiedElement = this.state.copiedElement[0];
              console.log(copiedElement);
              var length;
              if (copiedElement) {
                if (copiedElement.attrs) {
                } else {
                  if (copiedElement.name.includes("rectangle")) {
                    length = this.state.rectangles.length + 1;
                    var toPush = {
                      x: copiedElement.x + 10,
                      y: copiedElement.y + 10,
                      width: copiedElement.width,
                      height: copiedElement.height,
                      stroke: copiedElement.stroke,
                      strokeWidth: copiedElement.strokeWidth,
                      name: "rectangle" + (this.state.rectangles.length + 1),
                      ref: "rectangle" + (this.state.rectangles.length + 1),
                      fill: copiedElement.fill,
                      useImage: copiedElement.useImage
                    };
                    let newName = this.state.selectedShapeName;
                    console.log(newName, this.state.rectangles.length + 1);
                    this.setState(
                      prevState => ({
                        rectangles: [...prevState.rectangles, toPush]
                      }),
                      () => {
                        console.log(this.state.rectangles);
                        this.setState({
                          selectedShapeName:
                            "rectangle" + this.state.rectangles.length
                        });
                      }
                    );
                  }
                  if (copiedElement.name.includes("arrow")) {
                    length = this.state.arrows.length + 1;

                    if (copiedElement.to || copiedElement.from) {
                      alert("Connectors cannot be pasted!");
                    } else {
                      var toPush = {
                        points: [
                          copiedElement.points[0] + 30,
                          copiedElement.points[1] + 30,
                          copiedElement.points[2] + 30,
                          copiedElement.points[3] + 30
                        ],

                        stroke: copiedElement.stroke,
                        strokeWidth: copiedElement.strokeWidth,
                        name: "arrow" + (this.state.arrows.length + 1),
                        ref: "arrow" + (this.state.arrows.length + 1)
                      };
                      console.log(toPush, copiedElement);
                      let newName = this.state.selectedShapeName;
                      console.log(newName, this.state.rectangles.length + 1);
                      this.setState(
                        prevState => ({
                          arrows: [...prevState.arrows, toPush]
                        }),
                        () => {
                          console.log(this.state.arrows);

                          this.setState({
                            selectedShapeName:
                              "arrow" + this.state.arrows.length
                          });
                        }
                      );
                    }
                  }

                  if (copiedElement.name.includes("ellipse")) {
                    length = this.state.ellipses.length + 1;
                    var toPush = {
                      x: copiedElement.x + 10,
                      y: copiedElement.y + 10,
                      radius: copiedElement.radius,
                      stroke: copiedElement.stroke,
                      strokeWidth: copiedElement.strokeWidth,
                      name: "ellipse" + (this.state.ellipses.length + 1),
                      ref: "ellipse" + (this.state.ellipses.length + 1),
                      fill: copiedElement.fill,
                      useImage: copiedElement.useImage
                    };
                    let newName = this.state.selectedShapeName;

                    this.setState(
                      prevState => ({
                        ellipses: [...prevState.ellipses, toPush]
                      }),
                      () => {
                        console.log(this.state.rectangles);
                        this.setState({
                          selectedShapeName:
                            "ellipse" + this.state.ellipses.length
                        });
                      }
                    );
                  }

                  if (copiedElement.name.includes("star")) {
                    length = this.state.stars.length + 1;
                    var toPush = {
                      x: copiedElement.x + 10,
                      y: copiedElement.y + 10,
                      innerRadius: copiedElement.innerRadius,
                      outerRadius: copiedElement.outerRadius,
                      stroke: copiedElement.stroke,
                      strokeWidth: copiedElement.strokeWidth,
                      name: "star" + (this.state.stars.length + 1),
                      ref: "star" + (this.state.stars.length + 1),
                      fill: copiedElement.fill,
                      useImage: copiedElement.useImage
                    };
                    let newName = this.state.selectedShapeName;

                    this.setState(
                      prevState => ({
                        stars: [...prevState.stars, toPush]
                      }),
                      () => {
                        this.setState({
                          selectedShapeName: "star" + this.state.stars.length
                        });
                      }
                    );
                  }
                }
              }
            }
          }}
          tabIndex="0"
          style={{ outline: "none" }}
        >
          <Stage
            onClick={this.handleStageClick}
            onMouseMove={this.handleMouseOver}
            onWheel={event => this.handleWheel(event)}
            height={window.innerHeight}
            width={window.innerWidth}
            ref="graphicStage"
          >
            <Layer
              scaleX={this.state.layerScale}
              scaleY={this.state.layerScale}
              x={this.state.layerX}
              y={this.state.layerY}
              height={window.innerHeight}
              width={window.innerWidth}
              draggable
              onDragEnd={() => {
                this.setState({
                  layerX: this.refs.layer2.x(),
                  layerY: this.refs.layer2.y()
                });
              }}
              ref="layer2"
            >
              <Rect
                height={window.innerHeight}
                width={window.innerWidth}
                name=""
                id="ContainerRect"
              />

              {this.state.rectangles.map(eachRect => {
                return (
                  <Rect
                    onClick={() => {
                      console.log(this.refs[eachRect.ref]);
                    }}
                    onTransformStart={() => {
                      this.setState({ isTransforming: true });
                      let rect = this.refs[eachRect.ref];
                      rect.setAttr("lastRotation", rect.rotation());
                    }}
                    onTransform={() => {
                      let rect = this.refs[eachRect.ref];

                      if (rect.attrs.lastRotation !== rect.rotation()) {
                        this.state.arrows.map(eachArrow => {
                          if (
                            eachArrow.to &&
                            eachArrow.to.name() === rect.name()
                          ) {
                            this.setState({
                              errMsg:
                                "Rotating rects with connectors might skew things up! Use a normal arrow instead?"
                            });
                          }
                          if (
                            eachArrow.from &&
                            eachArrow.from.name() === rect.name()
                          ) {
                            this.setState({
                              errMsg:
                                "Rotating rects with connectors might skew things up! Use a normal arrow instead?"
                            });
                          }
                        });
                      }

                      rect.setAttr("lastRotation", rect.rotation());
                    }}
                    onTransformEnd={() => {
                      this.setState({ isTransforming: false });
                      let rect = this.refs[eachRect.ref];
                      this.setState(
                        prevState => ({
                          errMsg: "",
                          rectangles: prevState.rectangles.map(eachRect =>
                            eachRect.name === rect.attrs.name
                              ? {
                                  ...eachRect,
                                  width: rect.width() * rect.scaleX(),
                                  height: rect.height() * rect.scaleY(),
                                  rotation: rect.rotation(),
                                  x: rect.x(),
                                  y: rect.y()
                                }
                              : eachRect
                          )
                        }),
                        () => {
                          this.forceUpdate();
                        }
                      );

                      rect.setAttr("scaleX", 1);
                      rect.setAttr("scaleY", 1);
                    }}
                    rotation={eachRect.rotation}
                    ref={eachRect.ref}
                    fill={eachRect.fill}
                    name={eachRect.name}
                    x={eachRect.x}
                    y={eachRect.y}
                    width={eachRect.width}
                    height={eachRect.height}
                    stroke={eachRect.stroke}
                    strokeWidth={eachRect.strokeWidth}
                    strokeScaleEnabled={false}
                    draggable
                    onDragMove={() => {
                      this.state.arrows.map(eachArrow => {
                        if (eachArrow.from != undefined) {
                          if (eachRect.name == eachArrow.from.attrs.name) {
                            eachArrow.points = [
                              eachRect.x,
                              eachRect.y,
                              eachArrow.points[2],
                              eachArrow.points[3]
                            ];
                            this.forceUpdate();
                          }
                        }

                        if (eachArrow.to != undefined) {
                          if (eachRect.name == eachArrow.to.attrs.name) {
                            eachArrow.points = [
                              eachArrow.points[0],
                              eachArrow.points[1],
                              eachRect.x,
                              eachRect.y
                            ];
                            this.forceUpdate();
                          }
                        }
                      });
                    }}
                    onDragEnd={event => {
                      //cannot compare by name because currentSelected might not be the same
                      //have to use ref, which appears to be overcomplicated
                      var shape = this.refs[eachRect.ref];
                      /*    this.state.rectangles.map(eachRect => {
                          if (eachRect.name === shape.attrs.name) {
                            shape.position({
                              x: event.target.x(),
                              y: event.target.y()
                            });
                          }
                        });*/

                      this.setState(prevState => ({
                        rectangles: prevState.rectangles.map(eachRect =>
                          eachRect.name === shape.attrs.name
                            ? {
                                ...eachRect,
                                x: event.target.x(),
                                y: event.target.y()
                              }
                            : eachRect
                        )
                      }));
                    }}
                  />
                );
              })}
              {this.state.ellipses.map(eachEllipse => (
                <Ellipse
                  ref={eachEllipse.ref}
                  name={eachEllipse.name}
                  x={eachEllipse.x}
                  y={eachEllipse.y}
                  rotation={eachEllipse.rotation}
                  radiusX={eachEllipse.radiusX}
                  radiusY={eachEllipse.radiusY}
                  fill={eachEllipse.fill}
                  stroke={eachEllipse.stroke}
                  strokeWidth={eachEllipse.strokeWidth}
                  strokeScaleEnabled={false}
                  onTransformStart={() => {
                    this.setState({ isTransforming: true });
                    let ellipse = this.refs[eachEllipse.ref];
                    ellipse.setAttr("lastRotation", ellipse.rotation());
                  }}
                  onTransform={() => {
                    let ellipse = this.refs[eachEllipse.ref];

                    if (ellipse.attrs.lastRotation !== ellipse.rotation()) {
                      this.state.arrows.map(eachArrow => {
                        if (
                          eachArrow.to &&
                          eachArrow.to.name() === ellipse.name()
                        ) {
                          this.setState({
                            errMsg:
                              "Rotating ellipses with connectors might skew things up! Use a normal arrow instead?"
                          });
                        }
                        if (
                          eachArrow.from &&
                          eachArrow.from.name() === ellipse.name()
                        ) {
                          this.setState({
                            errMsg:
                              "Rotating ellipses with connectors might skew things up! Use a normal arrow instead?"
                          });
                        }
                      });
                    }

                    ellipse.setAttr("lastRotation", ellipse.rotation());
                  }}
                  onTransformEnd={() => {
                    this.setState({ isTransforming: false });
                    let ellipse = this.refs[eachEllipse.ref];
                    let scaleX = ellipse.scaleX(),
                      scaleY = ellipse.scaleY();

                    this.setState(prevState => ({
                      errMsg: "",
                      ellipses: prevState.ellipses.map(eachEllipse =>
                        eachEllipse.name === ellipse.attrs.name
                          ? {
                              ...eachEllipse,

                              radiusX: ellipse.radiusX() * ellipse.scaleX(),
                              radiusY: ellipse.radiusY() * ellipse.scaleY(),
                              rotation: ellipse.rotation(),
                              x: ellipse.x(),
                              y: ellipse.y()
                            }
                          : eachEllipse
                      )
                    }));
                    console.log(this.state.errMsg);
                    ellipse.setAttr("scaleX", 1);
                    ellipse.setAttr("scaleY", 1);
                    this.forceUpdate();
                  }}
                  draggable
                  onDragMove={() => {
                    this.state.arrows.map(eachArrow => {
                      if (eachArrow.from != undefined) {
                        if (eachEllipse.name == eachArrow.from.attrs.name) {
                          eachArrow.points = [
                            eachEllipse.x,
                            eachEllipse.y,
                            eachArrow.points[2],
                            eachArrow.points[3]
                          ];
                          this.forceUpdate();
                        }
                      }

                      if (eachArrow.to != undefined) {
                        if (eachEllipse.name == eachArrow.to.attrs.name) {
                          eachArrow.points = [
                            eachArrow.points[0],
                            eachArrow.points[1],
                            eachEllipse.x,
                            eachEllipse.y
                          ];
                          this.forceUpdate();
                        }
                      }
                    });
                  }}
                  onDragEnd={event => {
                    //cannot compare by name because currentSelected might not be the same
                    //have to use ref, which appears to be overcomplicated
                    var shape = this.refs[eachEllipse.ref];

                    this.setState(prevState => ({
                      ellipses: prevState.ellipses.map(eachEllipse =>
                        eachEllipse.name === shape.attrs.name
                          ? {
                              ...eachEllipse,
                              x: event.target.x(),
                              y: event.target.y()
                            }
                          : eachEllipse
                      )
                    }));
                  }}
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
                  strokeScaleEnabled={false}
                  rotation={eachStar.rotation}
                  onTransformStart={() => {
                    this.setState({ isTransforming: true });
                  }}
                  onTransformEnd={() => {
                    this.setState({ isTransforming: false });
                    let star = this.refs[eachStar.ref];
                    let scaleX = star.scaleX(),
                      scaleY = star.scaleY();

                    this.setState(prevState => ({
                      stars: prevState.stars.map(eachStar =>
                        eachStar.name === star.attrs.name
                          ? {
                              ...eachStar,
                              innerRadius: star.innerRadius() * star.scaleX(),
                              outerRadius: star.outerRadius() * star.scaleX(),
                              rotation: star.rotation(),
                              x: star.x(),
                              y: star.y()
                            }
                          : eachStar
                      )
                    }));
                    star.setAttr("scaleX", 1);
                    star.setAttr("scaleY", 1);
                    this.forceUpdate();
                  }}
                  draggable
                  onDragMove={() => {
                    this.state.arrows.map(eachArrow => {
                      if (eachArrow.from != undefined) {
                        if (eachStar.name == eachArrow.from.attrs.name) {
                          eachArrow.points = [
                            eachStar.x,
                            eachStar.y,
                            eachArrow.points[2],
                            eachArrow.points[3]
                          ];
                          this.forceUpdate();
                        }
                      }

                      if (eachArrow.to != undefined) {
                        if (eachStar.name == eachArrow.to.attrs.name) {
                          eachArrow.points = [
                            eachArrow.points[0],
                            eachArrow.points[1],
                            eachStar.x,
                            eachStar.y
                          ];
                          this.forceUpdate();
                        }
                      }
                    });
                  }}
                  onDragEnd={event => {
                    //cannot compare by name because currentSelected might not be the same
                    //have to use ref, which appears to be overcomplicated
                    var shape = this.refs[eachStar.ref];

                    this.setState(prevState => ({
                      stars: prevState.stars.map(eachStar =>
                        eachStar.name === shape.attrs.name
                          ? {
                              ...eachStar,
                              x: event.target.x(),
                              y: event.target.y()
                            }
                          : eachStar
                      )
                    }));
                  }}
                />
              ))}
              {this.state.texts.map(eachText => (
                //perhaps this.state.texts only need to contain refs?
                //so that we only need to store the refs to get more information
                <Text
                  onTransformStart={() => {
                    var currentText = this.refs[this.state.selectedShapeName];
                    currentText.setAttr("lastRotation", currentText.rotation());
                  }}
                  onTransform={() => {
                    var currentText = this.refs[this.state.selectedShapeName];

                    currentText.setAttr(
                      "width",
                      currentText.width() * currentText.scaleX()
                    );
                    currentText.setAttr("scaleX", 1);

                    currentText.draw();

                    if (
                      currentText.attrs.lastRotation !== currentText.rotation()
                    ) {
                      this.state.arrows.map(eachArrow => {
                        if (
                          eachArrow.to &&
                          eachArrow.to.name() === currentText.name()
                        ) {
                          this.setState({
                            errMsg:
                              "Rotating texts with connectors might skew things up! Use a normal arrow instead?"
                          });
                        }
                        if (
                          eachArrow.from &&
                          eachArrow.from.name() === currentText.name()
                        ) {
                          this.setState({
                            errMsg:
                              "Rotating texts with connectors might skew things up! Use a normal arrow instead?"
                          });
                        }
                      });
                    }

                    currentText.setAttr("lastRotation", currentText.rotation());
                  }}
                  onTransformEnd={() => {
                    var currentText = this.refs[this.state.selectedShapeName];

                    this.setState(prevState => ({
                      errMsg: "",
                      texts: prevState.texts.map(eachText =>
                        eachText.name === this.state.selectedShapeName
                          ? {
                              ...eachText,
                              width: currentText.width()
                            }
                          : eachText
                      )
                    }));
                    currentText.setAttr("scaleX", 1);
                    currentText.draw();
                  }}
                  width={eachText.width}
                  fill={eachText.fill}
                  name={eachText.name}
                  ref={eachText.ref}
                  fontFamily={eachText.fontFamily}
                  fontSize={eachText.fontSize}
                  x={eachText.x}
                  y={eachText.y}
                  text={eachText.text}
                  draggable
                  onDragMove={() => {
                    this.state.arrows.map(eachArrow => {
                      if (eachArrow.from != undefined) {
                        if (eachText.name == eachArrow.from.attrs.name) {
                          eachArrow.points = [
                            eachText.x,
                            eachText.y,
                            eachArrow.points[2],
                            eachArrow.points[3]
                          ];
                          this.forceUpdate();
                        }
                      }

                      if (eachArrow.to != undefined) {
                        if (eachText.name == eachArrow.to.attrs.name) {
                          eachArrow.points = [
                            eachArrow.points[0],
                            eachArrow.points[1],
                            eachText.x,
                            eachText.y
                          ];
                          this.forceUpdate();
                        }
                      }
                    });
                  }}
                  onDragEnd={event => {
                    //cannot compare by name because currentSelected might not be the same
                    //have to use ref, which appears to be overcomplicated
                    var shape = this.refs[eachText.ref];

                    this.setState(prevState => ({
                      texts: prevState.texts.map(eachtext =>
                        eachtext.name === shape.attrs.name
                          ? {
                              ...eachtext,
                              x: event.target.x(),
                              y: event.target.y()
                            }
                          : eachtext
                      )
                    }));
                  }}
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
                if (!eachArrow.from && !eachArrow.to) {
                  return (
                    <Arrow
                      ref={eachArrow.ref}
                      name={eachArrow.name}
                      points={[
                        eachArrow.points[0],
                        eachArrow.points[1],
                        eachArrow.points[2],
                        eachArrow.points[3]
                      ]}
                      stroke={eachArrow.stroke}
                      fill={eachArrow.fill}
                      draggable
                      onDragEnd={event => {
                        //set new points to current position

                        //usually: state => star => x & y
                        //now: state => arrow => attr => x & y

                        let oldPoints = [
                          eachArrow.points[0],
                          eachArrow.points[1],
                          eachArrow.points[2],
                          eachArrow.points[3]
                        ];

                        let shiftX = this.refs[eachArrow.ref].attrs.x;
                        let shiftY = this.refs[eachArrow.ref].attrs.y;

                        let newPoints = [
                          oldPoints[0] + shiftX,
                          oldPoints[1] + shiftY,
                          oldPoints[2] + shiftX,
                          oldPoints[3] + shiftY
                        ];

                        this.refs[eachArrow.ref].position({ x: 0, y: 0 });
                        this.refs.layer2.draw();

                        this.setState(prevState => ({
                          arrows: prevState.arrows.map(eachArr =>
                            eachArr.name === eachArrow.name
                              ? {
                                  ...eachArr,
                                  points: newPoints
                                }
                              : eachArr
                          )
                        }));
                      }}
                    />
                  );
                }

                if (
                  eachArrow.name == this.state.newArrowRef &&
                  (eachArrow.from || eachArrow.to)
                ) {
                  return (
                    <Connector
                      name={eachArrow.name}
                      from={eachArrow.from}
                      to={eachArrow.to}
                      arrowEndX={this.state.arrowEndX}
                      arrowEndY={this.state.arrowEndY}
                      current={true}
                      stroke={eachArrow.stroke}
                      fill={eachArrow.fill}
                    />
                  );
                } else if (eachArrow.from || eachArrow.to) {
                  //if not current
                  return (
                    <Connector
                      name={eachArrow.name}
                      from={eachArrow.from}
                      to={eachArrow.to}
                      points={eachArrow.points}
                      current={false}
                      stroke={eachArrow.stroke}
                      fill={eachArrow.fill}
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
            >
              <Toolbar
                layer={this.refs.layer2}
                rectName={this.state.rectangles.length + 1}
                ellipseName={this.state.ellipses.length + 1}
                starName={this.state.stars.length + 1}
                textName={this.state.texts.length + 1}
                newArrowOnDragEnd={toPush => {
                  if (toPush.from != undefined) {
                    //  console.log("we are making a connector");

                    var transform = this.refs.layer2
                      .getAbsoluteTransform()
                      .copy();
                    transform.invert();
                    let uh = transform.point({ x: toPush.x, y: toPush.y });
                    toPush.x = uh.x;
                    toPush.y = uh.y;

                    var newArrow = {
                      points: toPush.points,
                      ref: "arrow" + (this.state.arrows.length + 1),
                      name: "arrow" + (this.state.arrows.length + 1),
                      from: toPush.from,
                      stroke: toPush.stroke,
                      strokeWidth: toPush.strokeWidth,
                      fill: toPush.fill
                    };

                    //  console.log(newArrow);
                    this.setState(prevState => ({
                      arrows: [...prevState.arrows, newArrow],
                      newArrowDropped: true,
                      newArrowRef: newArrow.name,
                      arrowEndX: toPush.x,
                      arrowEndY: toPush.y
                    }));
                  } else {
                    //  console.log("we are making just an aarrow");
                    var transform = this.refs.layer2
                      .getAbsoluteTransform()
                      .copy();
                    transform.invert();
                    let uh = transform.point({ x: toPush.x, y: toPush.y });
                    toPush.x = uh.x;
                    toPush.y = uh.y;
                    var newArrow = {
                      points: [toPush.x, toPush.y, toPush.x, toPush.y],
                      ref: "arrow" + (this.state.arrows.length + 1),
                      name: "arrow" + (this.state.arrows.length + 1),
                      from: toPush.from,
                      stroke: toPush.stroke,
                      strokeWidth: toPush.strokeWidth,
                      fill: toPush.fill
                    };

                    this.setState(prevState => ({
                      arrows: [...prevState.arrows, newArrow],
                      newArrowDropped: true,
                      newArrowRef: newArrow.name,
                      arrowEndX: toPush.x,
                      arrowEndY: toPush.y
                    }));
                  }

                  //this.refs updates after forceUpdate (because arrow gets instantiated), might be risky in the future
                  //only this.state.arrows.length because it was pushed earlier, cancelling the +1
                }}
                appendToRectangles={stuff => {
                  var layer = this.refs.layer2;
                  var toPush = stuff;
                  var stage = this.refs.graphicStage;
                  var transform = this.refs.layer2
                    .getAbsoluteTransform()
                    .copy();
                  transform.invert();

                  var pos = transform.point({ x: toPush.x, y: toPush.y });

                  if (layer.attrs.x != null || layer.attrs.x != undefined) {
                    toPush.x = pos.x;
                    toPush.y = pos.y;
                  }

                  this.setState(prevState => ({
                    rectangles: [...prevState.rectangles, toPush],
                    selectedShapeName: toPush.name
                  }));
                }}
                appendToEllipses={stuff => {
                  var layer = this.refs.layer2;
                  var toPush = stuff;
                  var stage = this.refs.graphicStage;
                  var transform = this.refs.layer2
                    .getAbsoluteTransform()
                    .copy();
                  transform.invert();

                  var pos = transform.point({ x: toPush.x, y: toPush.y });

                  if (layer.attrs.x != null || layer.attrs.x != undefined) {
                    toPush.x = pos.x;
                    toPush.y = pos.y;
                  }

                  this.setState(prevState => ({
                    ellipses: [...prevState.ellipses, toPush],
                    selectedShapeName: toPush.name
                  }));
                }}
                appendToStars={stuff => {
                  var layer = this.refs.layer2;
                  var toPush = stuff;
                  var stage = this.refs.graphicStage;
                  var transform = this.refs.layer2
                    .getAbsoluteTransform()
                    .copy();
                  transform.invert();

                  var pos = transform.point({ x: toPush.x, y: toPush.y });

                  if (layer.attrs.x != null || layer.attrs.x != undefined) {
                    toPush.x = pos.x;
                    toPush.y = pos.y;
                  }
                  this.setState(prevState => ({
                    stars: [...prevState.stars, toPush],
                    selectedShapeName: toPush.name
                  }));
                }}
                appendToTexts={stuff => {
                  var layer = this.refs.layer2;
                  var toPush = stuff;
                  var stage = this.refs.graphicStage;
                  var transform = this.refs.layer2
                    .getAbsoluteTransform()
                    .copy();
                  transform.invert();

                  var pos = transform.point({ x: toPush.x, y: toPush.y });

                  if (layer.attrs.x != null || layer.attrs.x != undefined) {
                    toPush.x = pos.x;
                    toPush.y = pos.y;
                  }
                  this.setState(prevState => ({
                    texts: [...prevState.texts, toPush]
                  }));

                  //we can also just get element by this.refs.toPush.ref

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
              this.setState({ text: e.target.value, shouldTextUpdate: false });
            }}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                this.setState({
                  textEditVisible: false,
                  shouldTextUpdate: true
                });

                // get the current textNode we are editing, get the name from there
                //match name with elements in this.state.texts,
                let node = this.refs[this.state.currentTextRef];

                let name = node.attrs.name;

                this.setState(prevState => ({
                  texts: prevState.texts.map(eachText =>
                    eachText.name === name
                      ? { ...eachText, text: this.state.text }
                      : eachText
                  )
                }));

                node.show();
                this.refs.graphicStage.findOne(".transformer").show();
              }
            }}
            onBlur={() => {
              this.setState({ textEditVisible: false, shouldTextUpdate: true });

              // get the current textNode we are editing, get the name from there
              //match name with elements in this.state.texts,

              console.log(this.state.currentTextRef);

              let node = this.refs.graphicStage.findOne(
                "." + this.state.currentTextRef
              );
              console.log(this.refs.graphicStage, node);
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
            }}
            style={{
              //set position, width, height, fontSize, overflow, lineHeight, color
              display: this.state.textEditVisible ? "block" : "none",
              position: "absolute",
              top: this.state.textY + 80 + "px",
              left: this.state.textX + "px",
              width: "300px",
              height: "300px",
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
                if (stuff.type === "shapeFill") {
                  this.setState(prevState => ({
                    rectangles: prevState.rectangles.map(eachRect =>
                      eachRect.name === shapeName
                        ? {
                            ...eachRect,
                            fill: stuff.color
                          }
                        : eachRect
                    )
                  }));
                } else if (stuff.type === "strokeFill") {
                  this.setState(prevState => ({
                    rectangles: prevState.rectangles.map(eachRect =>
                      eachRect.name === shapeName
                        ? {
                            ...eachRect,
                            stroke: stuff.color
                          }
                        : eachRect
                    )
                  }));
                }
              }
              if (shapeName.includes("ellipse")) {
                if (stuff.type === "shapeFill") {
                  this.setState(prevState => ({
                    ellipses: prevState.ellipses.map(eachEllipse =>
                      eachEllipse.name === shapeName
                        ? {
                            ...eachEllipse,
                            fill: stuff.color
                          }
                        : eachEllipse
                    )
                  }));
                } else if (stuff.type === "strokeFill") {
                  this.setState(prevState => ({
                    ellipses: prevState.ellipses.map(eachEllipse =>
                      eachEllipse.name === shapeName
                        ? {
                            ...eachEllipse,
                            stroke: stuff.color
                          }
                        : eachEllipse
                    )
                  }));
                }
              }
              if (shapeName.includes("star")) {
                if (stuff.type === "shapeFill") {
                  this.setState(prevState => ({
                    stars: prevState.stars.map(eachStar =>
                      eachStar.name === shapeName
                        ? {
                            ...eachStar,
                            fill: stuff.color
                          }
                        : eachStar
                    )
                  }));
                } else if (stuff.type === "strokeFill") {
                  this.setState(prevState => ({
                    stars: prevState.stars.map(eachStar =>
                      eachStar.name === shapeName
                        ? {
                            ...eachStar,
                            stroke: stuff.color
                          }
                        : eachStar
                    )
                  }));
                }
              }
              if (shapeName.includes("text")) {
                this.setState(prevState => ({
                  texts: prevState.texts.map(eachText =>
                    eachText.name === shapeName
                      ? {
                          ...eachText,
                          fill: stuff.color
                        }
                      : eachText
                  )
                }));
              }
              if (shapeName.includes("arrow")) {
                console.log("we should set stuff with", stuff);
                if (stuff.type === "shapeFill") {
                  this.setState(prevState => ({
                    arrows: prevState.arrows.map(eachStar =>
                      eachStar.name === shapeName
                        ? {
                            ...eachStar,
                            fill: stuff.color
                          }
                        : eachStar
                    )
                  }));
                  console.log(this.state.arrows);
                } else if (stuff.type === "strokeFill") {
                  this.setState(prevState => ({
                    arrows: prevState.arrows.map(eachStar =>
                      eachStar.name === shapeName
                        ? {
                            ...eachStar,
                            stroke: stuff.color
                          }
                        : eachStar
                    )
                  }));
                }
              }
            }}
            setTextAttr={passed => {
              let text = passed.target;
              this.setState(prevState => ({
                texts: prevState.texts.map(eachText =>
                  eachText.name === text.name()
                    ? {
                        ...eachText,

                        [passed.attribute]: passed.value
                      }
                    : eachText
                )
              }));
            }}
          />
        </div>
      </React.Fragment>
    );
  }
}
const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(withRouter(Graphics));
