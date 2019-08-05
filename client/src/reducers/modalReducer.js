import { SET_MODAL_STATE } from '../actions/types'

const initialState = {
    open: false
}

//3 rergistrationStatus: notRegistering, registeration Loading, registeration completed

export default function(state = initialState, action) {
    switch (action.type) {
    case SET_MODAL_STATE:
        return {
            open: action.payload
        }

    default:
        return state
    }
}
