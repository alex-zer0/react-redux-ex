import { actions } from 'react-redux-form'
import { browserHistory } from 'react-router'
import { routerActions } from 'react-router-redux'
import { MiddlewareAPI } from 'redux'
import { ActionsObservable, combineEpics } from 'redux-observable'
import { Observable } from 'rxjs/Observable'
import { TokenStorageCreator } from '../'
import { State } from '../../redux'
import {
  AUTH_REQUEST,
  AUTH_REQUEST_FAILED,
  AUTH_REQUEST_SUCCEED,
  authCloseModal,
  authRequestFailed,
  AuthRequestPayload,
  authRequestSucceed
} from '../../redux/auth'
import { AUTH_LOGIN_MODEL, getFormModel } from '../../redux/forms'
import { ActionWithPayload } from '../../redux/typings'
import { createLoginWithCredentials } from '../../xhr/authXhr'

const loginModel = getFormModel(AUTH_LOGIN_MODEL)

const doAuthRequest = (tokenStorageCreator: TokenStorageCreator) =>
  (action$: ActionsObservable<any>, store: MiddlewareAPI<State>) => {
    const loginWithCredentials = createLoginWithCredentials(tokenStorageCreator(store))
    return action$
      .ofType(AUTH_REQUEST)
      .mergeMap((action: ActionWithPayload<AuthRequestPayload>) =>
        Observable.fromPromise(loginWithCredentials(action.payload.username, action.payload.password))
          .map(data => {
            const res = data as any
            if (res.error || res.message === null) {
              return authRequestFailed()
            }
            return authRequestSucceed()
          })
          .catch((error: any) => Observable.of(authRequestFailed())))
  }

const setPendingOnRequestEpic = (action$: ActionsObservable<any>) =>
  action$
    .ofType(AUTH_REQUEST)
    .map(() => actions.setPending(loginModel, true))

const reloadPageOnSuccessEpic = (action$: ActionsObservable<any>) =>
  action$
    .ofType(AUTH_REQUEST_SUCCEED)
    .map(() => routerActions.replace(browserHistory.getCurrentLocation().pathname))

const closeModalOnSuccessEpic = (action$: ActionsObservable<any>) =>
  action$
    .ofType(AUTH_REQUEST_SUCCEED)
    .map(authCloseModal)

const resetPendingOnFailEpic = (action$: ActionsObservable<any>) =>
  action$
    .ofType(AUTH_REQUEST_FAILED)
    .map(() => actions.setPending(loginModel, false))

const invalidateFormOnFailEpic = (action$: ActionsObservable<any>) =>
  action$
    .ofType(AUTH_REQUEST_FAILED)
    .map(() => actions.setErrors(loginModel, {
      wrongEmailOrPassword: true
    }))

const loginEpicCreator = (tokenStorageCreator: TokenStorageCreator) => combineEpics(
  doAuthRequest(tokenStorageCreator),
  setPendingOnRequestEpic,
  closeModalOnSuccessEpic,
  reloadPageOnSuccessEpic,
  resetPendingOnFailEpic,
  invalidateFormOnFailEpic
)

export default loginEpicCreator
