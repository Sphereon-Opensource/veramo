import { IIdentifier, IKey, IService, IAgentContext, IKeyManager, MinimalImportableKey, TKeyType } from '@veramo/core'
import { AbstractIdentifierProvider } from '@veramo/did-manager'

import Debug from 'debug'
const debug = Debug('veramo:web-did:identifier-provider')

type IContext = IAgentContext<IKeyManager>


export interface KeyOpts {
  kid?: string // Key ID to assign in case we are importing a key
  key?: MinimalImportableKey // Optional key to import. If not specified a key with random kid will be created
  type?: KeyType // The key type. Defaults to Secp256k1
}

export interface ICreateDidWebOpts {
  keyType?: TKeyType,
  x509?: X509Opts
}

export interface X509Opts {
  privateKeyPEM: string
  certificatePEM?: string
  x5u?: string // Certificate chain URL
  certificateChainPEM?: string // Base64 (not url!) encoded DER certificate chain as single string
}

/**
 * {@link @veramo/did-manager#DIDManager} identifier provider for `did:web` identifiers
 * @public
 */
export class WebDIDProvider extends AbstractIdentifierProvider {
  private readonly defaultKms: string

  constructor(options: { defaultKms: string }) {
    super()
    this.defaultKms = options.defaultKms
  }

  async createIdentifier(
    { kms, alias, options }: { kms?: string; alias?: string; options: ICreateDidWebOpts },
    context: IContext,
  ): Promise<Omit<IIdentifier, 'provider'>> {
    const keyType = options?.keyType || 'Secp256k1'

    const hostname = alias
    let key
    if (!options || !options.x509) {
      key = await context.agent.keyManagerCreate({
        kms: kms || this.defaultKms,
        type: keyType
      })
    } else {
      if (keyType !== 'RSA') {
        throw Error(`Only RSA key types are supported when using the x509 options. Supplied type: ${keyType}`)
      }
      const privateKeyHex = options.x509.privateKeyPEM // Yes we are aware that this is not hex. The import will take care of it as we cannot access any X509/PEM methods here
      key = await context.agent.keyManagerImport({kms: kms || this.defaultKms, type: keyType, privateKeyHex, meta: {x509: {...options.x509}}})

    }

    const identifier: Omit<IIdentifier, 'provider'> = {
      did: `did:web:${hostname}`,
      controllerKeyId: key.kid,
      keys: [key],
      services: [],
    }
    debug('Created', identifier.did)
    return identifier
  }

  async updateIdentifier(args: { did: string; kms?: string | undefined; alias?: string | undefined; options?: any }, context: IAgentContext<IKeyManager>): Promise<IIdentifier> {
    throw new Error('WebDIDProvider updateIdentifier not supported yet.')
  }

  async deleteIdentifier(identifier: IIdentifier, context: IContext): Promise<boolean> {
    for (const { kid } of identifier.keys) {
      await context.agent.keyManagerDelete({ kid })
    }
    return true
  }

  async addKey(
    { identifier, key, options }: { identifier: IIdentifier; key: IKey; options?: any },
    context: IContext,
  ): Promise<any> {
    return { success: true }
  }

  async addService(
    { identifier, service, options }: { identifier: IIdentifier; service: IService; options?: any },
    context: IContext,
  ): Promise<any> {
    return { success: true }
  }

  async removeKey(
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IContext,
  ): Promise<any> {
    return { success: true }
  }

  async removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IContext,
  ): Promise<any> {
    return { success: true }
  }
}
