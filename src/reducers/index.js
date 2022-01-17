import {combineReducers} from 'redux';
import ajaxStatusReducer from './ajaxStatusReducer';

export default combineReducers({
    ajaxCallsInProgress: ajaxStatusReducer
});