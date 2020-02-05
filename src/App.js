import React from 'react';

import { BrowserRouter, Route, Switch  } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import home from './components/home';
import NotFound from './components/NotFound';

const ENV_SETTINGS = require('./env')();

function AppRoutes() {
  return (
    <Switch>
      <Route exact path={ENV_SETTINGS.path} component={home} title="VideoCutTool" />
      <Route path={ENV_SETTINGS.not_found_path} component={NotFound} />
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
