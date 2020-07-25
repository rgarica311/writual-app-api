const ScenesService = {
    
    getProjectScenes(knex, project_id, uid, isEpisode){
         console.log(`scenes service params proj:${project_id} uid:${uid} isEpisode: ${isEpisode} typeof isEpisode: ${typeof isEpisode}`)
        if(isEpisode){
            return knex.select('id', 'uid', 'project_name', 'project_id', 'act', 'step_name', 'scene_heading', 'thesis', 'antithesis', 'synthesis').from('scenes').where({episode_id: project_id, uid: uid}).orderBy('date_created', 'dsc')
        } else {
            return knex.select('id', 'uid', 'project_name', 'project_id', 'act', 'step_name', 'scene_heading', 'thesis', 'antithesis', 'synthesis').from('scenes').where({project_id: project_id, uid: uid}).orderBy('date_created', 'dsc')
        }
    },

    getSharedScenes(knex, uid, project_id, isEpisode) {
        console.log('shared scenes service running uid:', uid)
        console.log(`shared scenes service running project_id: ${project_id}`)
        if(isEpisode) {
            return knex.raw(`select id, uid, project_name, project_id, act, step_name, scene_heading, thesis, antithesis, synthesis from scenes 
                        where episode_id = '${project_id}' 
                        and '${uid}' = any (shared) 
                        order by 
                        date_created asc`)
                            .then(obj => {
                                return obj.rows
                            })
        } else {
            return knex.raw(`select id, uid, project_name, project_id, act, step_name, scene_heading, thesis, antithesis, synthesis from scenes 
                        where project_id = '${project_id}' 
                        and '${uid}' = any (shared) 
                        order by 
                        date_created asc`)
                            .then(obj => {
                                return obj.rows
                            })
        }

    },

    addScene(knex, newScene) {
        console.log(`posting scene newScene: ${JSON.stringify(newScene)}`)
        return knex.insert(newScene).into('scenes').returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    deleteScene(knex, id, uid) {
        console.log(`delete running id ${id}, uid ${uid}`)
        return knex('scenes').where({id: id, uid: uid}).delete()
    },

    async shareScenes(knex, uid, project_id, sharedUID, projFormat, title) {
        let result = await knex.select('shared').from('characters').where({project_id: project_id, uid: uid})
        console.log(`debug share project shareScenes service running: result ${JSON.stringify(result)}`)
        let prevSharedUID = result[0].shared[0]
        console.log(`debug share project shareScenes service running: prevSharedUID ${prevSharedUID}`)
        console.log(`debug projectshareScenes running: uid: ${uid}, project_id: ${project_id}, sharedUID: ${sharedUID}`)
        if(prevSharedUID !== sharedUID) {
            if(projFormat === 'Episode') {
                try {
                    return knex.raw(`UPDATE scenes 
                                SET shared = shared || '{${sharedUID}}' 
                                where episode_id = '${project_id}' 
                                AND
                                project_name = '${title}'
                                AND
                                uid = '${uid}'`)

                } catch (err) {
                    console.error(`error with sharing scenes service: ${err}`)
                }

            } else {
                try {
                    return knex.raw(`UPDATE scenes 
                                SET shared = shared || '{${sharedUID}}' 
                                where project_id = '${project_id}' 
                                AND
                                uid = '${uid}'`)

                } catch (err) {
                    console.error(`error with sharing scenes service: ${err}`)
                }
            }
        }
        
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

    getAllShared(knex, project_id, episode_id) {
        console.log(`scenes getAllShared projectID: ${project_id} episode_id: ${episode_id} typeof episode_id: ${typeof episode_id}`)
        if(episode_id !== null) {
            return knex.raw(`with arrays as (
	                    select shared, array_length(shared, 1) from scenes where episode_id = '${episode_id}'
                        ) 
                        select shared from arrays order by array_length desc limit 1`)
        } else {
            return knex.raw(`with arrays as (
	                    select shared, array_length(shared, 1) from scenes where project_id = '${project_id}'
                        ) 
                        select shared from arrays order by array_length desc limit 1`)
        }
        
    }

}

module.exports = ScenesService;