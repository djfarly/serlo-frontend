// need to install mysql lib
const mysql = require('mysql')
const Configuration = require('@ory/kratos-client').Configuration
const V0alpha2Api = require('@ory/kratos-client').V0alpha2Api

const kratos = new V0alpha2Api(
  new Configuration({
    basePath: 'http://localhost:4433',
  })
)

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'secret',
  database: 'serlo',
})

connection.connect(async (err) => {
  if (err) throw err
  connection.query('SELECT * FROM user', async (error, result) => {
    if (error) throw error
    await importUsers(result)
  })
})

async function importUsers(users) {
  for (const legacyUser of users) {
    const user = {
      traits: {
        username: legacyUser.username,
        email: legacyUser.email,
        description: legacyUser.description || '',
      },
      credentials: {
        password: {
          config: {
            password: legacyUser.password,
          },
        },
      },
      metadata_public: { legacy_id: legacyUser.id },
    }
    await kratos.adminCreateIdentity(user)
  }
}

kratos.adminListIdentities().then(({ data }) => console.log(data))
