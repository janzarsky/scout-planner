import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./components/App";
import { BrowserRouter, Route, Routes, useParams } from "react-router";
import { Provider, useDispatch, useSelector } from "react-redux";
import { getStore } from "./store";
import { setTable } from "./store/authSlice";
import { AuthProvider } from "./components/AuthProvider";
import { CommandProvider } from "./components/CommandContext";
import Homepage from "./components/Homepage";

function AppWrapper() {
  const dispatch = useDispatch();
  const { table } = useParams();
  const { table: storeTable } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(setTable(table));
  }, []);

  return storeTable ? (
    <AuthProvider>
      <CommandProvider>
        <App />
      </CommandProvider>
    </AuthProvider>
  ) : null;
}

const root = createRoot(document.getElementById("root"));
const store = getStore();

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" exact element={<Homepage />} />
        <Route path="/:table/*" element={<AppWrapper />} />
      </Routes>
    </BrowserRouter>
  </Provider>,
);
