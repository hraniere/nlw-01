import path from 'path'

module.exports = {
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, 'src', 'database', 'database.sqlite')
  },
  useNullAsDefault: true,
  pool: {
    afterCreate: function (conn: any, done: Function) {
      conn.run("PRAGMA foreign_keys = ON", done);
    }
  },
  migrations: {
    directory: path.resolve(__dirname, 'src', 'database', 'migrations')
  },
  seeds: {
    directory: path.resolve(__dirname, 'src', 'database', 'seeds')
  }
}