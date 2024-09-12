import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Data from './Data.tsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Data />
  </StrictMode>,
)
