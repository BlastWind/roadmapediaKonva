import {
  SET_CURRENT_USER,
  USER_LOADING,
  SET_REGISTER_STATUS,
  SET_LOGIN_STATUS
} from "../actions/types";
const isEmpty = require("is-empty");
const initialState = {
  isAuthenticated: false,
  user: {},
  loading: false,
  registrationStatus: "notRegistering",
  loginStatus: "notLogging"
};

//3 rergistrationStatus: notRegistering, registeration Loading, registeration completed

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_CURRENT_USER:
      return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        user: action.payload
      };
    case USER_LOADING:
      return {
        ...state,
        loading: true
      };
    case SET_REGISTER_STATUS:
      return {
        ...state,
        registrationStatus: action.payload
      };
    case SET_LOGIN_STATUS:
      return {
        ...state,
        loginStatus: action.payload
      };

    default:
      return state;
  }
}
