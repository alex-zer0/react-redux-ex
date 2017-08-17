import { ActionMeta, createAction } from 'redux-actions'
import { videoPath } from '../epics/preload'
import { ProjectNode, VideoCommentEdge, VideoNode, VideoQueryResult } from '../ghl/typings'
import { createPreloadableReducer, preloadableInitialState, PreloadableState } from './preload'

export const VIEW_VIDEO = 'video/VIEW_VIDEO'
export const LIKE_VIDEO = 'video/LIKE_VIDEO'
export const DISLIKE_VIDEO = 'video/DISLIKE_VIDEO'
export const LOAD_VIDEO = 'video/LOAD_VIDEO'
export const LOAD_VIDEO_SUCCESS = 'video/LOAD_VIDEO_SUCCESS'
export const ADD_VIDEO_COMMENT = 'video/ADD_VIDEO_COMMENT'
export const ADD_VIDEO_COMMENT_SUCCESS = 'video/ADD_VIDEO_COMMENT_SUCCESS'

export const viewVideo = createAction<string, string>(VIEW_VIDEO, p => p)
export const likeVideo = createAction<any, any>(LIKE_VIDEO, p => p)
export const dislikeVideo = createAction<any, any>(DISLIKE_VIDEO, p => p)
export const addVideoComment = createAction<any, any>(ADD_VIDEO_COMMENT, p => p)
export const addVideoCommentSuccess = createAction<any, any>(ADD_VIDEO_COMMENT_SUCCESS, p => p)
export const loadVideo = createAction<any, any>(LOAD_VIDEO, p => p)
export const loadVideoSuccess = createAction<any, any>(LOAD_VIDEO_SUCCESS, p => p)

export interface VideoState extends PreloadableState {
  video?: VideoNode,
  project?: ProjectNode
}

const initialState: VideoState = {
  ...preloadableInitialState
}

const preloadableReducer = createPreloadableReducer(videoPath, (state, payload: VideoQueryResult) => ({
  ...state,
  video: payload.video
}))

const videoReducer = (state: VideoState = initialState, action: ActionMeta<any, any>): VideoState => {
  state = preloadableReducer(state, action) as VideoState
  if (!state.video) {
    return state
  }

  switch (action.type) {
    case VIEW_VIDEO:
      return {
        ...state,
        video: {
          ...state.video,
          views: state.video ? state.video.views + 1 : 0
        }
      }
    case LIKE_VIDEO:
      return {
        ...state,
        video: {
          ...state.video,
          reactions: {
            likes: state.video.reaction === 'Like'
              ? state.video.reactions.likes
              : state.video.reactions.likes + 1,
            dislikes: state.video.reaction === 'Dislike'
              ? state.video.reactions.dislikes - 1
              : state.video.reactions.dislikes,
          },
          reaction: 'Like'
        }
      }
    case DISLIKE_VIDEO:
      return {
        ...state,
        video: {
          ...state.video,
          reactions: {
            likes: state.video.reaction === 'Like'
              ? state.video.reactions.likes - 1
              : state.video.reactions.likes,
            dislikes: state.video.reaction === 'Dislike'
              ? state.video.reactions.dislikes
              : state.video.reactions.dislikes + 1,
          },
          reaction: 'Dislike'
        }
      }
    case ADD_VIDEO_COMMENT_SUCCESS:
      return {
        ...state,
        video: {
          ...state.video,
          numberOfComments: state.video.numberOfComments + 1,
          comments: {
            ...state.video.comments,
            edges: [{ node: action.payload }, ...state.video.comments.edges] as VideoCommentEdge[]
          }
        }
      }
    case LOAD_VIDEO_SUCCESS:
      return {
        ...state,
        video: {
          ...state.video,
          comments: {
            ...action.payload.comments,
            edges: [...state.video.comments.edges, ...action.payload.comments.edges] as VideoCommentEdge[]
          }
        }
      }
  }

  return state
}

export default videoReducer
