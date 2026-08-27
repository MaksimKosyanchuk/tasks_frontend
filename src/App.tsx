import { BrowserRouter, Route, Routes } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Workspace from "./pages/WorkSpace/WorkSpace";
import Project from "./pages/Project/Project";
import HomePage from "./pages/HomePage/HomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route element={<AppLayout />}>
          <Route path="/workspaces/:workspaceId" element={<Workspace />} />
          <Route path="/workspaces/" element={<Workspace />} />

          <Route
            path="/workspaces/:workspaceId/projects/:projectId"
            element={<Project />}
          />
        </Route>

        <Route path="*" element={<HomePage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
