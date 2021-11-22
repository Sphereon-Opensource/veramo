/**
 * Provides a {@link @sphereon/did-comm#DIDComm | plugin} for the {@link @sphereon/core#Agent} that implements
 * {@link @sphereon/did-comm#IDIDComm} interface.  Provides a {@link @sphereon/did-comm#DIDCommMessageHandler | plugin}
 * for the {@link @sphereon/message-handler#MessageHandler} that decrypts messages.
 *
 * @packageDocumentation
 */

export {
  DIDComm,
  ISendMessageDIDCommAlpha1Args,
  IPackDIDCommMessageArgs,
  IUnpackDIDCommMessageArgs,
} from './didcomm'
export * from './types/message-types'
export * from './types/utility-types'
export * from './types/IDIDComm'
export { DIDCommMessageHandler } from './message-handler'
export * from './transports/transports'
/**
 * @beta
 */
const schema = require('../plugin.schema.json')
export { schema }
