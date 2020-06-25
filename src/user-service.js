const  UserService = {
  getUsers(knex) {
	  //console.log('get users running')
    return knex.select('*').from('users')
  },

  addUser (knex, loggedInUser) {
    //console.log('loggedInUser in add user service', loggedInUser)
    return knex.insert(loggedInUser).into('users').returning('*')
        .then(rows => {
            return rows[0]
    })
  },

  verifyUserExists(knex, email) {
    //console.log(`verifyUserExists knex: ${knex}`)
    return knex('users').where({email: email})
  },

  deleteUser(knex, id) {
    return knex('users').where({id}).delete()
  },

  getMessageIconUrl(knex, sender_uid) {
    //console.log(`getMessageIconUrl service running sender_uid: ${sender_uid}`)
    //console.log(`select photo_url from users where uid = '${sender_uid}'`)
    //console.log(`knex: ${knex}`)
    return knex.select('photo_url').from('users').where({uid: sender_uid})
     
  }
}

module.exports = UserService;