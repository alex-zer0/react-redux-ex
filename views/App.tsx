import cn from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { ProjectTheme } from '../ghl/typings'
import { State } from '../redux'
import AuthModals from './AuthModals'
import JsScripts from './JsScripts'

import ReactElement = React.ReactElement
import ReactNode = React.ReactNode

interface StateProps {
  themeClassName: string
}

interface AppProps extends StateProps {
  children: ReactNode[]
}

const themeClassSelector = createSelector<State, string, ProjectTheme>(
  (state: State) => state.project.theme,
  (theme: ProjectTheme) => cn('g-theme', theme.toLowerCase())
)

const mapStateToProps = (state: State): StateProps => ({
  themeClassName: themeClassSelector(state)
})

class App extends React.PureComponent<AppProps, any> {

  render() {
    const { children, themeClassName } = this.props

    return (
      <section id="g-layout" className={themeClassName}>
        {children}
        <AuthModals/>
        <JsScripts/>
      </section>
    )
  }
}

export default connect(mapStateToProps)(App)
