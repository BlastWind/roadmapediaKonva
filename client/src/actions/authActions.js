import axios from 'axios'
import setAuthToken from '../utils/setAuthToken'
import jwt_decode from 'jwt-decode'
import {
    GET_ERRORS,
    SET_CURRENT_USER,
    USER_LOADING,
    SET_REGISTER_STATUS,
    UPLOAD_USER_PHOTO,
    SET_MODAL_STATE,
    SET_CLIENTSIDE_USER_PIC
} from './types'
// Register User
export const setRegistrationStatus = status => dispatch => {
    dispatch({ type: SET_REGISTER_STATUS, payload: status })
}

export const setLoginStatus = status => dispatch => {
    dispatch({ type: 'SET_LOGIN_STATUS', payload: status })
}

export const registerUser = userData => dispatch => {
    axios
        .post('/api/users/register', userData)
        .then(res => {
            if (res.data.success === true) {
                dispatch({
                    type: SET_REGISTER_STATUS,
                    payload: 'registrationCompleted'
                })
            }
        })

        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        )
}
// Login - get user token
export const loginUser = userData => dispatch => {
    axios
        .post('/api/users/login', userData)
        .then(res => {
            // Save to localStorage
            // Set token to localStorage
            const { token } = res.data
            localStorage.setItem('jwtToken', token)
            // Set token to Auth header
            setAuthToken(token)
            // Decode token to get user data
            //payload was before decode, jwt_decode decodes the payload after decode LOL
            const decoded = jwt_decode(token)
            // Set current user
            dispatch(setCurrentUser(decoded))
            dispatch(setLoginStatus('loginCompleted'))
        })
        .catch(err => {
            if (err)
                dispatch({
                    type: GET_ERRORS,
                    payload: err.response.data
                })
        })
}
// Set logged in user
export const setCurrentUser = decoded => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded
    }
}
// User loading
export const setUserLoading = () => {
    return {
        type: USER_LOADING
    }
}
// Log user out
export const logoutUser = () => dispatch => {
    // Remove token from local storage
    localStorage.removeItem('jwtToken')
    // Remove auth header for future requests
    setAuthToken(false)
    // Set current user to empty object {} which will set isAuthenticated to false
    dispatch(setCurrentUser({}))
}

export const clearErrors = () => dispatch => {
    dispatch({ type: GET_ERRORS, payload: {} })
}

export const uploadUserPhoto = info => dispatch => {
    axios.put('/api/users/updateProfilePic', info)
}

export const setModalState = state => dispatch => {
    dispatch({ type: SET_MODAL_STATE, payload: { state } })
}

export const setClientSideUserPic = pic => dispatch => {
    dispatch({ type: SET_CLIENTSIDE_USER_PIC, payload: { pic: pic } })
}
