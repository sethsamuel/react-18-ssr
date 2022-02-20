import React from "react";
import { createRoot, hydrateRoot } from "react-dom";
import App from "../components/App";
// import { BrowserRoutes } from './routes';

window.fetch = window.fetch.bind(window);

//@ts-ignore
if (module.hot) {
  //@ts-ignore
  module.hot.accept();
}

const root = createRoot(document.getElementById("root"));
// hydrateRoot(root, <App />);
root.render(<App></App>, document);
