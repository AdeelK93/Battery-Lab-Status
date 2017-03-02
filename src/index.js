// This file renders the app to DOM, and nothing more

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './css/index.css';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

// Reload the page when rotating the screen
// Otherwise chart aspect ratios get wonky
window.onorientationchange = function() { window.location.reload() }
