import { Routes, Route,  } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Console from './pages/Console';
import Game from './pages/Game';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import ProtectedRoute from './utils/ProtectedLink';

function App() {

  return (
    <>
      {/* Toast Container */}
      <ToastContainer 
        position="top-center"
        autoClose={2000}
        theme="colored"
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/console" element={<ProtectedRoute>
          <Console />
        </ProtectedRoute>} />
        <Route path="/game" element={<ProtectedRoute>
          <Game />
        </ProtectedRoute>} />
      </Routes>
    </>
  )
}

export default App;
