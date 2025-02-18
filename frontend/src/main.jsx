import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';  // Use createRoot instead of ReactDOM
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { Provider } from "react-redux";
import store from "../redux/store.js";
import App from './App.jsx';

const rootElement = document.getElementById('root'); // Get root element
const root = createRoot(rootElement); // Create root with createRoot

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <StrictMode>
        <App />
      </StrictMode>
    </BrowserRouter>
  </Provider>
);
