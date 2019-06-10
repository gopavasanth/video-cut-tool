import React from 'react';

import { Helmet } from 'react-helmet';
import { BrowserRouter, Route, Switch  } from 'react-router-dom';
import { Redirect } from 'react-router';

import home from './components/home';

function AppRoutes() {
  return (
    <Switch>
      <Route exact path="/" component={home} />
      <Route exact path="/video-cut-tool" component={home} />
    </Switch>
  );
}


export default function App() {
  return (
    <React.Fragment>
      <Helmet>
        <title>VideoCutTool</title>
      </Helmet>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </React.Fragment>
  );
}
