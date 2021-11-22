/**
 * Provides a {@link @sphereon/key-manager#KeyManager | plugin} for the {@link @sphereon/core#Agent}
 * that implements {@link @sphereon/core#IKeyManager} interface
 *
 * @packageDocumentation
 */
export { KeyManager } from './key-manager'
export { AbstractKeyManagementSystem } from './abstract-key-management-system'
export { AbstractKeyStore } from './abstract-key-store'
export { AbstractPrivateKeyStore, ManagedPrivateKey } from './abstract-private-key-store'
export { AbstractSecretBox } from './abstract-secret-box'
export { MemoryKeyStore, MemoryPrivateKeyStore } from './memory-key-store'
