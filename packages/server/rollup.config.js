import { defineConfig } from "rollup"
// import resolve from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"
import dts from "rollup-plugin-dts"
import swc from "@z-code/vite-plugin-swc"
import assetsConfig from "./plugins/assets-config.js"
import terser from "@rollup/plugin-terser"
import { readdirSync } from "fs"
import { extname } from "path"

const INPUT = "src"
const OUTPUT = "dist"
const isDev = () => !!process.argv.find((a) => a === "--z-dev")
const files = readdirSync(INPUT)
  .filter((item) => extname(item) === ".ts")
  .map((item) => item.replace(".ts", ""))
if (files.length === 0) throw new Error(`No source found in ${INPUT}`)

const rollupConfig = []

files.map((item) => {
  rollupConfig.push(
    defineConfig({
      input: `${INPUT}/${item}.ts`,
      output: [
        {
          file: ["main", "index"].includes(item)
            ? `${OUTPUT}/${item}.js`
            : `${OUTPUT}/${item}/${item}.js`,
          format: "esm",
          sourcemap: isDev(),
        },
      ],
      plugins: [
        // resolve(),
        swc(),
        typescript({ tsconfig: "./tsconfig.json" }),
        !isDev()
          ? terser({
              keep_classnames: true,
              keep_fnames: true,
            })
          : null,
        assetsConfig(),
      ],
    }),
    defineConfig({
      input: `${INPUT}/${item}.ts`,
      output: [
        {
          file: ["main", "index"].includes(item)
            ? `${OUTPUT}/${item}.d.ts`
            : `${OUTPUT}/${item}/${item}.d.ts`,
          format: "esm",
        },
      ],
      plugins: [dts()],
    }),
  )
})

export default rollupConfig
