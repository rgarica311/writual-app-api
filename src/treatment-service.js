const TreatmentService = {

    getTreatment(knex, proj_id, episode_id) {
        if(episode_id !== 'null') {
            return knex.select('treatment').from('treatments').where({project_id: proj_id, episode_id: episode_id}).orderBy('date_updated', 'desc').limit(1).returning('*')
            
        } else {
            return knex.select('treatment').from('treatments').where({project_id: proj_id}).orderBy('date_updated', 'desc').limit(1).returning('*')
            
        }
        
    },


    postTreatment(knex, updatedTreatment) {
        return knex.insert(updatedTreatment).into('treatments').returning('*')
            .then(rows => {
            return rows[0]
        })
    },

    updateTreatment(knex, proj_id, episode_id, raw) {
        if(episode_id !== null){
            return knex.raw(`update treatments
                         set treatment = '${JSON.stringify(raw)}'
                         where
                         episode_id = '${episode_id}'`)
        } else {
            return knex.raw(`update treatments
                         set treatment = '${JSON.stringify(raw)}'
                         where
                         project_id = '${proj_id}'`)
        }
        
    },

}

module.exports = TreatmentService