import React from "react";
import { Route, Routes } from "react-router-dom";
import RootLayout from "./_root/RootLayout";
import { Gem, Home } from "./_root/pages";

const App = () => {
  return (
    <main className="flex bg-white overflow-hidden">
      <Routes location={location} key={location.key}>
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/recog" element={<Gem />} />
        </Route>
      </Routes>
    </main>
  );
};

export default App;
