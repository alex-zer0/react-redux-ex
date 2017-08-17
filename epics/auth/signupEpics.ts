import { actions } from 'react-redux-form'
import { browserHistory } from 'react-router'
import { routerActions } from 'react-router-redux'
import { MiddlewareAPI } from 'redux'
import { ActionsObservable, combineEpics } from 'redux-observable'
import { Observable } from 'rxjs/Observable'
import { TokenStorageCreator } from '../'
import { State } from '../../redux'
import {
  AUTH_SIGNUP_FAILED,
  AUTH_SIGNUP_REQUEST,
  AUTH_SIGNUP_SUCCEED,
  authCloseModal,
  authSignupFailed,
  AuthSignupPayload,
  authSignupSucceed
} from '../../redux/auth'
import { AUTH_SIGNUP_MODEL, getFormModel } from '../../redux/forms'
import { ActionWithPayload } from '../../redux/typings'
import { createSignup } from '../../xhr/authXhr'
import { userVideosPath } from '../preload'

const signupModel = getFormModel(AUTH_SIGNUP_MODEL)

const doAuthSignup = (tokenStorageCreator: TokenStorageCreator) =>
  (action$: ActionsObservable<any>, store: MiddlewareAPI<State>) => {
    const signup = createSignup(tokenStorageCreator(store))
    return action$
      .ofType(AUTH_SIGNUP_REQUEST)
      .mergeMap((action: ActionWithPayload<AuthSignupPayload>) =>
        Observable.fromPromise(signup(action.payload.email))
          .map(data => {
            const res = data as any
            if (res.error || res.message === null) {
              return authSignupFailed()
            }
            return authSignupSucceed()
          })
          .catch((error: any) => Observable.of(authSignupFailed())))
  }

const setPendingOnRequestEpic =
  (action$: ActionsObservable<any>) =>
    action$
      .ofType(AUTH_SIGNUP_REQUEST)
      .map(() => actions.setPending(signupModel, true))

const reloadPageOnSuccessEpic = (action$: ActionsObservable<any>) =>
  action$
    .ofType(AUTH_SIGNUP_SUCCEED)
    .map(() => routerActions.replace(userVideosPath))

const closeModalOnSuccessEpic = (action$: ActionsObservable<any>) =>
  action$
    .ofType(AUTH_SIGNUP_SUCCEED)
    .map(authCloseModal)

const resetPendingOnFailEpic =
  (action$: ActionsObservable<any>) =>
    action$
      .ofType(AUTH_SIGNUP_FAILED)
      .map(() => actions.setPending(signupModel, false))

const setErrorsOnFailEpic =
  (action$: ActionsObservable<any>) =>
    action$
      .ofType(AUTH_SIGNUP_FAILED)
      .map(() => actions.setErrors(signupModel, {
        emailAlreadyRegistered: true
      }))

const signupEpicCreator = (tokenStorageCreator: TokenStorageCreator) =>
  combineEpics(
    doAuthSignup(tokenStorageCreator),
    setPendingOnRequestEpic,
    closeModalOnSuccessEpic,
    reloadPageOnSuccessEpic,
    resetPendingOnFailEpic,
    setErrorsOnFailEpic
  )

export default signupEpicCreator
