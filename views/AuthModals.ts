import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../redux'
import { authCloseModal } from '../redux/auth'

import { Modals, ModalsProps } from './_shared/modals'

const mapStateToProps = (state: State): Partial<ModalsProps> => ({
  className: 'g-auth-modal',
  modalType: state.auth.modalType
})

const mapDispatchToProps = (dispatch: Dispatch<State>): Partial<ModalsProps> => ({
  onClose: () => dispatch(authCloseModal())
})

export default connect(mapStateToProps, mapDispatchToProps)(Modals)
