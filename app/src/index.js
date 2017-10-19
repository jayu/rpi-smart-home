import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import App from './components/App/App-container'
import store from './store'
import Routes from './router';
import './index.css'
require('es6-promise').polyfill();

ReactDOM.render(
  <Provider store={store}>{Routes}</Provider>,
  document.getElementById('root')
)
