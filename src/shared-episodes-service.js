const SharedEpisodesService = {

    hideSharedEpisode(knex, showTitle, episodeTitle, uid) {
        return knex.raw(`UPDATE shared_episodes
                        SET visible = ${false}
                        where show_title = '${showTitle}' 
                        AND
                        episode_title = '${episodeTitle}'
                        AND
                        shared_with_uid = '${uid}'`)
    },

    unHideSharedEpisode(knex, showTitle, episodeTitle, uid) {
        return knex.raw(`UPDATE shared_episodes
                        SET visible = ${true}
                        where show_title = '${showTitle}'
                        AND
                        episode_title = '${episodeTitle}'
                        AND
                        shared_with_uid = '${uid}'`)
                           
    },

    showHiddenSharedEpisodes(knex, uid, showhiddenmode) {
        return knex.raw(`UPDATE shared_episodes
                        SET show_hidden = ${showhiddenmode}
                        where shared_with_uid = '${uid}' `)
    },

     getSharedEpisodes(knex, uid) {
        return knex('shared_episodes').where({shared_with_uid: uid}).orderBy('date_created', 'dsc')
    },

    getSharedEpisodesByEmail(knex, email) {
        return knex('shared_episodes').where({shared_with_email: email}).orderBy('date_created', 'dsc')
    },

     addUid(knex, uid, email){
         console.log(`debug sharing: SharedEpisodesService.addUid running`)
        return knex('shared_episodes').where({shared_with_email: email}).update({shared_with_uid: uid})
    },

     removeEmail(knex, email){
        return knex('shared_epsidoes').where({shared_with_email: email}).update({shared_with_email: null})
    },

    getHiddenSharedEpisodes(knex, uid){
        return knex('shared_episodes').where({shared_with_uid: uid, visible: false})
    },

}

module.exports = SharedEpisodesService