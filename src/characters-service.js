const CharactersService = {

    getProjectCharacters(knex, proj, uid) {
        console.log('get proj Characters running')
        console.log('proj in getPorjectCharacters', proj.replace(/"/g, "'"))
        console.log(`user_id in getProjectCharacters ${uid}`)
        return knex.select('id', 'name', 'age', 'gender', 'details').from('characters').where({project_name: proj.replace(/"/g, "'"), uid: uid})
    },

    getSharedCharacters(knex, uid, proj) {
        console.log('shared characters service running uid:', uid)
        console.log('shared characters service running proj:', proj)

        return knex.raw(`select id, name, age, gender, details from characters where project_name = '${proj}' and '${uid}' = any (shared)`)
            .then(obj => {
                return obj.rows
            })
    },

    addCharacter(knex, newChar) {
        console.log('newChar in add char service', newChar)
        return knex.insert(newChar).into('characters').returning('*')
            .then(rows => {
            return rows[0]
        })
    },

    deleteCharacter(knex, id, uid) {
        return knex('characters').where({id: id, uid: uid}).delete()
    },

    shareCharacters(knex, uid, projectName, sharedUID) {
        console.log(`shareCharacters running: uid: ${uid}, projectName: ${projectName}, sharedUID: ${sharedUID}`)
        return knex.raw(`UPDATE characters 
                        SET shared = shared || '{${sharedUID}}' 
                        where project_name = '${projectName}' 
                        AND
                        uid = '${uid}'`)
  },

  


}

module.exports = CharactersService;

