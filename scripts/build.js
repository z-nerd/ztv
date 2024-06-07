import { execSync } from "child_process"
import { cpSync, rmSync } from "fs"

const cmd = (command, path = process.cwd()) =>
  execSync(command, {
    stdio: [0, 1, 2],
    cwd: path,
  })

cmd("yarn server:build")
cmd("yarn ui:build")

rmSync(`${process.cwd()}/dist`, {
  force: true,
  recursive: true,
})

cpSync(`${process.cwd()}/packages/server/dist`, `${process.cwd()}/dist`, {
  recursive: true,
})

cpSync(`${process.cwd()}/packages/ui/dist`, `${process.cwd()}/dist/statics`, {
  recursive: true,
})
