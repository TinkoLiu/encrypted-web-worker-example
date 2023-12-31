# Encrypted Web Worker Example

This is just a toy like example for demonstrating how to save & run a web worker file encrypted.

The thing should be pointed out is that this encryption is **NOT** meant to secure your runtime. It **only** protects the file from read by public or untrusted storage on random server, or transfer over the network. The file will be decrypted and executed in plain text in the browser, do remember this is not a code protection method when facing the public user.

## How it works?

When in development mode, the encryption is not working at all. The worker file is directly loaded by a dynamic import.

While on build script, there's a more step which will call `scripts/enc.ts` to encrypt the output worker file. And on production mode, the page will load the [build mainfest](https://vitejs.dev/config/build-options.html#build-manifest) which generated by `Vite` looking for the exact file path, and fetch it in plain file, then decrypt it and create a blob url for the worker.

## Run the example

You need to edit `src/utils/loadWorker.ts#L25-26` to set the key, since I commented it out for demosntrating it will not leak the key in the production build.

You can first run `pnpm build` to build a production copy, and run `pnpm preview` and `pnpm dev` at the same time to see the difference.

## How can it be used?

Just like a simple authentication method, you can protect your code from executed by random visitor, protect it from storage leak, and only tell the password to who you want to. I made this for protecting my own tool, which is a pure web frontend project and I would deploy it to GitHub Pages later, for no cost but with no authentication method (even HTTP BASIC). I think it's a good idea to share it with you so I made this example.