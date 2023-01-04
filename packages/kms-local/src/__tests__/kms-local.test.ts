import { KeyManagementSystem } from '../key-management-system'
import { TKeyType } from '../../../core/src'
import { MemoryPrivateKeyStore } from '../../../key-manager/src'
import * as u8a from 'uint8arrays'

describe('@veramo/kms-local', () => {
  it('should compute a shared secret Ed+Ed', async () => {
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const myKey = {
      type: <TKeyType>'Ed25519',
      privateKeyHex:
        'ed3991fa33d4df22c88b78249e4d73c509c640a873a66808ad5dce774334ce94ee5072bc20355b4cd5499e04ee70853591bffa1874b1b5467dedd648d5b89ecb',
    }
    const theirKey = {
      type: <TKeyType>'Ed25519',
      publicKeyHex: 'e1d1dc2afe59bb054c44ba23ba07561d15ba83f9d1c42568ac11351fbdfd87c6',
    }
    const myKeyRef = await kms.importKey(myKey)
    const secret = await kms.sharedSecret({ myKeyRef, theirKey })
    expect(secret).toEqual('2f1d171ad32fdbd10d1b06600d70223f7298809d4a3690fa03d6b4688c7b116a')
  })

  it('should compute a shared secret Ed+X', async () => {
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const myKey = {
      type: <TKeyType>'Ed25519',
      privateKeyHex:
        'ed3991fa33d4df22c88b78249e4d73c509c640a873a66808ad5dce774334ce94ee5072bc20355b4cd5499e04ee70853591bffa1874b1b5467dedd648d5b89ecb',
    }
    const theirKey = {
      type: <TKeyType>'X25519',
      publicKeyHex: '09c99ad2fdb13247d97f4343d05cc20930db0808697e89f8f3d111a40cb6ee35',
    }
    const myKeyRef = await kms.importKey(myKey)
    const secret = await kms.sharedSecret({ myKeyRef, theirKey })
    expect(secret).toEqual('2f1d171ad32fdbd10d1b06600d70223f7298809d4a3690fa03d6b4688c7b116a')
  })

  it('should compute a shared secret X+Ed', async () => {
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const myKey = {
      type: <TKeyType>'X25519',
      privateKeyHex: '704380837434dde8a41bebcb75494578bf243fa19cd59e120a1de84e0815c84d',
    }

    const theirKey = {
      type: <TKeyType>'Ed25519',
      publicKeyHex: 'e1d1dc2afe59bb054c44ba23ba07561d15ba83f9d1c42568ac11351fbdfd87c6',
    }
    const myKeyRef = await kms.importKey(myKey)
    const secret = await kms.sharedSecret({ myKeyRef, theirKey })
    expect(secret).toEqual('2f1d171ad32fdbd10d1b06600d70223f7298809d4a3690fa03d6b4688c7b116a')
  })

  it('should compute a shared secret X+X', async () => {
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const myKey = {
      type: <TKeyType>'X25519',
      privateKeyHex: '704380837434dde8a41bebcb75494578bf243fa19cd59e120a1de84e0815c84d',
    }

    const theirKey = {
      type: <TKeyType>'X25519',
      publicKeyHex: '09c99ad2fdb13247d97f4343d05cc20930db0808697e89f8f3d111a40cb6ee35',
    }
    const myKeyRef = await kms.importKey(myKey)
    const secret = await kms.sharedSecret({ myKeyRef, theirKey })
    expect(secret).toEqual('2f1d171ad32fdbd10d1b06600d70223f7298809d4a3690fa03d6b4688c7b116a')
  })

  it('should throw on invalid myKey type', async () => {
    expect.assertions(1)
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const myKey = {
      type: <TKeyType>'Secp256k1',
      privateKeyHex: '704380837434dde8a41bebcb75494578bf243fa19cd59e120a1de84e0815c84d',
    }

    const theirKey = {
      type: <TKeyType>'X25519',
      publicKeyHex: '09c99ad2fdb13247d97f4343d05cc20930db0808697e89f8f3d111a40cb6ee35',
    }
    const myKeyRef = await kms.importKey(myKey)
    expect(kms.sharedSecret({ myKeyRef, theirKey })).rejects.toThrow('not_supported')
  })

  it('should throw on invalid theirKey type', async () => {
    expect.assertions(1)
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const myKey = {
      type: <TKeyType>'X25519',
      privateKeyHex: '704380837434dde8a41bebcb75494578bf243fa19cd59e120a1de84e0815c84d',
    }
    const myKeyRef = await kms.importKey(myKey)
    const theirKey = {
      type: <TKeyType>'Secp256k1',
      publicKeyHex: '09c99ad2fdb13247d97f4343d05cc20930db0808697e89f8f3d111a40cb6ee35',
    }

    expect(kms.sharedSecret({ myKeyRef, theirKey })).rejects.toThrow('not_supported')
  })
})

