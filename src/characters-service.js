const CharactersService = {

    getProjectCharacters(knex, project_id, uid, episode_id) {        
        return knex.select('id', 'project_name', 'project_id', 'name', 'age', 'gender', 'details').from('characters').where({project_id: project_id, uid: uid})
    },

    getSharedCharacters(knex, uid, project_id, episode_id) {    
        return knex.raw(`select id, name, age, gender, details from characters where project_id = '${project_id}' and '${uid}' = any (shared)`)
            .then(obj => {
                return obj.rows
            }) 
    },

    getSharedCharactersByEmail(knex, email) {
        return knex('characters').select('*').where({shared_with_email: email})
            .then(rows => {return rows[0]})
    },

    addCharacter(knex, newChar) {
        return knex.insert(newChar).into('characters').returning('*')
            .then(rows => {
            return rows[0]
        })
    },

    deleteCharacter(knex, id, uid) {
        return knex('characters').where({id: id, uid: uid}).delete()
    },

    async shareCharacters (knex, uid, project_id, sharedUID, title) {
        let result = await knex.select('shared').from('characters').where({project_id: project_id, uid: uid})
        if(result.length > 0) {
            let prevSharedUID = result[0].shared[0]
            if(prevSharedUID !== sharedUID && title !== 'null' ) {
                return knex.raw(`UPDATE characters 
                            SET shared = shared || '{${sharedUID}}' 
                            where project_id = '${project_id}' 
                            AND
                            project_name = '${title}'
                            AND
                            uid = '${uid}'`)
            } else {
                return knex.raw(`UPDATE characters 
                            SET shared = shared || '{${sharedUID}}' 
                            where project_id = '${project_id}' 
                            AND
                            uid = '${uid}'`)
            }
        }
        
        
    },

    addUid(knex, uid, email) {
        console.log(`debug sharing: CharactersService.addUid running`)
        return knex.raw(`update characters
                        SET shared = shared || '{${uid}}'
                        where 
                        shared_with_email = '${email}'
        `)
    },

    async shareCharactersByEmail (knex, uid, email, project_id, sharedUID, title) {
        let result = await knex.select('shared').from('characters').where({project_id: project_id, uid: uid})
        if(result.length > 0) {
            let prevSharedUID = result[0].shared[0]
            if(prevSharedUID !== sharedUID && title !== 'null' ) {
                return knex('characters').where({project_id: project_id, project_name: title, uid: uid}).update({shared_with_email: email})
                        
            } else {
                return knex('characters').where({project_id: project_id, uid: uid}).update({shared_with_email: email})
            }
        }
        
        
    },

    getAllShared(knex, project_id, episode_id) {
        if(episode_id !== null) {
            return knex.raw(`with arrays as (
                         select shared, array_length(shared, 1) from characters where episode_id = '${episode_id}'
            )
            select shared from arrays order by array_length desc limit 1`)
        } else {
            return knex.raw(`with arrays as (
                         select shared, array_length(shared, 1) from characters where project_id = '${project_id}'
            )
            select shared from arrays order by array_length desc limit 1`)
        }
        
    }

  


}

module.exports = CharactersService;

