import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { AppProvider } from './context';
import Home from './components/home';
import NotFound from './components/NotFound';

import 'bootstrap/dist/css/bootstrap.min.css';

const ENV_SETTINGS = require('./env')();

function App() {
	return (
		<AppProvider>
			<BrowserRouter>
				<Switch>
					<Route exact path={ENV_SETTINGS.path} render={() => <Home />} title="VideoCutTool" />
					<Route path={ENV_SETTINGS.not_found_path} component={NotFound} />
				</Switch>
			</BrowserRouter>
		</AppProvider>
	);
}

export default App;
