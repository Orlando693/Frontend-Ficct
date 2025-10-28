import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import "./index.css"
import router from "./app/router"

if (import.meta.env.DEV) {
  import("./mock/devFetchMock");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
