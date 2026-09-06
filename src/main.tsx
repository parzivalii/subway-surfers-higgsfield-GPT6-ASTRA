import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/outfit/latin-400.css';
import '@fontsource/outfit/latin-600.css';
import '@fontsource/outfit/latin-800.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-600.css';
import App from './ui/App';
import './ui/styles.css';

class ErrorBoundary extends React.Component<{children:React.ReactNode},{error:string}>{
  state={error:''};
  static getDerivedStateFromError(error:Error){return{error:error.message};}
  render(){return this.state.error?<main className="fatal"><h1>A signal went red.</h1><p>The game could not start: {this.state.error}</p><p>Your local save is kept. Try a browser with WebGL 2 enabled.</p><button onClick={()=>location.reload()}>Reload game</button></main>:this.props.children;}
}
createRoot(document.getElementById('root')!).render(<ErrorBoundary><App/></ErrorBoundary>);
