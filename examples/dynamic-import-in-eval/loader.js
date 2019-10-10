import { pathToFileURL } from 'url'
import Module from 'module'
import https from 'https'
import process from 'process'
import { promisify } from 'util'

https.get[promisify.custom] = (options) => {
  return new Promise((resolve, reject) => {
    https.get(options, (response) => {
      const { statusCode } = response

      if (statusCode !== 200) {
        reject(new Error(`Request Failed. Status code: ${statusCode}`))
        return
      }
    
      let raw = ''

      response
        .setEncoding('utf8')
        .on('data', (chunk) => { raw += chunk })
        .on('end', () => { resolve(raw) })
    }).on('error', reject)
  })
}

const baseURL = pathToFileURL(process.cwd()).href
const { builtinModules } = Module
const get = promisify(https.get)
const dataToFileURLMap = new Map

export async function resolve(specifier, parentModuleURL = baseURL, defaultResolver) {
  if (builtinModules.includes(specifier)) {
    return defaultResolver(specifier, parentModuleURL)
  }

  if (dataToFileURLMap.has(parentModuleURL)) {
    parentModuleURL = dataToFileURLMap.get(parentModuleURL)
  }

  try {
    const url = new URL(specifier, parentModuleURL)

    if (url.protocol === 'https:') {
      const body = await get(url)
      const dataURI = `data:'text/javascript';base64,${Buffer.from(body).toString('base64')}`

      dataToFileURLMap.set(dataURI, url.href)

      return {
        url: dataURI,
        format: 'module'
      }
    }
  } catch {}

  return defaultResolver(specifier, parentModuleURL)
}