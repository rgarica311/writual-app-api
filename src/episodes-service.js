const EpisodesService = {

    addEpisode(knex, newEpisode) {
        return knex.insert(newEpisode).into('episodes').returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    deleteEpisode(knex, id) {
        return knex('episodes').where({uni_id: id}).delete()
    },

    getEpisodeToShare(knex, uid, episodeTitle) {
        knex('episodes').update({shared: true}).where({uid: uid, show_title: episodeTitle})
        return knex.select('uni_id', 'show_title', 'project_id', 'episode_title', 'author', 'logline', 'genre', 'projformat','budget','timeperiod', 'similarepisodes', 'framework', 'bottle_episode').from('episodes').where({uid: uid, episode_title: episodeTitle})
    },

    async shareEpisode(knex, epToShare, count) {
        let sharedEpisodes = await knex('episode_title', 'shared_by_uid', 'shared_with_uid').from('shared_episodes').where({shared_by_uid: epToShare.shared_by_uid})
        const compareObjects = (obj1, obj2) => {
            return obj1.episode_title === obj2.episode_title && obj1.shared_by_uid === obj2.shared_by_uid && obj1.shared_with_uid === obj2.shared_with_uid
        }
        const episodeExists = []
        sharedEpisodes.forEach(ep => {
            episodeExists.push(compareObjects(ep, epToShare))
        })
        if(!episodeExists.includes(true)) {
            return knex.insert(epToShare).into('shared_episodes').returning('*')
                .then(rows => {
                    return rows[0]
                })
        }
        
    },

    getAllEpisodes(knex, uid, project_id) {
        return knex.select('uni_id', 'uid', 'show_title', 'episode_title', 'project_id', 'author', 'logline', 'genre', 'projformat','budget','timeperiod', 'similarepisodes', 'framework', 'bottle_episode', 'shared').from('episodes').where({project_id: project_id, uid: uid }).orderBy('date_created', 'dsc')
    },

    shareAllEpisodes(knex, uid, showTitle, sharedUID) {
        return knex.raw(`UPDATE episodes 
                        SET shared_with_uid = shared_with_uid || '{${sharedUID}}' 
                        where show_title = '${showTitle}' 
                        AND
                        uid = '${uid}'`)
    },

    updateEpisode(knex, episode, id) {
        console.log('update episode')
        return knex('episodes').where({id: id}).update({episode_title: episode.title, author: episode.author, logline: episode.logline, genre: episode.genre, projformat: episode.projformat, budget: episode.budget, timeperiod: episode.timeperiod, similarepisodes: episode.similarepisodes})
    },


    getEpisodes(knex, uid, title) {
        return knex('episodes').where({uid: uid }).orderBy('date_created', 'dsc')
                 
    }, 

   
    hideEpisode(knex, showTitle, episodeTitle, uid) {
        return knex.raw(`UPDATE episodes
                        SET visible = ${false}
                        where show_title = '${showTitle}' 
                        AND
                        episode_title = '${episodeTitle}'
                        and
                        uid = '${uid}'`)
    },

    

    unHideEpisode(knex, showTitle, episodeTitle, uid) {
        return knex.raw(`UPDATE episodes
                        SET visible = ${true}
                        where show_title = '${showTitle}' 
                        AND
                        episode_title = '${episodeTitle}'
                        and
                        uid = '${uid}'`)
    },

   

    showHiddenEpisodes(knex, uid, showhiddenmode) {
        return knex.raw(`update episodes
                        set show_hidden = ${showhiddenmode}
                        where uid = '${uid}'`)
    },

    

    getHiddenEpisodes(knex, uid){
        return knex('episodes').where({uid: uid, visible: false})
    },

    setShared(knex, uid, uni_id) {
        return knex('episodes').update({shared: true}).where({uid: uid, uni_id: uni_id})
    },

    getPermission(knex, project_id) {
        return knex.select('permission').from('sharedprojects').where({id: project_id})
    }

    


}

module.exports = EpisodesService