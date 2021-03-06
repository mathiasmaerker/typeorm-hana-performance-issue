import 'jest-extended'

import { ReadStream } from 'fs'
import { Readable } from 'stream'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type NodeCache from 'node-cache'

/**
 * Representation of the user provided service in cloud foundry
 */
export interface ConfigService {
  credentials: {
    databaseConnection: DatabaseConnectionConfig
    sftp: SftpConfig
    destinations: {
      bizxDestination: string
    }
  }
}

/**
 * Information about the database
 */
export interface DatabaseConnectionConfig {
  /**
   * schema to use in UPPER CASE
   */
  schema: string
  /**
   * DB Username
   */
  username: string
  /**
   * DB password
   */
  password: string
}
/**
 * Configuration of the sftp connection
 */
export interface SftpConfig {
  sftpHost: string
  sftpPort: number
  username: string
  password: string
  subjectAreas: SftpPath
  instructors: SftpPath
  items: SftpPath
  trainings?: SftpPath
}

/**
 * Configuration of the sftp streams
 */
export interface SftpFileStreams {
  instructors: ReadStream | Readable
  labels: ReadStream | Readable
  items: ReadStream | Readable
  facilities: ReadStream | Readable
  trainings: ReadStream | Readable
}

export interface SftpPath {
  fileName: string
  folder: string
}

/**
 * Credetials of the hana binding in cloud foundry
 */
export interface HanaEnvironmentConfiguration {
  credentials: HanaCredentials
  name: string
}
export interface UserDetails {
  id: string
  firstName: string
  lastName: string
  displayName: string
  email: string
  phoneNumber: string
}

export interface HanaCredentials {
  certificate: string
  driver: string
  host: string
  port: string
  url: string
}

// Generated by https://quicktype.io

export interface UaaEnvironmentConfiguration {
  binding_name: null
  credentials: UaaCredentials
  instance_name: string
  label: string
  name: string
  plan: string
  provider: null
  syslog_drain_url: null
  tags: string[]
}

export interface UaaCredentials {
  apiurl: string
  clientid: string
  clientsecret: string
  identityzone: string
  identityzoneid: string
  sburl: string
  tenantid: string
  tenantmode: string
  uaadomain: string
  url: string
  verificationkey: string
  xsappname: string
}

declare global {
  interface Error {
    status?: number
  }
  namespace Express {
    interface User {
      id: string
      locale: string
      info: UserInformation
    }
    interface AuthInfo {
      // token: string
      // eslint-disable-next-line @typescript-eslint/ban-types
      getTokenInfo: () => { getTokenValue: Function }
    }

    interface Request {
      cache: NodeCache
    }
  }
}

export interface D<T> {
  d: T
}

export interface UserInformation {
  __metadata: Metadata
  userId: string
  defaultLocale: string
  defaultFullName: string
  empId: string
  location: string
  title: string
  personKeyNav: PersonKeyNav
}

export interface Metadata {
  uri: string
  type: string
}

export interface PersonKeyNav {
  __metadata: Metadata
  personIdExternal: string
}
