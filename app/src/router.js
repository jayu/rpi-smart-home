import React from 'react';
import { Router, Route, browserHistory, IndexRoute, Redirect } from 'react-router';

// Components


import MainLayout           from './components/MainLayout/MainLayout-view';
import CoffeeMachine        from './components/CoffeeMachine/CoffeeMachine-container';
import Sockets              from './components/Sockets/Sockets-container';
import Temperature          from './components/Temperature/Temperature-container';
import MusicPlayer          from './components/MusicPlayer/MusicPlayer-container';
// Routes

const Routes  = (
  <Router history={browserHistory}>
    <Redirect from="/" to="sockets" />
    <Route path="/" component={MainLayout}>
        <Route path="sockets" component={Sockets}/>
        <Route path="temperature" component={Temperature}/>
        <Route path="musicPlayer" component={MusicPlayer}/>
        <Route path="coffeeMachine" component={CoffeeMachine}/>
    </Route>
  </Router>
);

export default Routes;
