import React from 'react';

import { BrowserRouter, Route, Switch  } from 'react-router-dom';

import home from './components/home';

const ENV_SETTINGS = require('./env')();
// import NotFound from "./components/NotFound";

function AppRoutes() {
  return (
    <Switch>
      {/* <Route exact path="*" component={NotFound} /> */}
      <Route exact path={ENV_SETTINGS.path} component={home} title="VideoCutTool" />
      {/* <Route component={NotFound} /> */}
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
