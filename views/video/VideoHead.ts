import { connect } from 'react-redux'
import { State } from '../../redux'
import { Head, HeadProps } from '../_shared/head'
import { renderMobiledocAsText } from '../_shared/mobiledoc-content'

const mapStateToProps = (state: State): HeadProps => {
  if (!state.video.video) {
    return {}
  }

  const description = state.video.video.description && renderMobiledocAsText(state.video.video.description)

  return {
    metaDescription: description,
    ogDescription: description,
    ogImage: state.video.video.thumbnail,
    ogTitle: state.video.video.title,
    title: state.video.video.title
  }
}

export const VideoHead = connect(mapStateToProps)(Head)
