import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { loadWorker } from './utils/loadWorker.ts'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
void loadWorker().then(worker => {
  worker.postMessage('hello')
  worker.onmessage = function (event) {
    console.log(event.data)
  }
  console.log(worker)
})
