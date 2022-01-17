import * as types from './types';

export const beginAjaxCall = () => {
    return { type: types.BEGIN_AJAX_CALL };
};

export const ajaxCallError = () => {
    return { type: types.AJAX_CALL_ERROR };
};