/**
 * Provides a {@link @sphereon/credential-ld#CredentialIssuerLD | plugin} for the {@link @sphereon/core#Agent} that implements
 * {@link @sphereon/credential-ld#ICredentialIssuerLD} interface.
 *
 * @packageDocumentation
 */
export {
  CredentialIssuerLD,
} from './action-handler'
export * from './types'
export { LdDefaultContexts } from './ld-default-contexts'
export {
  VeramoLdSignature,
} from './ld-suites'
export * from './suites/EcdsaSecp256k1RecoverySignature2020'
export * from './suites/Ed25519Signature2018'
const schema = require('../plugin.schema.json')
export { schema }
