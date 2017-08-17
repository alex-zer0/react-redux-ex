import { actions } from 'react-redux-form'
import { browserHistory } from 'react-router'
import { routerActions } from 'react-router-redux'
import { MiddlewareAPI } from 'redux'
import { ActionsObservable, combineEpics } from 'redux-observable'
import { Observable } from 'rxjs/Observable'
import { TokenStorageCreator } from '../'
import { purchaseMutation } from '../../ghl/subscriptionGql'
import { PurchaseMutationResult } from '../../ghl/typings'
import { State } from '../../redux'
import { AUTH_SUBSCRIPTION_REQUEST } from '../../redux/auth'
import { AUTH_SUBSCRIPTION_MODEL, getFormModel } from '../../redux/forms'
import { displayNotification } from '../../redux/notifications'

const subscriptionModel = getFormModel(AUTH_SUBSCRIPTION_MODEL)

const doSubscriptionRequest = (tokenStorageCreator: TokenStorageCreator) =>
  (action$: ActionsObservable<any>, store: MiddlewareAPI<State>) => {
    const purchase = purchaseMutation(tokenStorageCreator(store))
    return action$
      .ofType(AUTH_SUBSCRIPTION_REQUEST)
      .mergeMap(() => {
        const state = store.getState()
        const productId = state.subscriptions.userProduct ? state.subscriptions.userProduct.id : ''
        return Observable.fromPromise(purchase(productId))
      })
      .do((payload: PurchaseMutationResult) => {
        const state = store.getState()

        // если есть бесплатный промо, то просто обновляем страницу и показываем сообщение
        if (state.subscriptions.userProduct.promo && !state.subscriptions.userProduct.promo.price) {
          store.dispatch(routerActions.replace(browserHistory.getCurrentLocation().pathname))
          store.dispatch(displayNotification('TRIAL_STARTED'))
        } else {
          const redirect = payload.redirect

          location.href = redirect.url + (redirect.params.length ? `?${redirect.params.map((pair: { key: string, value: string }) => `${pair.key}=${pair.value}`).join('&')}` : '')
        }
      })
      .filter(() => false)
  }

const setPendingOnRequestEpic = (action$: ActionsObservable<any>) =>
  action$
    .ofType(AUTH_SUBSCRIPTION_REQUEST)
    .map(() => actions.setPending(subscriptionModel))

export const subscriptionEpicCreator =
  (tokeStorageCreator: TokenStorageCreator) => combineEpics(
    doSubscriptionRequest(tokeStorageCreator),
    setPendingOnRequestEpic
  )
