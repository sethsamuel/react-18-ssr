import Hapi, { Request, ResponseObject } from '@hapi/hapi';
import path from 'path';
import inert from '@hapi/inert';
// import _ from 'lodash';
import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
// import { matchRoutes } from 'react-router-dom';
import { PassThrough } from 'stream';
// import { StaticRoutes } from '~/www/routes';
import App from './components/App';

export const render = (req: Request, h) => {
	return new Promise((resolve) => {
		const stream = new PassThrough();
		let response: ResponseObject = h.response(stream);
		let didError = false;
		// const page = req.path.split('/').pop();
		// const clientJs = _.upperFirst(_.isEmpty(page) ? 'index' : page);
		const { pipe, abort } = renderToPipeableStream(
			<html>
				<head></head>
				<body>
					<App assets={{ index: `/public/client.js` }} />
					<script type="module" src="/public/client.js"></script>
				</body>
			</html>,

			{
				onCompleteShell() {
					// If something errored before we started streaming, we set the error code appropriately.
					// const statusCode = matchRoutes(pageRoutes, req.path)?.[1]?.route.path !== '*' ? 200 : 404;
					const statusCode = 200;
					response.code(didError ? 500 : statusCode);
					response.type('text/html');
					resolve(response);
					stream.write('<!DOCTYPE html>');
					pipe(stream);
				},
				onError(error) {
					didError = true;
					// req.logger.error(error);
					console.error(error);
				},
			}
		);
	});
};

const init = async () => {
	const server = Hapi.server({
		port: 1234,
		host: 'localhost',
	});

	await server.register(inert);

	server.route({
		method: 'GET',
		path: '/',
		handler: async (req, h) => {
			return await render(req, h);
		},
	});

	server.route({
		method: 'GET',
		path: '/public/{param*}',
		handler: {
			directory: { path: path.join(process.cwd(), 'dist', 'src', 'public'), showHidden: true, redirectToSlash: false },
		},
	});

	await server.start();
	console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
	console.log(err);
	process.exit(1);
});

init();
