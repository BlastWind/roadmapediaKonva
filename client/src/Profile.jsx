import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Container, Header, Icon, Menu, Card, Image } from "semantic-ui-react";
import NavBar from "./NavBar.js";
import "./Profile.css";
import cloudPic from "./defaultUser.jpg";
import { uploadUserPhoto } from "./actions/authActions.js";
import axios from "axios";

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      descriptionHovered: false,
      showDescriptionInput: false,
      userDescription: "",
      userPic: "",
      savedRoadmaps: [],
      draftRoadmaps: []
    };
    this.input = React.createRef();
    this.fileInput = React.createRef();
  }
  async componentDidMount() {
    //get roadmap without thumbnail, then with thumbnail like home
    console.log("data");

    await fetch("/api/users/getUserById", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: this.props.auth.user.id })
    }).then(res => {
      res.json().then(data => {
        console.log(data);
        let userInfo = data.userInfo;
        let savedRoadmaps = data.savedRoadmapsInfo;
        let draftRoadmaps = data.draftRoadmapsInfo;

        this.setState(
          {
            savedRoadmaps: savedRoadmaps,
            userInfo: userInfo,
            draftRoadmaps: draftRoadmaps
          },
          () => {
            console.log(
              "state when it is here: ",
              this.state.userInfo.savedRoadmap
            );
            fetch("/api/roadmap/getRoadmapThumbnailsByIds", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ ids: userInfo.savedRoadmap })
            }).then(thumbnails =>
              thumbnails.json().then(thumbnails => {
                console.log("thumbnails: ", thumbnails);
                var base64Flag = "data:image/jpeg;base64,";
                thumbnails.forEach((thumbnail, index) => {
                  console.log(thumbnail);
                  var imgStr = this.arrayBufferToBase64(
                    thumbnail.thumbnail.data.data
                  );
                  console.log("imgStr: ", imgStr);
                  this.state.savedRoadmaps[index].convertedThumbnail =
                    base64Flag + imgStr;

                  this.forceUpdate();
                });
              })
            );
          }
        );
      });
    });
  }

  arrayBufferToBase64 = buffer => {
    var binary = "";
    var bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach(b => (binary += String.fromCharCode(b)));
    return window.btoa(binary);
  };

  render() {
    const CardGroupStyle = {
      maxWidth: "80rem",
      marginLeft: "auto",
      marginRight: "auto",
      marginTop: "3rem"
    };
    const ImageStyle = {
      width: "384px",
      height: "auto"
    };
    const ContentStyle = {
      paddingTop: "22px",
      paddingBottom: "18px"
    };
    const CardStyle = {
      maxWidth: "384px",
      cursor: "pointer"
    };

    const CardGroupStyleMid = {
      width: "95%",
      height: "auto",
      marginLeft: "auto",
      marginRight: "auto",
      marginTop: "3rem"
    };
    let profileComponent;
    const url = this.props.location.pathname;
    console.log(this.state);
    if (url === "/profile/starred" || url === "/profile/starred/") {
      profileComponent = (
        <div>
          {this.state.savedRoadmaps.map((eachRoadmap, index) => (
            <Card.Group>
              <Card
                style={CardStyle}
                onClick={() => {
                  console.log(eachRoadmap);
                  this.props.history.push(`/roadmap/${eachRoadmap._id}`);
                }}
              >
                {eachRoadmap.convertedThumbnail ? (
                  <Image
                    src={eachRoadmap.convertedThumbnail}
                    style={ImageStyle}
                  />
                ) : (
                  <Icon
                    loading
                    name="circle notch"
                    size="massive"
                    color="black"
                  />
                )}

                <Card.Content style={ContentStyle}>
                  <Card.Header>{eachRoadmap.title}</Card.Header>
                  <Card.Description>{eachRoadmap.description}</Card.Description>
                </Card.Content>
              </Card>
            </Card.Group>
          ))}
        </div>
      );
    } else if (url === "/profile/edit" || url === "/profile/edit/") {
      profileComponent = <div>edit profile</div>;
    } else if (
      url === "/profile/yourroadmaps" ||
      url === "/profile/yourroadmaps/"
    ) {
      profileComponent = <div>yours</div>;
    } else if (url === "/profile/drafts" || url === "/profile/drafts/") {
      profileComponent = (
        <div>
          {this.state.draftRoadmaps.map((eachRoadmap, index) => (
            <Card
              style={CardStyle}
              onClick={() => {
                console.log(eachRoadmap);
                this.props.history.push(`/create/draft/${eachRoadmap._id}`);
              }}
            >
              <Card.Content style={ContentStyle}>
                <Card.Header>{eachRoadmap.title}</Card.Header>
              </Card.Content>
            </Card>
          ))}
        </div>
      );
    } else {
      profileComponent = <div>should be a 404 page</div>;
    }
    let username;
    if (this.props.auth && this.props.auth.user) {
      username = this.props.auth.user.name;
    } else {
      username = "uh";
    }

    let profilePicSrc;
    if (this.state.userPic !== "") {
      profilePicSrc = this.state.userPic;
    } else if (this.props.auth.isAuthenticated) {
      if (
        this.props.auth &&
        this.props.auth.user &&
        this.props.auth.user.profilePic &&
        this.props.auth.user.profilePic.default
      ) {
        profilePicSrc = cloudPic;
      } else {
        console.log(this.props.auth.user);
        var imgStr = this.arrayBufferToBase64(
          this.props.auth.user.profilePic.buffer.data
        );
        var base64Flag = "data:image/jpeg;base64,";
        profilePicSrc = base64Flag + imgStr;
      }
    }

    let descriptionComponent;
    if (this.state.userDescription === "") {
      if (this.state.descriptionHovered) {
        if (!this.state.showDescriptionInput) {
          descriptionComponent = (
            <span
              onMouseOut={() => {
                this.setState({
                  descriptionHovered: !this.state.descriptionHovered
                });
              }}
              onClick={() => {
                this.setState({ showDescriptionInput: true });
              }}
              style={{
                cursor: "pointer",
                color: "grey",
                borderBottom: "1px solid black"
              }}
            >
              Write a description about yourself
            </span>
          );
        } else {
          descriptionComponent = (
            <input
              ref={this.input}
              autoFocus
              onBlur={event => {
                this.setState({
                  showDescriptionInput: false,
                  descriptionHovered: false,
                  userDescription: event.target.value
                });
              }}
            />
          );
        }
      } else {
        descriptionComponent = (
          <span
            onMouseEnter={() => {
              this.setState({
                descriptionHovered: !this.state.descriptionHovered
              });
            }}
            style={{ cursor: "pointer", color: "grey" }}
          >
            Write a description about yourself
          </span>
        );
      }
    } else {
      if (this.state.descriptionHovered) {
        if (!this.state.showDescriptionInput) {
          descriptionComponent = (
            <span
              onMouseOut={() => {
                this.setState({
                  descriptionHovered: !this.state.descriptionHovered
                });
              }}
              onClick={() => {
                this.setState({ showDescriptionInput: true });
              }}
              style={{
                cursor: "pointer",
                color: "grey",
                borderBottom: "1px solid black"
              }}
            >
              {this.state.userDescription}
            </span>
          );
        } else {
          descriptionComponent = (
            <input
              ref={this.input}
              autoFocus
              onBlur={event => {
                this.setState({
                  showDescriptionInput: false,
                  descriptionHovered: false,
                  userDescription: event.target.value
                });
              }}
            />
          );
        }
      } else {
        descriptionComponent = (
          <span
            onMouseEnter={() => {
              this.setState({
                descriptionHovered: !this.state.descriptionHovered
              });
            }}
            style={{ cursor: "pointer", color: "grey" }}
          >
            {this.state.userDescription}
          </span>
        );
      }
    }

    return (
      <React.Fragment>
        <NavBar />
        <input
          type="file"
          accept="image/*"
          hidden
          ref={this.fileInput}
          onChange={event => {
            if (event.target && event.target.files[0]) {
              var file = event.target.files[0];
              var picSrc = URL.createObjectURL(file);
              var img = new Image();
              img.src = picSrc;
              img.onload = function() {
                if (this.height / this.width !== 1) {
                  alert("An image with ratio 1:1 would be better but okay!");
                }
              };

              this.setState({
                userPic: picSrc
              });
              let formData = new FormData();
              formData.append("file", file);
              formData.append("userId", this.props.auth.user.id);
              this.props.uploadUserPhoto(formData);
            }
          }}
        />
        <Container text style={{ marginTop: "2rem" }}>
          <div>
            {this.state.imgHovered ? (
              <div
                style={{ position: "relative" }}
                onMouseLeave={() => {
                  this.setState({ imgHovered: false });
                }}
              >
                <div>
                  <span
                    style={{
                      cursor: "pointer",
                      position: "absolute",
                      top: "50px",
                      left: "50px",
                      backgroundColor: "white",
                      padding: "1rem",
                      borderRadius: "50%"
                    }}
                    onClick={() => {
                      this.fileInput.current.click();
                      this.setState({ imgHovered: false });
                    }}
                  >
                    edit
                  </span>
                </div>

                <img
                  src={profilePicSrc}
                  style={{
                    borderRadius: "50%",
                    width: "150px",
                    height: "150px",
                    float: "left"
                  }}
                />
              </div>
            ) : (
              <img
                src={profilePicSrc}
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  float: "left"
                }}
                onMouseEnter={() => {
                  this.setState({ imgHovered: true });
                }}
              />
            )}

            <Header
              as="h1"
              onMouseOver={() => {
                console.log("hovered?");
              }}
            >
              {username}
            </Header>

            {descriptionComponent}
          </div>
        </Container>
        <Menu style={{ clear: "both", margin: "0 auto" }} size="mini">
          <Menu.Item
            as="a"
            onClick={() => {
              this.props.history.push("/profile/yourroadmaps");
            }}
          >
            Your Roadmaps
          </Menu.Item>
          <Menu.Item
            as="a"
            onClick={() => {
              this.props.history.push("/profile/starred");
            }}
          >
            Starred
          </Menu.Item>
          <Menu.Item
            as="a"
            onClick={() => {
              this.props.history.push("/profile/drafts");
            }}
          >
            Drafts
          </Menu.Item>
        </Menu>
        {profileComponent}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(
  mapStateToProps,
  { uploadUserPhoto }
)(withRouter(Profile));
