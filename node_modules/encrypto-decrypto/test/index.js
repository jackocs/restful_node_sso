const assert = require('assert')
const encrypto_decrypto = require('../lib/index')

describe('encryption test', () => {
  it('should encrypt a string', done => {
    const encryptoDecrypto = new encrypto_decrypto({
      key: 'someReallyLongStringToUseAsAKey!',
      iv: 'nonceString4Key!'
    })
    const encStr = encryptoDecrypto.encrypt('Hello World!')
    assert(encStr === '65f1702da3ac2e2d28e4a972d3b955a4')
    done()
  })
})

describe('decryption test', () => {
  it('should encrypt a string', done => {
    const encryptoDecrypto = new encrypto_decrypto({
      key: 'someReallyLongStringToUseAsAKey!',
      iv: 'nonceString4Key!'
    })
    const decrStr = encryptoDecrypto.decrypt('65f1702da3ac2e2d28e4a972d3b955a4')
    assert(decrStr === 'Hello World!')
    done()
  })
})