describe('@veramo/kms-local Secp256r1 support', () => {
  it('should generate a managed key', async () => {
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const key = await kms.createKey({ type: 'Secp256r1' })
    expect(key.type).toEqual('Secp256r1')
    expect(key.publicKeyHex).toHaveLength(64)
    expect(key.kid).toBeDefined()
    expect(key.meta).toEqual({
      'algorithms': [
        'ES256',
      ],
    })
  })

  it('should import a private key', async () => {
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const privateKeyHex = '96fe4d2b4a5d3abc4679fe39aa5d4b76990ff416e6ff403a58bd722cf8352f94'
    const key = await kms.importKey({ kid: 'test', privateKeyHex, type: 'Secp256r1' })
    expect(key.type).toEqual('Secp256r1')
    expect(key.publicKeyHex).toEqual('930fc234a12c939ccb1591a7c394088a30a32e81ac832ed8a0136e32bd73f792')
    expect(key.kid).toEqual('test')
    expect(key.meta).toEqual({
      'algorithms': [
        'ES256',
      ],
    })
  })

  it('should sign input data', async () => {
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const privateKeyHex = '96fe4d2b4a5d3abc4679fe39aa5d4b76990ff416e6ff403a58bd722cf8352f94'
    const data = u8a.fromString('test', 'utf-8')

    const key = await kms.importKey({ kid: 'test', privateKeyHex, type: 'Secp256r1' })
    const signature = await kms.sign({ keyRef: key, data, algorithm: 'ES256' })
    expect(signature).toEqual('tTHhkwVSNk-C84zHS_ObzpyMNVoFopwUkR_pKxSC4kPyEIZrB5L36AFWHQQhp827D9aUSMKi38yiCrSfI4h7VA')
  })
})


