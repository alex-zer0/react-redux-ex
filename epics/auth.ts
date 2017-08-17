import { push } from 'react-router-redux'
import { MiddlewareAPI } from 'redux'
import { Action } from 'redux-actions'
import { ActionsObservable, combineEpics } from 'redux-observable'
import { Observable } from 'rxjs/Observable'
import {
  AUTH_LOGOUT,
  AUTH_RESET_PASSWORD,
  AUTH_SEND_RESET_PASSWORD,
  AUTH_SIGNUP_SUBSCRIBE,
  authLogoutFailed,
  authLogoutSucceed,
  authRequestFailed,
  authRequestSucceed,
  AuthResetPasswordPayload,
  authResetPasswordSucceed, authSendResetPasswordFailed, authSendResetPasswordSucceed, AuthSignupSubscribePayload
} from '../redux/auth'
import { State } from '../redux/index'
import { displayNotification } from '../redux/notifications'
import { subscribe } from '../redux/subscriptions'
import { ActionWithPayload } from '../redux/typings'
import { createLogout, createResetPassword, createSendResetPassword, createSignup } from '../xhr/authXhr'
import { MethodRequestOptions } from '../xhr/xhr'
import loginEpicsCreator from './auth/loginEpics'
import signupEpicCreator from './auth/signupEpics'
import { subscriptionEpicCreator } from './auth/subscriptionEpics'
import { TokenStorageCreator } from './index'
import changePasswordEpicCreator from './profile/changePasswordEpics'

export const doAuthSignupAndSubscribe = (tokenStorageCreator: TokenStorageCreator) =>
  (action$: ActionsObservable<any>, store: MiddlewareAPI<State>) => {
    const signup = createSignup(tokenStorageCreator(store))
    let subsId: string
    return action$
      .ofType(AUTH_SIGNUP_SUBSCRIBE)
      .mergeMap((action: Action<AuthSignupSubscribePayload>) => {
        const email = action.payload && action.payload.email || ''
        subsId = action.payload && action.payload.subscriptionId || ''
        return Observable.fromPromise(signup(email))
          .catch((error: any) => Observable.of(authRequestFailed()))
      })
      .map(authRequestSucceed)
      .do(() => store.dispatch(subscribe(subsId)))
  }

export const doAuthSendResetPassword = () =>
  (action$: ActionsObservable<any>, store: MiddlewareAPI<State>) => {
    const sendResetPassword = createSendResetPassword()
    return action$
      .ofType(AUTH_SEND_RESET_PASSWORD)
      .mergeMap((action: ActionWithPayload<AuthSignupSubscribePayload>) =>
        Observable.fromPromise(sendResetPassword(action.payload.email))
          .catch((error: any) => Observable.of(authSendResetPasswordFailed()))
      )
      .map(authSendResetPasswordSucceed)
  }

export const doAuthResetPassword = (tokenStorageCreator: TokenStorageCreator) =>
  (action$: ActionsObservable<any>, store: MiddlewareAPI<State>) => {
    const resetPassword = createResetPassword(tokenStorageCreator(store))
    return action$
      .ofType(AUTH_RESET_PASSWORD)
      .mergeMap((action: ActionWithPayload<AuthResetPasswordPayload>) =>
        Observable.fromPromise(resetPassword(action.payload.password, action.payload.token))
          .catch((error: any) => Observable.of(authSendResetPasswordFailed()))
      )
      .map(() => {
        store.dispatch(push('/app'))
        store.dispatch(displayNotification('PASSWORD_WAS_RESET'))
        return authResetPasswordSucceed()
      })
  }
export const doLogout = (tokenStorageCreator: TokenStorageCreator) =>
  (action$: ActionsObservable<any>, store: MiddlewareAPI<State>) => {
    const logout = createLogout(tokenStorageCreator(store))
    return action$
      .ofType(AUTH_LOGOUT)
      .mergeMap(() =>
        Observable.fromPromise(logout()
          .catch((error: any) => Observable.of(authLogoutFailed())))
      )
      .map(() => {
        store.dispatch(push('/'))
        return authLogoutSucceed()
      })
  }

const authEpicCreator = (tokenStorageCreator: TokenStorageCreator, requestOptions?: MethodRequestOptions) => combineEpics(
  loginEpicsCreator(tokenStorageCreator),
  signupEpicCreator(tokenStorageCreator),
  subscriptionEpicCreator(tokenStorageCreator),
  changePasswordEpicCreator(tokenStorageCreator),
  doAuthSignupAndSubscribe(tokenStorageCreator),
  doLogout(tokenStorageCreator),
  doAuthSendResetPassword(),
  doAuthResetPassword(tokenStorageCreator)
)

export default authEpicCreator
