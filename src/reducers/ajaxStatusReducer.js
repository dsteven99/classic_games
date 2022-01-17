import {AJAX_CALL_ERROR, BEGIN_AJAX_CALL} from '../actions/types';

function actionTypeEndsInSuccess(type) {
    return type.substring(type.length - 8) === '_SUCCESS';
}

export default function ajaxStatusReducer(state = 0, action) {
    if (action.type === BEGIN_AJAX_CALL) {
        return state + 1;
    }
    else if (action.type === AJAX_CALL_ERROR ||
        actionTypeEndsInSuccess(action.type)) {
        return state - 1;
    }
    return state;
}