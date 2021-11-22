import 'cross-fetch/polyfill'
import yaml from 'yaml'
import { IDataStore, IDIDManager, IMessageHandler, IKeyManager, IResolver, TAgent } from '@sphereon/core'
import { ICredentialIssuer } from '@sphereon/credential-w3c'
import { ISelectiveDisclosure } from '@sphereon/selective-disclosure'
import { IDIDComm } from '@sphereon/did-comm'
import { IDataStoreORM } from '@sphereon/data-store'
import { IDIDDiscovery } from '@sphereon/did-discovery'

const fs = require('fs')
import { createAgentFromConfig } from './lib/agentCreator'

export const getConfig = (fileName: string): any => {
  if (!fs.existsSync(fileName)) {
    console.log('Config file not found: ' + fileName)
    console.log('Use "veramo config create" to create one')
    process.exit(1)
  }

  const config = yaml.parse(fs.readFileSync(fileName).toString(), { prettyErrors: true })

  if (config?.version != 3) {
    console.log('Unsupported configuration file version:', config.version)
    process.exit(1)
  }
  return config
}

export type EnabledInterfaces = IDIDManager &
  IKeyManager &
  IDataStore &
  IDataStoreORM &
  IResolver &
  IMessageHandler &
  IDIDComm &
  ICredentialIssuer &
  ISelectiveDisclosure &
  IDIDDiscovery

export type ConfiguredAgent = TAgent<EnabledInterfaces>

export function getAgent(fileName: string) {
  try {
    return createAgentFromConfig<EnabledInterfaces>(getConfig(fileName))
  } catch (e: any) {
    console.log('Unable to create agent from ' + fileName + '.', e.message)
    process.exit(1)
  }
}
