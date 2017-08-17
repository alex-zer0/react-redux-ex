import moment from 'moment-timezone'
import * as React from 'react'
import { browserHistory } from 'react-router'
import { VideoCommentInput } from '../../ghl/typings'
import { VideoState } from '../../redux/video'
import utils from '../../utils'
import Comments from '../_shared/comments'
import Logo from '../_shared/logo'
import MobiledocContent from '../_shared/mobiledoc-content/index'
import ProfileLink from '../_shared/profile-link'
import VideoPlayer from '../_shared/video-player'
import { VideoHead } from './VideoHead'

interface VideoPageProps extends VideoState {
  addComment: (videoRawId: number, input: VideoCommentInput) => any
  handleOpenLoginModal: () => any
  isAuthenticated: boolean
  currentUserId: string
  loadMoreComments: (videoId: string, nextLastId: string) => any
  viewVideo: (videoId: string) => any
  likeVideo: (id: number, second: number) => any
  dislikeVideo: (id: number, second: number) => any
}

const YEAR = moment().year()
class VideoPage extends React.PureComponent<VideoPageProps, {}> {
  second: number = 0
  sendComment = (comment: string, replyTo?: string) => {
    const { video, addComment } = this.props
    if (!video) {
      return
    }
    addComment(Number(video.rawId), { comment, replyTo })
  }

  loadMore = () => {
    const { video, loadMoreComments } = this.props
    if (!video) {
      return
    }
    const { nextLastId } = video.comments.pageInfo
    if (nextLastId) {
      loadMoreComments(video.rawId, nextLastId)
    }
  }

  goBack() {
    browserHistory.goBack()
  }

  render() {
    const {
      isLoaded, project, video, handleOpenLoginModal, isAuthenticated, viewVideo,
      likeVideo, dislikeVideo, currentUserId
    } = this.props

    if (!isLoaded || !video) {
      return null
    }
    const like = () => {
      if (isAuthenticated) {
        likeVideo(Number(video.rawId), this.second)
      }
    }
    const dislike = () => {
      if (isAuthenticated) {
        dislikeVideo(Number(video.rawId), this.second)
      }
    }
    const updateTime = (time: number) => this.second = time && time >= 0 ? Math.ceil(time) : 0
    const promo = project && project.userProduct ? project.userProduct.promo : null

    let videoPlayerBlock
    if (video.isAvailableForView) {
      videoPlayerBlock = (
        <div className="video-player-wrapper">
          <VideoPlayer
            videoId={video.id}
            autoPlay={true}
            poster={video.thumbnail}
            source={video.m3u8playlist}
            onPlay={viewVideo}
            onTimeupdate={updateTime}
          />
          <div className="navigation">
            <a className="g-link blue noline" onClick={this.goBack}>
              <i className="fa fa-arrow-left"/> вернуться назад
            </a>
            <h4>{video.title}</h4>
          </div>
        </div>
      )
    } else {
      videoPlayerBlock = (
        <div className="video-player-wrapper no-player">
          {video && video.thumbnail && <img src={video.thumbnail} width="100%" alt=""/>}
          <div className="subscribe-info">
            <h5>Смотрите это, а также многие другие видео после подписки</h5>
            <button className="g-ctrl btn-inherit" onClick={handleOpenLoginModal}>Подписаться</button>
            {promo && !promo.price && <p>бесплатно - {utils.durationStr(promo.duration)}</p>}
            {promo && promo.price && <p>{utils.priceStr(promo.price)} - {utils.durationStr(promo.duration)}</p>}
            {!isAuthenticated &&
            <p>Уже есть аккаунт? <a className="g-link inherit" onClick={handleOpenLoginModal}>Вход</a></p>}
          </div>
        </div>
      )
    }

    return (
      <main className="video-page">
        <VideoHead/>
        <header>
          <div className="header-wrapper">
            <div className="branding">
              <Logo/>
              {project && project.title && <h3>{project.title}</h3>}
            </div>
            <div className="top-nav">
              <ProfileLink/>
            </div>
          </div>
        </header>
        <section className="video-page__player">
          {videoPlayerBlock}
        </section>
        <section className="video-page__info">
          <p className="stats">
            <span><i className="fa fa-eye"/> {video.views}</span>
            <span className="like" onClick={like}><i className="fa fa-thumbs-o-up"/> {video.reactions.likes}</span>
            <span className="dislike" onClick={dislike}><i className="fa fa-thumbs-o-down"/> {video.reactions.dislikes}</span>
          </p>
          {video.description ?
            (
              <div className="description">
                <MobiledocContent mobiledoc={video.description}/>
              </div>
            ) : (
              <p className="description">Нет описания</p>
            )
          }
          <div className="video-comments">
            <Comments
              currentUserId={currentUserId}
              comments={video.comments}
              onSend={this.sendComment}
              onOpenAuth={handleOpenLoginModal}
              isAuthenticated={isAuthenticated}
              loadMore={this.loadMore}
            />
          </div>
        </section>
        <footer>
          <p>&copy; {YEAR} Реализовано на платформе VidGid.ru</p>
        </footer>
      </main>
    )
  }
}

export default VideoPage
