import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './app/App.tsx'
import { ErrorFallback } from './app/ErrorFallback.tsx'

import "./styles/tailwind.css"
import "./features/alchemy/styles/tokens.css"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
   </ErrorBoundary>
)
