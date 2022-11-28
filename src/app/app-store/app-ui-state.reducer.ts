import * as _ from 'lodash';
import { AlertPopup } from '../shared/models/alertPopUp.model';
import { AppUiActions, AppUiActionTypes } from './app-ui-state.actions';

export interface AppUiState {
  alertPopup?: AlertPopup;

}

export const initialAppUiState: AppUiState = {

};

export function appUiStateReducer(state = initialAppUiState, action: any) {
  switch (action.type) {

    case AppUiActionTypes.SetError:
      return {
        ...state,
        alertPopup: new AlertPopup(action.payload.errorMessages, action.payload.title),
      };

    default:
      return state;
  }
}
