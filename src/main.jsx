// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import './index.css'
import App from './App.jsx'
import { registerSW } from "virtual:pwa-register";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <App />
  </StrictMode>
)

// register service worker + notifikasi update
const updateSW = registerSW({
  onNeedRefresh() {
    // contoh UI sederhana: tanya user untuk reload
    if (confirm("Versi baru tersedia. Muat ulang sekarang?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("Aplikasi siap digunakan offline");
  },
});

/*
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/home">
      <Routes>
        <Route path="/*" element={<App/>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
 */

 
