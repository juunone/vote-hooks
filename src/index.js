import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import * as Sentry from '@sentry/browser';

import App from './components/App';
import configureStore from './store/configureStore'
import rootSaga from './sagas'

const store = configureStore(window.__INITIAL_STATE__)
store.runSaga(rootSaga)

if(process.env.NODE_ENV === 'development'){
  Sentry.init({dsn: process.env.SENTRY_DSN});
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);
