import { Action } from 'redux-actions'
import { UserDashboardResult } from '../ghl/typings'
import { ROUTE_PRELOAD_SUCCESS } from './preload'

export interface UserAppState {
  newVideosCount: number | null
}

export const initialState: UserAppState = {
  newVideosCount: null
}

const userAppReducer = (state: UserAppState = initialState, action: Action<any>): UserAppState => {

  switch (action.type) {
    case ROUTE_PRELOAD_SUCCESS:
      action = action as Action<UserDashboardResult>
      return {
        ...state,
        newVideosCount: action.payload.notViewedVideosCount || null
      }
  }

  return state
}

export default userAppReducer
