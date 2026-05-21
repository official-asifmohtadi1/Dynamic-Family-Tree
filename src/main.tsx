import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log(
  `Developer's Credit:\n%cAsif Mohtadi Ahmed%c\nWeb Developer\n\nContact:\nPhone: +880 168 7186854\nEmail: asifmohtadi1@gamil.com\nLinkedin: https://www.linkedin.com/in/asifmohtadi1\nWebsite: https://www.asifmohtadi.vercel.app`,
  'font-weight: bold; color: #00008B; font-size: 1.15em;',
  'font-weight: normal; color: inherit;'
);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
