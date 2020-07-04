const EpisodesService = {

    addEpisode(knex, newEpisode) {
        console.log('add episode service running newEpisode:', newEpisode)
        return knex.insert(newEpisode).into('episodes').returning('*')
            .then(rows => {
                console.log('add episode function rows:', rows)
                return rows[0]
            })
    },

    deleteEpisode(knex, id) {
        console.log('episodes service runnig: ')
        return knex('episodes').where({id}).delete()
    },

    getEpisodeToShare(knex, uid, episodeTitle) {
        console.log(`episodes service running getEpisodeToShare: ${episodeTitle}`)
        knex('episodes').update({shared: true}).where({uid: uid, show_title: episodeTitle})
        return knex.select('id', 'show_title', 'project_id', 'episode_title', 'author', 'logline', 'genre', 'projformat','budget','timeperiod', 'similarepisodes', 'framework', 'bottle_episode').from('episodes').where({uid: uid, episode_title: episodeTitle})
    },

    shareEpisode(knex, epToShare) {
        return knex.insert(epToShare).into('shared_episodes').returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    getAllEpisodes(knex, uid, project_id) {
        console.log('getAll Episodes running')
        return knex.select('id', 'uid', 'show_title', 'episode_title', 'project_id', 'author', 'logline', 'genre', 'projformat','budget','timeperiod', 'similarepisodes', 'framework', 'bottle_episode').from('episodes').where({project_id: project_id, uid: uid }).orderBy('date_created', 'dsc')
    },

    shareAllEpisodes(knex, uid, showTitle, sharedUID) {
        console.log('episodes service running: shareAllEpisodes, uid, showTitle, sharedUID', uid, showTitle, sharedUID)
        return knex.raw(`UPDATE episodes 
                        SET shared_with_uid = shared_with_uid || '{${sharedUID}}' 
                        where show_title = '${showTitle}' 
                        AND
                        uid = '${uid}'`)
    },


    getEpisodes(knex, uid, title) {
        console.log(`get episodes running uid: ${uid} title: ${title}`)
        return knex('episodes').where({uid: uid }).orderBy('date_created', 'dsc')
                 
    }, 

   
    hideEpisode(knex, showTitle, episodeTitle, uid) {
        console.log('episodes service runnig: hideEpisode running')
        return knex.raw(`UPDATE episodes
                        SET visible = ${false}
                        where show_title = '${showTitle}' 
                        AND
                        episode_title = '${episodeTitle}'
                        and
                        uid = '${uid}'`)
    },

    

    unHideEpisode(knex, showTitle, episodeTitle, uid) {
        console.log(`episodes service runnig:  debug hide/show: unHideEpisode servivce running: episodeTitle: ${episodeTitle}, uid: ${uid}`)
        return knex.raw(`UPDATE episodes
                        SET visible = ${true}
                        where show_title = '${showTitle}' 
                        AND
                        episode_title = '${episodeTitle}'
                        and
                        uid = '${uid}'`)
    },

   

    showHiddenEpisodes(knex, uid, showhiddenmode) {
        console.log('episodes service runnig: ')
        return knex.raw(`update episodes
                        set show_hidden = ${showhiddenmode}
                        where uid = '${uid}'`)
    },

    

    getHiddenEpisodes(knex, uid){
        console.log('episodes service runnig: ')
        return knex('episodes').where({uid: uid, visible: false})
    },

    


}

module.exports = EpisodesService