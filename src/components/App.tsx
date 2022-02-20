import React, { Suspense, useEffect, useRef, useState } from 'react';
import { clearInterval } from 'timers';

const wait: (number) => Promise<void> = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function wrapPromise(promise: Promise<any>) {
	let status = 'pending';
	let result;
	const id = Math.floor(Math.random() * 1000);
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
			console.log('Reading', id, status, new Date().getTime());
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
let waiting = wrapPromise(wait(1000).then(() => console.log('Done waiting', new Date().getTime())));
const List = () => {
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
	const _result = waiting.read();
	// const _result = waiting.read();
	// }

	return (
		<ol>
			<li>Item 1</li>
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
	return (
		<main id="root">
			<h1>Hello</h1>
			<Suspense fallback={<div>Loading...</div>}>
				<List />
			</Suspense>
			<button
				onClick={() => {
					waiting = wrapPromise(wait(1000).then(() => console.log('Done waiting', new Date().getTime())));
					setLastClick(new Date());
				}}
			>
				Click me
			</button>
			{/* <Updater /> */}
		</main>
	);
};

export default App;
