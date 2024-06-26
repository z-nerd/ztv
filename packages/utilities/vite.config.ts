import { defineConfig } from "vite"
import swc from "@z-code/vite-plugin-swc"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [
    swc(),
    dts({
      exclude: ["src/main.ts"],
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: "./src/lib/index.ts",
      name: "utilities",
      fileName: (format, name) => {
        if (format === "es") return `${name}.js`
        else return `${name}.${format}`
      },
      formats: ["cjs", "es"],
    },
  },
})
