import React, { Suspense, useEffect, useRef, useState } from 'react';
import { clearInterval } from 'timers';
import { ErrorBoundary } from 'react-error-boundary';

const wait: (number) => Promise<void> = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function wrapPromise(promise: Promise<any>) {
	let status = 'pending';
	let result;
	const id = Math.floor(Math.random() * 1000);
	const timeout = typeof window === 'undefined' ? 100 : 10000;

	const cancellable = new Promise((resolve, reject) => {
		const timeoutId = setTimeout(() => {
			if (status === 'pending') {
				console.error('Timeout?');
				status = 'timeout';
				reject('Timeout');
			}
		}, timeout);
		let suspender = promise.then(
			(r) => {
				status = 'success';
				result = r;
				clearTimeout(timeoutId);
				resolve(r);
			},
			(e) => {
				status = 'error';
				result = e;
				clearTimeout(timeoutId);
				reject(e);
			}
		);
	});
	return {
		read() {
			console.log('Reading', id, status, new Date().getTime());
			if (status === 'pending') {
				// throw suspender;
				throw cancellable;
			} else if (status === 'error') {
				throw result;
			} else if (status === 'success') {
				return result;
			} else if (status === 'timeout') {
				console.error('Timeout');
				throw new Error('Timeout');
			}
		},
	};
}
let waiting;
function fetch() {
	waiting = wrapPromise(
		wait(1000).then(() => {
			console.log('Done waiting', new Date().getTime());
			return new Date();
		})
	);
}
const List = ({ time }) => {
	// const [isReady, setIsReady] = useState(false);
	const call = new Date();
	// const waiting = useRef(wrapPromise(wait(1000).then(() => console.log('Done waiting', call))));
	// if (!waiting.current) {
	// waiting.current = wait(1000).then(() => setIsReady(true));
	// }
	// if (!isReady) {
	// 	throw waiting.current;
	// }

	// if (typeof window !== 'undefined') {
	const result = waiting.read();
	console.log('Result', result);
	// const _result = waiting.read();
	// }

	return (
		<ol>
			<li>Requested at: {result.toLocaleString()}</li>
			<li>Rendered at: {result.toLocaleString()}</li>
		</ol>
	);
};

const RefTest = ({ time }) => {
	const ref = useRef(
		(() => {
			return new Date();
		})()
	);
	console.log('Reftest render', time);

	return <div>{ref.current.toLocaleString()}</div>;
};

const Updater = () => {
	const [time, setTime] = useState(new Date());
	useEffect(() => {
		const i = setInterval(() => {
			console.log('Setting interval');
			setTime(new Date());
		}, 1000);
		return () => clearInterval(i);
	}, []);
	return (
		<div>
			{time.toLocaleString()}
			<RefTest time={time} />
		</div>
	);
};

const App = ({ assets = {} }) => {
	const [lastClick, setLastClick] = useState(new Date());
	console.log('Rendering app', new Date());
	fetch();
	return (
		<main id="root">
			<Suspense fallback={<div>App loading...</div>}>
				<h1>Hello</h1>
				{/* Not that ErrorBoundary doesn't seem to work on the server */}
				<ErrorBoundary fallback={<p>Could not fetch.</p>}>
					<Suspense fallback={<div>Loading...</div>}>
						<List time={new Date()} />
					</Suspense>
				</ErrorBoundary>
				{/* <Suspense fallback={<div>Loading...</div>}>
					<List time={new Date()} />
				</Suspense> */}
				<button
					onClick={() => {
						waiting = wrapPromise(wait(1000).then(() => console.log('Done waiting', new Date().getTime())));
						setLastClick(new Date());
					}}
				>
					Click me
				</button>
				{/* <Updater /> */}
			</Suspense>
		</main>
	);
};

export default App;
