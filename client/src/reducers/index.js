import { combineReducers } from 'redux'
import authReducer from './authReducer'
import errorReducer from './errorReducer'
import modalReducer from './modalReducer'
export default combineReducers({
    auth: authReducer,
    errors: errorReducer,
    modal: modalReducer
})
