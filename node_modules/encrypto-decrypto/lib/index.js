let crypto
try {
  crypto = require('crypto')
} catch (err) {
  throw new Error('Crypto support is disabled!')
}

class encryptDecrypt {
  constructor (options = {}) {
    options = this.__validateOptions(options)
    Object.assign(this, {
      algorithm: 'aes-256-cbc',
      inputEncoding: 'utf8',
      outputEncoding: 'hex'
    }, options)
  }

  __validateOptions (options) {
    const algEnums = ['aes-128-cbc', 'aes-192-cbc', 'aes-256-cbc', 'aes-128-ctr', 'aes-192-ctr', 'aes-256-ctr']
    const inputEncodingEnums = ['utf8', 'ascii', 'latin1']
    const outputEncodingEnums = ['hex', 'base64', 'latin1']
    if (!options.key || !options.iv) throw new Error('Configuration error.  Please check key and iv.')
    if (options.key && options.key.length !== 32) throw new Error('Key length must be 32 characters')
    if (options.iv && options.iv.length !== 16) throw new Error('Key iv length must be 16 characters')
    if (options.algorithm && !algEnums.includes(options.algorithm)) throw new Error('Algorithm not supported.')
    if (options.inputEncoding && !inputEncodingEnums.includes(options.inputEncoding)) throw new Error('Input encoding not supported.')
    if (options.outputEncoding && !outputEncodingEnums.includes(options.outputEncoding)) throw new Error('Output encoding not supported.')
    return options
  }

  encrypt (source) {
    let { key, iv, algorithm, inputEncoding, outputEncoding } = this
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key.toString()), iv)
    let encrStr = cipher.update(source, inputEncoding, outputEncoding)
    try {
      encrStr += cipher.final(outputEncoding)
      return encrStr
    } catch (err) {
      console.log(err)
      throw new Error('Bad encryption. Check configuration and try again.')
    }
  }

  decrypt (source) {
    const { key, iv, algorithm, inputEncoding, outputEncoding } = this
    const cipher = crypto.createDecipheriv(algorithm, Buffer.from(key.toString()), iv)
    let decrStr = cipher.update(source, outputEncoding, inputEncoding)
    try {
      decrStr += cipher.final(inputEncoding)
      return decrStr
    } catch (err) {
      console.log(err)
      throw new Error('Bad decription. Check configuration and try again.')
    }
  }
}

module.exports = encryptDecrypt
