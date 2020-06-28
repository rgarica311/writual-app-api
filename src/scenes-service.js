const ScenesService = {
    
    getProjectScenes(knex, project_id, uid){
        console.log(`scenes service params proj:${project_id} uid:${uid}`)
        return knex.select('id', 'uid', 'project_name', 'project_id', 'act', 'step_name', 'scene_heading', 'thesis', 'antithesis', 'synthesis').from('scenes').where({project_id: project_id, uid: uid})
    },

    getSharedScenes(knex, uid, project_id) {
        console.log('shared scenes service running uid:', uid)
        console.log(`shared scenes service running project_id: ${project_id}`)
        return knex.raw(`select id, uid, project_name, project_id, act, step_name, scene_heading, thesis, antithesis, synthesis from scenes 
                        where project_id = '${project_id}' 
                        and '${uid}' = any (shared)`)
            .then(obj => {
                return obj.rows
            })
    },

    addScene(knex, newScene) {
        return knex.insert(newScene).into('scenes').returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    deleteScene(knex, id, uid) {
        console.log(`delete running id ${id}, uid ${uid}`)
        return knex('scenes').where({id: id, uid: uid}).delete()
    },

    shareScenes(knex, uid, project_id, sharedUID) {
        console.log(`shareScenes running: uid: ${uid}, project_id: ${project_id}, sharedUID: ${sharedUID}`)
        return knex.raw(`UPDATE scenes 
                        SET shared = shared || '{${sharedUID}}' 
                        where project_id = '${project_id}' 
                        AND
                        uid = '${uid}'`)
    },

    searchScenes(knex, uid, project_id, currentAct, currentStep, searchTerm) {
        return knex.raw(`select id, uid, project_name, act, step_name, scene_heading, thesis, antithesis, synthesis from scenes
                            where uid = '${uid}'
                            and
                            project_id = '${project_id}'
                            and
                            act = '${currentAct}'
                            and 
                            step_name = '${currentStep}'
                            and 
                            scene_heading ILIKE '%${searchTerm}%'
                            or 
                            thesis ilike '%${searchTerm}%'
                            or 
                            antithesis ilike '%${searchTerm}%'
                            or 
                            synthesis ilike '%${searchTerm}%'`)
    },

    getAllShared(knex, project_id) {
        return knex.raw(`with arrays as (
	                    select shared, array_length(shared, 1) from scenes where project_id = '${project_id}'
                        ) 
                        select shared from arrays order by array_length desc limit 1`)
    }

}

module.exports = ScenesService;