import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom';
import App from '../components/App';

declare global {
	interface Window {
		assetManifest?: any;
	}
}

// const {{Page}} = React.lazy(() => import('../src/components/pages/{{Page}}'));

if (typeof window !== 'undefined') {
	hydrateRoot(document.getElementById('root'), <App assets={window.assetManifest}></App>);
}
