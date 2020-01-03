import React from 'react';

import { BrowserRouter, Route, Switch  } from 'react-router-dom';

import home from './components/home';
// import NotFound from "./components/NotFound";

function AppRoutes() {
  return (
    <Switch>
      {/* <Route exact path="*" component={NotFound} /> */}
      <Route exact path="/video-cut-tool/" component={home} title="VideoCutTool" />
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
