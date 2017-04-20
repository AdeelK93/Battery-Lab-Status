// This file renders the app to DOM, and nothing more
// Uses react-snapshot to speed up initial render

import React from 'react';
import { render } from 'react-snapshot'
import App from './App';
import './css/index.css';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

render(
  <App />,
  document.getElementById('root')
);

// Reload the page when rotating the screen
// Otherwise chart aspect ratios get wonky
window.onorientationchange = function() { window.location.reload() }
