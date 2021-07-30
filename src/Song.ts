import { AppConfig } from './config'
const {Spanner} = require('@google-cloud/spanner')

const spanner = new Spanner()
const instance = spanner.instance(AppConfig.spannerInstance)
const database = instance.database(AppConfig.spannerDb)
const songsTable = database.table('Songs')

export interface Song {
  uuid: string;
  name: string;
  artist: string;
}

export const save = (songs: Song[]) => {
    return songsTable.insert(songs)
}


export const getById = (sid: string): Song | null => {
  const qry = {
    sql: 'SELECT uuid, name, artist from Songs WHERE uuid = @uuid',
    params: {
      uuid: sid,
    }
  }
  return database.run(qry)
}
