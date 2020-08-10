const FeedbackService = {

    getFeedback(knex, proj_id, episode_id, reviewer) {
        if(episode_id !== 'null' && episode_id !== null) {
            return knex.select('feedback', 'reviewer').from('feedback').where({project_id: proj_id, episode_id: episode_id, reviewer: reviewer}).orderBy('date_updated', 'desc')
        } else {
            return knex.select('feedback', 'reviewer').from('feedback').where({project_id: proj_id, reviewer: reviewer}).orderBy('date_updated', 'desc')
        }
        
    },

    getUserFeedback(knex, proj_id, episode_id) {
        if(episode_id !== 'null' && episode_id !== null) {
            return knex.select('feedback', 'reviewer').from('feedback').where({project_id: proj_id, episode_id: episode_id}).orderBy('date_updated', 'desc')
        } else {
            return knex.select('feedback', 'reviewer').from('feedback').where({project_id: proj_id}).orderBy('date_updated', 'desc')
        }
        
    },


    postFeedback(knex, updatedFeedback) {
        return knex.insert(updatedFeedback).into('feedback').returning('*')
            .then(rows => {
            return rows[0]
        })
    },

    updateFeedback(knex, reviewer, proj_id, episode_id, raw) {
        if(episode_id !== null){
            return knex.raw(`update feedback
                         set feedback = '${JSON.stringify(raw)}'
                         where
                         episode_id = '${episode_id}'
                         and
                         reviewer = '${reviewer}`)
        } else {
            return knex.raw(`update feedback
                         set feedback = '${JSON.stringify(raw)}'
                         where
                         project_id = '${proj_id}'
                         and 
                         reviewer = '${reviewer}'`)
        }
        
    },

}

module.exports = FeedbackService