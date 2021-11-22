/**
 * Provides a {@link @sphereon/did-discovery#IDIDDiscovery | plugin} for the {@link @sphereon/core#Agent}
 *
 * @packageDocumentation
 */
export { DIDDiscovery } from './action-handler'
export { AbstractDidDiscoveryProvider } from './abstract-did-discovery-provider'
export * from './types'
const schema = require('../plugin.schema.json')
export { schema }
