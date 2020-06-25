const ScenesService = {
    
    getProjectScenes(knex, proj, uid){
        console.log(`scenes service params proj:${proj} uid:${uid}`)
        return knex.select('id', 'uid', 'project_name', 'act', 'step_name', 'scene_heading', 'thesis', 'antithesis', 'synthesis').from('scenes').where({project_name: proj.replace(/"/g, "'"), uid: uid})
    },

    getSharedScenes(knex, uid, proj) {
        console.log('shared scenes service running uid:', uid)
        console.log(`shared scenes service running proj: ${proj}`)
        return knex.raw(`select id, uid, project_name, project_id, act, step_name, scene_heading, thesis, antithesis, synthesis from scenes 
                        where project_name = '${proj}' 
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

    shareScenes(knex, uid, projectName, sharedUID) {
        console.log(`shareScenes running: uid: ${uid}, projectName: ${projectName}, sharedUID: ${sharedUID}`)
        return knex.raw(`UPDATE scenes 
                        SET shared = shared || '{${sharedUID}}' 
                        where project_name = '${projectName}' 
                        AND
                        uid = '${uid}'`)
    },

    searchScenes(knex, uid, projectName, currentAct, currentStep, searchTerm) {
        return knex.raw(`select id, uid, project_name, act, step_name, scene_heading, thesis, antithesis, synthesis from scenes
                            where uid = '${uid}'
                            and
                            project_name = '${projectName}'
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
    }

}

module.exports = ScenesService;