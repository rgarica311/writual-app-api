const  UserService = {
  getUsers(knex) {
    return knex.select('*').from('users')
  },

  getUid(knex, email) {
    return knex.select('uid').from('users').where({email: email})
      .then(rows => {return rows[0]})
  },

  addUser (knex, loggedInUser) {
    return knex.insert(loggedInUser).into('users').returning('*')
        .then(rows => {
            return rows[0]
    })
  },

  verifyUserExists(knex, email) {
    return knex('users').where({email: email})
  },

  deleteUser(knex, id) {
    return knex('users').where({id}).delete()
  },

  getMessageIconUrl(knex, sender_uid) {
   
    return knex.select('photo_url').from('users').where({uid: sender_uid})
     
  },

  getDisplayName(knex, uid) {
    return knex.select('user_name').from('users').where({uid: uid})
      .then(rows => {return rows[0]})
  }
}

module.exports = UserService;