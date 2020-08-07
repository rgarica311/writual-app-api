const SharedEpisodesService = {

    hideSharedEpisode(knex, showTitle, episodeTitle, uid) {
        console.log(`hideSharedEpisode args: showTitle: ${showTitle}, episodeTitle: ${episodeTitle}, uid: ${uid}`)
        console.log('shared_episodes service runnig:  hideSharedEpisode running')
        return knex.raw(`UPDATE shared_episodes
                        SET visible = ${false}
                        where show_title = '${showTitle}' 
                        AND
                        episode_title = '${episodeTitle}'
                        AND
                        shared_with_uid = '${uid}'`)
    },

    unHideSharedEpisode(knex, showTitle, episodeTitle, uid) {
        console.log(`shared_episodes service runnig:  debug hide/show: unHideSharedEpisode servivce running: episodeTitle: ${episodeTitle}, uid: ${uid}`)
        return knex.raw(`UPDATE shared_episodes
                        SET visible = ${true}
                        where show_title = '${showTitle}'
                        AND
                        episode_title = '${episodeTitle}'
                        AND
                        shared_with_uid = '${uid}'`)
                           
    },

    showHiddenSharedEpisodes(knex, uid, showhiddenmode) {
        console.log('showhiddenSharedEpisodes service running: showhiddenmode', showhiddenmode)
        return knex.raw(`UPDATE shared_episodes
                        SET show_hidden = ${showhiddenmode}
                        where shared_with_uid = '${uid}' `)
    },

     getSharedEpisodes(knex, uid) {
        console.log('shared_episodes service runnig: shared shared_episodes service running uid:', uid)
        return knex('shared_episodes').where({shared_with_uid: uid}).orderBy('date_created', 'dsc')
    },

    getHiddenSharedEpisodes(knex, uid){
        console.log('shared_episodes service runnig: ')
        return knex('shared_episodes').where({shared_with_uid: uid, visible: false})
    },

}

module.exports = SharedEpisodesService