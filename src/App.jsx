import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Rutas from './routes/Rutas.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap-icons/font/bootstrap-icons.css';





function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <Rutas/>
    </>
  )
}

export default App
