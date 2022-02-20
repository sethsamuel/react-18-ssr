import React, { Suspense, useRef, useState } from 'react';

const wait: (number) => Promise<void> = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function wrapPromise(promise: Promise<any>) {
	let status = 'pending';
	let result;
	let suspender = promise.then(
		(r) => {
			status = 'success';
			result = r;
		},
		(e) => {
			status = 'error';
			result = e;
		}
	);
	return {
		read() {
			console.log('Reading', status);
			if (status === 'pending') {
				throw suspender;
			} else if (status === 'error') {
				throw result;
			} else if (status === 'success') {
				return result;
			}
		},
	};
}
// const waiting = wrapPromise(wait(1000).then(() => console.log('Done waiting')));
const List = () => {
	// const [isReady, setIsReady] = useState(false);
	const call = new Date();
	const waiting = useRef(wrapPromise(wait(1000).then(() => console.log('Done waiting', call))));
	// if (!waiting.current) {
	// waiting.current = wait(1000).then(() => setIsReady(true));
	// }
	// if (!isReady) {
	// 	throw waiting.current;
	// }

	// if (typeof window !== 'undefined') {
	const _result = waiting.current.read();
	// const _result = waiting.read();
	// }

	return (
		<ol>
			<li>Item 1</li>
		</ol>
	);
};

const App = ({ assets = {} }) => {
	return (
		<main id="root">
			<h1>Hello</h1>
			<Suspense fallback="Loading...">
				<List />
			</Suspense>
		</main>
	);
};

export default App;
