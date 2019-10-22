import { builtinModules } from 'module'
import { extname } from 'path'
import https from 'https'

const JS_MEDIA_TYPE = 'text/javascript'
const dataToFileURLMap = new Map
const extToMediaTypeMap = new Map([
  ['.js', JS_MEDIA_TYPE],
  ['.json', 'application/json'],
  ['.mjs', JS_MEDIA_TYPE],
  ['.wasm', 'application/wasm']
])

const get = (options) => {
  return new Promise((resolve, reject) => {
    https
      .get(options, (response) => {
        const { statusCode } = response

        if (statusCode === 200) {
          const data = []

          response
            .on('data', (chunk) => { 
              data.push(chunk) 
            })
            .on('end', () => {
              const buffer = Buffer.concat(data)
              const { pathname } = typeof options === 'string'
                ? new URL(options)
                : options

              if (typeof pathname === 'string' &&
                  extname(pathname) === '.wasm') {
                resolve(buffer)
              } else {
                resolve(buffer.toString('utf8'))
              }
            })
        } else {
          reject(new Error(`Request failed. Status code: ${statusCode}`))
        }
      })
      .on('error', reject)
  })
}

export async function resolve(specifier, parentModuleURL, defaultResolver) {
  if (! builtinModules.includes(specifier)) {
    parentModuleURL = dataToFileURLMap.get(parentModuleURL) || parentModuleURL
    let rawSpecifier = specifier
    
    try {
      const url = new URL(specifier, parentModuleURL)

      if (url.protocol === 'https:') {
        const body = await get(url)
        const encoded = Buffer.from(body).toString('base64')
        const mediaType = extToMediaTypeMap.get(extname(url.pathname)) || JS_MEDIA_TYPE

        rawSpecifier = url.href 
        specifier = `data:${mediaType};base64,${encoded}`
        dataToFileURLMap.set(specifier, rawSpecifier)
      }
    } catch {
      const error = new Error(`Cannot find module ${rawSpecifier} imported from ${parentModuleURL}`)
      error.code = 'ERR_MODULE_NOT_FOUND'
      throw error
    }
  }

  return defaultResolver(specifier, parentModuleURL)
}
