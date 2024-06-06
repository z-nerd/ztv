import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"

export const assetsConfig = () => {
  return {
    name: "assets-config",
    closeBundle: async () => {
      if (existsSync(`${process.cwd()}/statics`))
        cpSync(`${process.cwd()}/statics`, `${__dirname}/dist/statics`, {
          recursive: true,
        })
      else
        mkdirSync(`${process.cwd()}/dist/statics`, {
          recursive: true,
        })

      const { devDependencies, packageManager, ...packageJson } = JSON.parse(
        readFileSync(`${process.cwd()}/package.json`, "utf8"),
      )

      packageJson.scripts = { start: "node main.js" }
      writeFileSync(
        `${process.cwd()}/dist/package.json`,
        JSON.stringify(packageJson, null, 2),
      )
    },
  }
}

export default assetsConfig
