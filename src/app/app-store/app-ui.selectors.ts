import { createSelector } from '@ngrx/store';
import { AppState } from './reducers';

export const selectAppUiState = (state: AppState) => state.appUiState;

export const selectAlertPopup = createSelector(
    selectAppUiState,
    (appUiState) => appUiState.alertPopup,
  );