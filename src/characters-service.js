const CharactersService = {

    getProjectCharacters(knex, project_id, uid, episode_id) {
        console.log('get proj Characters running')
        console.log(`user_id in getProjectCharacters ${uid}`)
        
        return knex.select('id', 'project_name', 'project_id', 'name', 'age', 'gender', 'details').from('characters').where({project_id: project_id, uid: uid})
        
    },

    getSharedCharacters(knex, uid, project_id, episode_id) {    
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

    async shareCharacters (knex, uid, project_id, sharedUID, title) {
        console.log(`shareCharacters running: uid: ${uid}, project_id: ${project_id}, title: ${title}, title type: ${typeof title}, sharedUID: ${sharedUID}`)
        let result = await knex.select('shared').from('characters').where({project_id: project_id, uid: uid})
        console.log(`shareCharacters running shared: ${JSON.stringify(result)}`)
        let prevSharedUID = result[0].shared[0]
        console.log(`preveSharedUID: ${prevSharedUID}, sharedUID: ${sharedUID}`)
        if(prevSharedUID !== sharedUID && title !== 'null' ) {
            console.log(`prevShared !== sharedUID first condition title: ${title} type: ${typeof title}`)
            
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
        
    },

    getAllShared(knex, project_id, episode_id) {
        console.log(`characters getAllShared projectID: ${project_id} episode_id: ${episode_id} typeof episode_id: ${typeof episode_id}`)
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

