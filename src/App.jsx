import React from 'react'
import ReactDOM from "react-dom/client";
import Test from './Test'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function App(){
    return (
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Test />} />
        </Routes>
      </BrowserRouter>
    );
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
