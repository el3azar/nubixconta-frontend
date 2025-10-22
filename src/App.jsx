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

  // 1. Definimos los catálogos aquí, en el componente padre
  // (Por ahora usamos datos quemados, luego puedes cargarlos desde una API aquí)
  const [catalogoCuentas, setCatalogoCuentas] = useState([
    { value: 102, label: '102.01 - Banco Principal (Mock)' },
    { value: 501, label: '501.01 - Gastos Varios (Mock)' }
  ]);
  const [tiposTransaccion, setTiposTransaccion] = useState([
    { value: 'ENTRADA', label: 'Entrada' },
    { value: 'SALIDA', label: 'Salida' }
  ]);

  return (
    <>
      {/* 2. Pasamos los catálogos como props al componente Rutas */}
      <Rutas 
        catalogoCuentas={catalogoCuentas}
        tiposTransaccion={tiposTransaccion}
      />
    </>
  )
}

export default App