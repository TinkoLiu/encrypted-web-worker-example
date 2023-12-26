import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const algorithm = 'aes-256-cbc'
const _dirname = path.dirname(fileURLToPath(import.meta.url))

if (!process.env.WORKER_ENC_KEY || !process.env.VITE_WORKER_ENC_IV) {
  console.log(process.env)
  console.error('Invalid project env')
  process.exit(1)
}

const encrypt = (buffer: Buffer): Buffer => {
  const cipher = crypto.createCipheriv(algorithm, process.env.WORKER_ENC_KEY, process.env.VITE_WORKER_ENC_IV)
  const result = Buffer.concat([cipher.update(buffer), cipher.final()])
  return result
}

const main = async (): Promise<void> => {
  // find the worker file in manifest
  const fileMap = await import(pathToFileURL(path.resolve(_dirname, '../dist/.vite/manifest.json')).toString())
  if (!Object.prototype.hasOwnProperty.call(fileMap.default, 'src/worker/index.ts')) {
    console.error('no worker file in manifest')
    process.exit(1)
  }
  // get the actual worker file path
  const file = path.join(_dirname, '../dist', fileMap.default['src/worker/index.ts'].file as string)
  if (!fs.existsSync(file)) {
    console.error('no worker file in dist')
    process.exit(1)
  }
  const buffer = fs.readFileSync(file)
  const encrypted = encrypt(buffer)
  fs.writeFileSync(file + '.enc', encrypted)
  // replace the original file with encrypted one
  fs.renameSync(file + '.enc', file)
}

void main()
