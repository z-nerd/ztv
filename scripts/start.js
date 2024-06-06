import { execSync } from "child_process"
import { cpSync, existsSync } from "fs"

const cmd = (command, path = process.cwd()) =>
  execSync(command, {
    stdio: [0, 1, 2],
    cwd: path,
  })

if (!existsSync(`${process.cwd()}/dist`)) cmd("yarn build")

cpSync(`${process.cwd()}/dist/statics`, `${process.cwd()}/statics`, {
  recursive: true,
})

cmd("node dist/main.js")
