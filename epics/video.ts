import { MiddlewareAPI } from 'redux'
import { Action } from 'redux-actions'
import { ActionsObservable, combineEpics } from 'redux-observable'
import { Observable } from 'rxjs/Observable'
import { VideoCommentInput } from '../ghl/typings'
import {
  addVideoCommentMutation, dislikeVideoMutation, likeVideoMutation, loadVideoQuery,
  viewVideoMutation
} from '../ghl/videoGql'
import { State } from '../redux/index'
import {
  ADD_VIDEO_COMMENT, addVideoCommentSuccess, DISLIKE_VIDEO, LIKE_VIDEO, LOAD_VIDEO,
  loadVideoSuccess, VIEW_VIDEO
} from '../redux/video'
import { TokenStorageCreator } from './index'

const viewVideoEpic = (tokenStorageCreator: TokenStorageCreator) =>
  (action$: ActionsObservable<any>, store: MiddlewareAPI<State>) =>
    action$
      .ofType(VIEW_VIDEO)
      .map((action: Action<string>) => Observable.fromPromise(viewVideoMutation(tokenStorageCreator(store))(action.payload)))
      .filter(() => false)
const likeVideoEpic = (tokenStorageCreator: TokenStorageCreator) =>
  (action$: ActionsObservable<any>, store: MiddlewareAPI<State>) =>
    action$
      .ofType(LIKE_VIDEO)
      .map((action: Action<number>) => Observable.fromPromise(likeVideoMutation(tokenStorageCreator(store))(action.payload)))
      .filter(() => false)
const dislikeVideoEpic = (tokenStorageCreator: TokenStorageCreator) =>
  (action$: ActionsObservable<any>, store: MiddlewareAPI<State>) =>
    action$
      .ofType(DISLIKE_VIDEO)
      .map((action: Action<number>) => Observable.fromPromise(dislikeVideoMutation(tokenStorageCreator(store))(action.payload)))
      .filter(() => false)
const addVideoCommentEpic = (tokenStorageCreator: TokenStorageCreator) =>
  (action$: ActionsObservable<any>, store: MiddlewareAPI<State>) =>
    action$
      .ofType(ADD_VIDEO_COMMENT)
      .mergeMap((action: Action<{ id: number, input: VideoCommentInput }>) =>
        Observable.fromPromise(addVideoCommentMutation(tokenStorageCreator(store))(action.payload)))
      .map(payload => addVideoCommentSuccess(payload.addVideoComment))
const loadVideoEpic = (tokenStorageCreator: TokenStorageCreator) =>
  (action$: ActionsObservable<any>, store: MiddlewareAPI<State>) =>
    action$
      .ofType(LOAD_VIDEO)
      .mergeMap((action: Action<{ videoId: string, nextLastId: string }>) =>
        Observable.fromPromise(loadVideoQuery(tokenStorageCreator(store))(action.payload)))
      .map(payload => loadVideoSuccess(payload.video))

const videoEpicCreator = (tokenStorageCreator: TokenStorageCreator) => combineEpics(
  viewVideoEpic(tokenStorageCreator),
  likeVideoEpic(tokenStorageCreator),
  dislikeVideoEpic(tokenStorageCreator),
  loadVideoEpic(tokenStorageCreator),
  addVideoCommentEpic(tokenStorageCreator)
)

export default videoEpicCreator
