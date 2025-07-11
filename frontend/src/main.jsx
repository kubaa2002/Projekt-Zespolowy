import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/general.scss";
import AuthProvider from "./contexts/authProvider";
import PostsProvider from "./contexts/PostsContext";
import SearchProvider from "./contexts/SearchContext";
// Create a new router instance
const router = createRouter({ routeTree });

// Render the app
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(
  <StrictMode>
    <AuthProvider>
      <PostsProvider>
        <SearchProvider>
          <RouterProvider router={router} />
        </SearchProvider>
      </PostsProvider>
    </AuthProvider>
  </StrictMode>
);
