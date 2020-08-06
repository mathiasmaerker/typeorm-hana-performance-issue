import 'reflect-metadata'
import * as xsenv from '@sap/xsenv'
import express from 'express'
import { HanaEnvironmentConfiguration, ConfigService } from './types/global'
import { SapConnectionOptions } from 'typeorm/driver/sap/SapConnectionOptions'
import { resolve as resolvePath } from 'path'
import { Connection, createConnection, InsertResult } from 'typeorm'
import { Country } from './entity/country'
import hana from '@sap/hana-client'
import { count } from 'console'

let connection: Connection
let nativeConnection

const hanaConnectionOptions = () => {
  const hdb: HanaEnvironmentConfiguration[] = xsenv.filterServices({ tag: 'hana' })
  const hdbLoginConfig: ConfigService[] = xsenv.filterServices({ name: process.env.CONFIG_SERVICE_NAME })
  if (!hdb || hdb.length === 0) {
    throw new Error("Can't find Hana Service Instance or binding..")
  }
  if (!hdbLoginConfig || hdbLoginConfig.length === 0) {
    throw new Error("Can't find User Provided Service..")
  }
  const credentials = hdb[0].credentials
  const loginConfig = hdbLoginConfig[0].credentials.databaseConnection
  const synchronize = process.env.DROP_AND_CREATE_DB === 'true' ? true : false

  let entities = `${__dirname}/entity/*.ts`
  entities = resolvePath(entities)

  const options: SapConnectionOptions = {
    name: 'sap',
    type: 'sap',
    host: credentials.host,
    port: parseInt(credentials.port),
    username: loginConfig.username,
    password: loginConfig.password,
    logging: 'all',
    synchronize,
    encrypt: true,
    extra: {
      sslValidateCertificate: true,
      sslTrustStore: credentials.certificate,
      sslCryptoProvider: 'openssl',
    },
    schema: loginConfig.schema.toUpperCase(),
    entities: [entities],
    pool: {
      min: 1,
      max: 5,
    },
  }
  return options
}

export const createNativeConnection = (): Promise<any> => {
  const hdb: HanaEnvironmentConfiguration[] = xsenv.filterServices({ tag: 'hana' })
  const hdbLoginConfig: ConfigService[] = xsenv.filterServices({ name: process.env.CONFIG_SERVICE_NAME })
  if (!hdb || hdb.length === 0) {
    throw new Error("Can't find Hana Service Instance or binding..")
  }
  if (!hdbLoginConfig || hdbLoginConfig.length === 0) {
    throw new Error("Can't find User Provided Service..")
  }
  const credentials = hdb[0].credentials
  const loginConfig = hdbLoginConfig[0].credentials.databaseConnection
  const options = {
    host: credentials.host,
    port: parseInt(credentials.port),
    uID: loginConfig.username,
    pwd: loginConfig.password,
    currentSchema: loginConfig.schema.toUpperCase(),
    encrypt: true,
    sslValidateCertificate: true,
    sslCryptoProvider: 'openssl',
    sslTrustStore: credentials.certificate,
  }

  return new Promise((resolve, reject) => {
    const connection = hana.createConnection()
    connection.connect(options, (err) => {
      if (err) return reject(`Native driver could not connect to Database, reason: ${err.message}`)
      return resolve(connection)
    })
  })
}

const application = express()

application.get('/api/insert/single', async (req, res) => {
  const countries = await connection.getRepository(Country).find()
  await connection.getRepository(Country).remove(countries)

  const runner = connection.createQueryRunner()
  const query = runner.manager.createQueryBuilder()

  const cnt = query.createQueryBuilder().insert().into(Country, ['id', 'alpha2', 'alpha3'])

  const executions: Promise<InsertResult>[] = []

  const startTime = Date.now()
  for (let index = 1; index < 100; index++) {
    executions.push(cnt.values({ id: index, alpha2: 'b2', alpha3: 'bl3' }).execute())
  }
  try {
    await Promise.all(executions)
  } catch (error) {
    console.log(error)

    res.status(500).send()
  }
  const endTime = Date.now()
  console.log(`Time elapsed Country insert: ${(endTime - startTime) / 1000}`)
  res.send()
})

const execAsync = (index: number) =>
  new Promise((resolve, reject) => {
    nativeConnection.exec(
      'INSERT INTO "TYPEORM_TEST"."p4c_country" VALUES(?,?,?)',
      [index, 'b2', 'bl3'],
      (err, ret) => {
        if (err) return reject(err)
        resolve()
      }
    )
  })

application.get('/api/insert/native', async (req, res) => {
  const countries = await connection.getRepository(Country).find()
  await connection.getRepository(Country).remove(countries)

  const startTime = Date.now()
  for (let index = 1; index < 100; index++) {
    await execAsync(index)
  }
  const endTime = Date.now()
  console.log(`Time elapsed Country insert: ${(endTime - startTime) / 1000}`)
  res.send()
})
;(async () => {
  xsenv.loadEnv()
  const connectionOptions = hanaConnectionOptions()

  try {
    connection = await createConnection(connectionOptions)
    nativeConnection = await createNativeConnection()
  } catch (error) {
    throw new Error(`Failed to connect to Database..${error.message}`)
  }
  application.listen(process.env.PORT || 3000, () => {
    console.log('Server started..')
  })
})()
