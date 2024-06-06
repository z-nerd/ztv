import { defineConfig } from "vite"
import swc from "@z-code/vite-plugin-swc"

export default defineConfig({
  plugins: [swc()],
})
