import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppProvider } from './context';
import Home from './components/home';
import NotFound from './components/NotFound';

import 'bootstrap/dist/css/bootstrap.min.css';

const ENV_SETTINGS = require('./env')();

function App() {
	return (
		<AppProvider>
			<BrowserRouter>
				<Routes>
					<Route exact path={ENV_SETTINGS.path} element={<Home />} title="VideoCutTool" />
					<Route path={ENV_SETTINGS.not_found_path} element={NotFound} />
				</Routes>
			</BrowserRouter>
		</AppProvider>
	);
}

export default App;
