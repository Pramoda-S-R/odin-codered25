import React from "react";
import "./globals.css";
import RootLayout from "./_root/RootLayout";
import { Route, Routes } from "react-router-dom";
import Home from "./_root/pages/Home";

const App = () => {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Home />} />
      </Route>
    </Routes>
  );
};

export default App;
