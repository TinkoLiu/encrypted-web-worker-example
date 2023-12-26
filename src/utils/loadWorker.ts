import ky from 'ky'

export async function loadWorker (): Promise<Worker> {
  if (import.meta.env.DEV) {
    console.log('In development mode, loading worker directly via import()')
    const WorkerModule = (await import('../worker/index?worker')).default
    const worker = new WorkerModule()
    return worker
  }

  console.log('Trying to fetch build mainfest')
  const fileMap = (await ky.get('/.vite/manifest.json').json<Record<string, { file: string }>>())
  if (!Object.prototype.hasOwnProperty.call(fileMap, 'src/worker/index.ts')) {
    throw new Error('no worker file in manifest')
  }
  const file = fileMap['src/worker/index.ts'].file

  console.log(`Worker file found at ${file}, fetching...`)
  const buffer = (await ky.get(file).arrayBuffer())

  const enc = new TextEncoder()
  // The key could be set by user manual input, select key file from disk or anyway you like
  const key = await window.crypto.subtle.importKey(
    'raw',
    // enc.encode('C12390999F0DF66CBD9911C86D335194'),
    enc.encode(''),
    'AES-CBC',
    false,
    ['encrypt', 'decrypt']
  )
  // Since iv is ok to be public, read from .env file and hardcode it here is just fine
  const iv = enc.encode(import.meta.env.VITE_WORKER_ENC_IV)

  console.log('Decrypting worker file...')
  const decryptedContent = await window.crypto.subtle.decrypt({
    name: 'AES-CBC',
    iv
  }, key, buffer)
  console.log('Decrypt succeed, file content: ', decryptedContent)
  console.log('Creating worker via blob url...')
  const blob = new Blob([decryptedContent], { type: 'application/javascript' })
  const url = URL.createObjectURL(blob)
  const worker = new Worker(url)
  return worker
}
