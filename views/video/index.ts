import { connect, Dispatch } from 'react-redux'
import { VideoCommentInput } from '../../ghl/typings'
import { authOpenModal } from '../../redux/auth'
import { State } from '../../redux/index'
import { addVideoComment, dislikeVideo, likeVideo, loadVideo, VideoState } from '../../redux/video'
import { viewVideo } from '../../redux/video'
import VideoPage from './VideoPage'

const mapStateToProps = (state: State): VideoState & {isAuthenticated: boolean} => ({
  ...state.video,
  currentUserId: state.profile.profile.id,
  project: state.project,
  isAuthenticated: state.auth.isAuthenticated
})

const mapDispatchToProps = (dispatch: Dispatch<State>) => ({
  addComment: (videoRawId: number, input: VideoCommentInput) => dispatch(addVideoComment({ id: videoRawId, input })),
  handleOpenLoginModal: () => dispatch(authOpenModal('LOGIN')),
  loadMoreComments: (videoId: string, nextLastId: string) => dispatch(loadVideo({ videoId, nextLastId })),
  viewVideo: (videoId: string) => dispatch(viewVideo(videoId)),
  likeVideo: (id: number, second: number) => dispatch(likeVideo({ id, second })),
  dislikeVideo: (id: number, second: number) => dispatch(dislikeVideo({ id, second }))
})

export default connect(mapStateToProps, mapDispatchToProps)(VideoPage)
