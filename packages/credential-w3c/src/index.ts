/**
 * Provides a {@link @sphereon/credential-w3c#CredentialIssuer | plugin} for the {@link @sphereon/core#Agent} that implements
 * {@link @sphereon/credential-w3c#ICredentialIssuer} interface.
 *
 * Provides a {@link @sphereon/credential-w3c#W3cMessageHandler | plugin} for the
 * {@link @sphereon/message-handler#MessageHandler} that verifies Credentials and Presentations in a message.
 *
 * @packageDocumentation
 */
export { W3cMessageHandler, MessageTypes } from './message-handler'
export {
  CredentialIssuer,
  ICredentialIssuer,
  ICreateVerifiableCredentialArgs,
  ICreateVerifiablePresentationArgs,
  ProofFormat,
} from './action-handler'
const schema = require('../plugin.schema.json')
export { schema }
