import { combineEpics, Epic } from 'redux-observable'
import { TokenStorage } from '../xhr/authXhr'
import { MethodRequestOptions } from '../xhr/xhr'
import authEpicCreator from './auth'
import preloadEpicCreator from './preload'
import profileEpicCreator from './profile'
import subscriptionsEpicCreator from './subscriptions'
import userDashboardEpicCreator from './userDashboard'
import videoEpicCreator from './video'

export type TokenStorageCreator = (...args: any[]) => TokenStorage

const epicCreator = (tokenStorageCreator: TokenStorageCreator, requestOptions?: MethodRequestOptions): Epic<any> =>
  combineEpics(
    authEpicCreator(tokenStorageCreator, requestOptions),
    preloadEpicCreator(tokenStorageCreator, requestOptions),
    videoEpicCreator(tokenStorageCreator),
    subscriptionsEpicCreator(tokenStorageCreator),
    profileEpicCreator(tokenStorageCreator),
    userDashboardEpicCreator(tokenStorageCreator)
  )

export default epicCreator
