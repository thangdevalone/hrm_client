import react from "@vitejs/plugin-react"
import { resolve } from "path"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  base:"/",
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }]
  },
})
