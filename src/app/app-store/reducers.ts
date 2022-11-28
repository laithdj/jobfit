import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { AppUiState, appUiStateReducer } from './app-ui-state.reducer';


export interface AppState {
  appUiState: AppUiState;
}

export const reducers: ActionReducerMap<AppState> = {
  appUiState: appUiStateReducer,
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];
