import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '@fontsource-variable/mona-sans/wght.css';
import '@jetbrains/ring-ui-built/components/style.css';
import '@malverdesoftware/ui/base.css';
import '@malverdesoftware/ui/accent-green.css';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
