/* eslint-disable max-classes-per-file */
import { Action } from '@ngrx/store';

// eslint-disable-next-line no-shadow
export enum AppUiActionTypes {
  Authenticate = '[App] Authenticate Token',
  SetError = '[App] Set Error',


}

export class Authenticate implements Action {
  readonly type = AppUiActionTypes.Authenticate;
  constructor() {}
}
export class SetError implements Action {
  readonly type = AppUiActionTypes.SetError;

  constructor(public payload: { errorMessages: string[], title?: string }) {}
}



export type AppUiActions =
  Authenticate
