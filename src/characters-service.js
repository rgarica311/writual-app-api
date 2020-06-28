const CharactersService = {

    getProjectCharacters(knex, project_id, uid) {
        console.log('get proj Characters running')
        console.log(`user_id in getProjectCharacters ${uid}`)
        return knex.select('id', 'project_name', 'project_id', 'name', 'age', 'gender', 'details').from('characters').where({project_id: project_id, uid: uid})
    },

    getSharedCharacters(knex, uid, project_id) {    
        console.log('shared characters service running uid:', uid)

        return knex.raw(`select id, name, age, gender, details from characters where project_id = '${project_id}' and '${uid}' = any (shared)`)
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

    shareCharacters(knex, uid, project_id, sharedUID) {
        console.log(`shareCharacters running: uid: ${uid}, project_id: ${project_id}, sharedUID: ${sharedUID}`)
        return knex.raw(`UPDATE characters 
                        SET shared = shared || '{${sharedUID}}' 
                        where project_id = '${project_id}' 
                        AND
                        uid = '${uid}'`)
    },

    getAllShared(knex, project_id) {
        return knex.raw(`with arrays as (
                         select shared, array_length(shared, 1) from characters where project_id = '${project_id}'
        )
        select shared from arrays order by array_length desc limit 1`)
    }

  


}

module.exports = CharactersService;

