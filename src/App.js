import React from 'react';

import { BrowserRouter, Route, Switch } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { IntlProvider } from '@wikimedia/react.i18n'

import da from './i18n/da';
import de from './i18n/de';
import en from './i18n/en';
import es from './i18n/es.json';
import fi from './i18n/fi';
import fr from './i18n/fr';

import ko from './i18n/ko';
import kulatn from './i18n/ku-latn';
import lb from './i18n/lb';
import mk from './i18n/mk';
import ptbr from './i18n/pt-br';
import ru from './i18n/ru';
import sv from './i18n/sv';
import tr from './i18n/tr';
import zhhans from './i18n/zh-hans';
import zhhant from './i18n/zh-hant';

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
        <IntlProvider locale={this.state.locale} messages={{da, de, en, es, fi, fr, ko, kulatn, lb, mk, ptbr, ru, sv, tr, zhhans, zhhant}}>
          <BrowserRouter>
            <AppRoutes languageUpdateCallback={this.languageUpdateCallback.bind(this)} />
          </BrowserRouter>
        </IntlProvider>
      </React.Fragment>
    );
  }
}

export default App;