describe('@veramo/kms-local x509 support', () => {
  it('should generate a managed key', async () => {
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const key = await kms.createKey({ type: 'RSA' })
    expect(key.type).toEqual('RSA')
    expect(key.publicKeyHex.length).toBeGreaterThan(320)
    expect(key.kid).toBeDefined()
    expect(key.meta?.algorithms).toEqual(
      [
        'RS256',
        'RS512',
      ],
    )
    expect(key.meta?.publicKeyPEM).toBeDefined()
    await expect(key.meta?.publicKeyJwk).toMatchObject({
      'kty': 'RSA',
      'e': 'AQAB',
    })
  })

  it('should import a private key', async () => {
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const privateKeyHex = '3082025b020100028181008f46d01b91eeb6fe7933b5426d82d08e725ebadfeb5b9897504c4e6d589a0f9dba88092343391ea05849f46f11d2f956c46824445ab2b8b019d9e54a3497dac562252ce57f2e698773ff12e6f930bebe1a2e0465bbaca5a3b5ed4775a013f472e5b49ab2987c5413143c4d414be07ce63a0b0e93a8de138bd46c340368cf305f0203010001028180712a896d7d52838f73c3f7c3442432fe902f6a833aaeda5389c4fb9d3a82551b4c1deeb9bf7afa49c3f285f2c4ad52ebc9ae4817055c6cac0b7f23affce2849473bb27a112362965bb4630258de3fe35a5ed8bed26ef79e5d0e0a01b925b8f2043c53b1d621a633ab027f32bf04227bdd3fbb518bfd87d559213b60c77d16b81024100f33a2ea9e6563ab67cf618a3fe4e8798dce66cd530dc4d1cb91c9a208a66898ed2b132471731ce82e0975320d99ccd150e0201af6fcb6ad01a400bdd1783cdaf02410096ccf2803b569cb4cfcebdf28424d74b0ad1cce23f75f5138b9c26987855c17a5d3f82ea3e2bee99d1a184bd89e9d627a410c2916403800d18083b6081d9a451024017ee318925d076165e5518378a5dcf998aa26132d88bd44a6f2c113e025ff448c91206105887ddf9a27f40fe8a6a9302ef4de33c8f9343ff15961794b92b8ea10240412f5c4fd3d68fac94fb701e29c2e711781ed26aa635edf741ed00bdfd9e4c2101b7d7763be3afa2ebfbdeae33b451af16fb6baf7f45081020e8460a6476d8d10240640511541bf370d6d1b3723d49ea6e7193eea225f1c8400c6e50efb75bda9a56f3569b6abd031eaa9c037d4aa934c97888c2c93eca6fc640525dd3d50d087897'
    const key = await kms.importKey({ kid: 'test', privateKeyHex, type: 'RSA' })
    expect(key.type).toEqual('RSA')
    expect(key.publicKeyHex).toEqual('30819f300d06092a864886f70d010101050003818d00308189028181008f46d01b91eeb6fe7933b5426d82d08e725ebadfeb5b9897504c4e6d589a0f9dba88092343391ea05849f46f11d2f956c46824445ab2b8b019d9e54a3497dac562252ce57f2e698773ff12e6f930bebe1a2e0465bbaca5a3b5ed4775a013f472e5b49ab2987c5413143c4d414be07ce63a0b0e93a8de138bd46c340368cf305f0203010001')
    expect(key.kid).toEqual('test')
    expect(key.meta?.algorithms).toEqual(
      [
        'RS256',
        'RS512'
      ],
    )

    expect(key.meta?.publicKeyPEM).toBeDefined()
    await expect(key.meta?.publicKeyJwk).toMatchObject({
      'kty': 'RSA',
      'e': 'AQAB',
    })
  })

  it('should sign input data', async () => {
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const privateKeyHex = '3082025b020100028181008f46d01b91eeb6fe7933b5426d82d08e725ebadfeb5b9897504c4e6d589a0f9dba88092343391ea05849f46f11d2f956c46824445ab2b8b019d9e54a3497dac562252ce57f2e698773ff12e6f930bebe1a2e0465bbaca5a3b5ed4775a013f472e5b49ab2987c5413143c4d414be07ce63a0b0e93a8de138bd46c340368cf305f0203010001028180712a896d7d52838f73c3f7c3442432fe902f6a833aaeda5389c4fb9d3a82551b4c1deeb9bf7afa49c3f285f2c4ad52ebc9ae4817055c6cac0b7f23affce2849473bb27a112362965bb4630258de3fe35a5ed8bed26ef79e5d0e0a01b925b8f2043c53b1d621a633ab027f32bf04227bdd3fbb518bfd87d559213b60c77d16b81024100f33a2ea9e6563ab67cf618a3fe4e8798dce66cd530dc4d1cb91c9a208a66898ed2b132471731ce82e0975320d99ccd150e0201af6fcb6ad01a400bdd1783cdaf02410096ccf2803b569cb4cfcebdf28424d74b0ad1cce23f75f5138b9c26987855c17a5d3f82ea3e2bee99d1a184bd89e9d627a410c2916403800d18083b6081d9a451024017ee318925d076165e5518378a5dcf998aa26132d88bd44a6f2c113e025ff448c91206105887ddf9a27f40fe8a6a9302ef4de33c8f9343ff15961794b92b8ea10240412f5c4fd3d68fac94fb701e29c2e711781ed26aa635edf741ed00bdfd9e4c2101b7d7763be3afa2ebfbdeae33b451af16fb6baf7f45081020e8460a6476d8d10240640511541bf370d6d1b3723d49ea6e7193eea225f1c8400c6e50efb75bda9a56f3569b6abd031eaa9c037d4aa934c97888c2c93eca6fc640525dd3d50d087897'
    const data = u8a.fromString('test', 'utf-8')

    const key = await kms.importKey({ kid: 'test', privateKeyHex, type: 'RSA' })
    const signature = await kms.sign({ keyRef: key, data, algorithm: 'RS256' })
    expect(signature).toEqual('RJfBIpGscKKrWNNVau5zNWwQHOKCOWnh5f1VH7H7rwJcwrroHBpqNnf1EqA51nzpSlzynsQ69BLQkcUX3Yq2VeRPUVazOWAJ/xa9EIRcbpIjxi33zH/DjDdOQnre8WB1KNCg/Nkql5KjCmwGRTjCqBDRkNXPmfRoUoG3XKTSSW4=')
  })
})
