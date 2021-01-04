import React from 'react';

import { BrowserRouter, Route, Router, Switch  } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { IntlProvider } from '@wikimedia/react.i18n'
import en from './i18n/en';
import de from './i18n/de';
import fr from './i18n/fr';

import Home from './components/home';
import NotFound from './components/NotFound';
import { Component } from 'react';

const ENV_SETTINGS = require('./env')();

function AppRoutes(props) {
  console.log(props);
  return (
    <Switch>
      <Route exact path={ENV_SETTINGS.path} render={() => <Home parentLanguageUpdateCallback={props.languageUpdateCallback} />} title="VideoCutTool" />
      <Route path={ENV_SETTINGS.not_found_path} component={NotFound} />
    </Switch>
  );
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      locale: localStorage.getItem('locale') || 'en-US',
    };
  }

  languageUpdateCallback(locale) {
    localStorage.setItem('locale', locale);
    this.setState({locale});
  }

  render() {
    return (
      <React.Fragment>
        <IntlProvider locale={this.state.locale} messages={{de, en, fr}}>
          <BrowserRouter>
            <AppRoutes languageUpdateCallback={this.languageUpdateCallback.bind(this)} />
          </BrowserRouter>
        </IntlProvider>
      </React.Fragment>
    );
  }
}

export default App;
