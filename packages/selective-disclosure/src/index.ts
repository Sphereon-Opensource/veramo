/**
 * Provides a {@link @sphereon/selective-disclosure#ISelectiveDisclosure | plugin} for the {@link @sphereon/core#Agent}
 * that implements {@link @sphereon/selective-disclosure#SelectiveDisclosure} interface.
 *
 * Provides a {@link @sphereon/selective-disclosure#SdrMessageHandler | plugin} for the
 * {@link @sphereon/message-handler#MessageHandler} that detects Selective Disclosure Request in a message
 *
 * @packageDocumentation
 */
export { SdrMessageHandler, MessageTypes } from './message-handler'
export { SelectiveDisclosure } from './action-handler'
export * from './types'
const schema = require('../plugin.schema.json')
export { schema }
