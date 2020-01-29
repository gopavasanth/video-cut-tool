import React from 'react';

import { BrowserRouter, Route, Switch  } from 'react-router-dom';

import home from './components/home';
import NotFound from './components/NotFound';

const ENV_SETTINGS = require('./env')();

function AppRoutes() {
  return (
    <Switch>
      <Route exact path={ENV_SETTINGS.path} component={home} title="VideoCutTool" />
      <Route  path='/' component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <React.Fragment>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </React.Fragment>
  );
}
