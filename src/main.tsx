import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
        <Toaster
            position="bottom-right"
            toastOptions={{
                style: {
                    borderRadius: '0px',
                    background: '#1a1a1a',
                    color: '#fff',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 'bold',
                },
            }}
        />
    </React.StrictMode>,
)
