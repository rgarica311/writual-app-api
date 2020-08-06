const EpisodesService = {

    addEpisode(knex, newEpisode) {
        //console.log('add episode service running newEpisode:', newEpisode)
        return knex.insert(newEpisode).into('episodes').returning('*')
            .then(rows => {
                //console.log('add episode function rows:', rows)
                return rows[0]
            })
    },

    deleteEpisode(knex, id) {
        //console.log('episodes service runnig: ')
        return knex('episodes').where({uni_id: id}).delete()
    },

    getEpisodeToShare(knex, uid, episodeTitle) {
        //console.log(`episodes service running getEpisodeToShare: ${episodeTitle}`)
        knex('episodes').update({shared: true}).where({uid: uid, show_title: episodeTitle})
        return knex.select('uni_id', 'show_title', 'project_id', 'episode_title', 'author', 'logline', 'genre', 'projformat','budget','timeperiod', 'similarepisodes', 'framework', 'bottle_episode').from('episodes').where({uid: uid, episode_title: episodeTitle})
    },

    async shareEpisode(knex, epToShare, count) {
        //console.log(`shareEpisode service running ${count} time(s) epToShare: ${JSON.stringify(epToShare)}`)
        let sharedEpisodes = await knex('episode_title', 'shared_by_uid', 'shared_with_uid').from('shared_episodes').where({shared_by_uid: epToShare.shared_by_uid})
        //console.log(`sharedEpisodes: ${JSON.stringify(sharedEpisodes)}`)
        const compareObjects = (obj1, obj2) => {
            //console.log(`compare episode pbjects: obj1: ${JSON.stringify(obj1)} obj2: ${JSON.stringify(obj2)}`)
            return obj1.episode_title === obj2.episode_title && obj1.shared_by_uid === obj2.shared_by_uid && obj1.shared_with_uid === obj2.shared_with_uid
        }
        const episodeExists = []
        sharedEpisodes.forEach(ep => {
            episodeExists.push(compareObjects(ep, epToShare))
        })
        //console.log(`debug project share: episodeExists ${episodeExists}`)
        if(!episodeExists.includes(true)) {
            return knex.insert(epToShare).into('shared_episodes').returning('*')
                .then(rows => {
                    return rows[0]
                })
        }
        
    },

    getAllEpisodes(knex, uid, project_id) {
        //console.log('getAll Episodes running')
        return knex.select('uni_id', 'uid', 'show_title', 'episode_title', 'project_id', 'author', 'logline', 'genre', 'projformat','budget','timeperiod', 'similarepisodes', 'framework', 'bottle_episode', 'shared').from('episodes').where({project_id: project_id, uid: uid }).orderBy('date_created', 'dsc')
    },

    shareAllEpisodes(knex, uid, showTitle, sharedUID) {
        //console.log('episodes service running: shareAllEpisodes, uid, showTitle, sharedUID', uid, showTitle, sharedUID)
        return knex.raw(`UPDATE episodes 
                        SET shared_with_uid = shared_with_uid || '{${sharedUID}}' 
                        where show_title = '${showTitle}' 
                        AND
                        uid = '${uid}'`)
    },


    getEpisodes(knex, uid, title) {
        //console.log(`get episodes running uid: ${uid} title: ${title}`)
        return knex('episodes').where({uid: uid }).orderBy('date_created', 'dsc')
                 
    }, 

   
    hideEpisode(knex, showTitle, episodeTitle, uid) {
        //console.log('episodes service runnig: hideEpisode running')
        return knex.raw(`UPDATE episodes
                        SET visible = ${false}
                        where show_title = '${showTitle}' 
                        AND
                        episode_title = '${episodeTitle}'
                        and
                        uid = '${uid}'`)
    },

    

    unHideEpisode(knex, showTitle, episodeTitle, uid) {
        //console.log(`episodes service runnig:  debug hide/show: unHideEpisode servivce running: episodeTitle: ${episodeTitle}, uid: ${uid}`)
        return knex.raw(`UPDATE episodes
                        SET visible = ${true}
                        where show_title = '${showTitle}' 
                        AND
                        episode_title = '${episodeTitle}'
                        and
                        uid = '${uid}'`)
    },

   

    showHiddenEpisodes(knex, uid, showhiddenmode) {
        //console.log('episodes service runnig: ')
        return knex.raw(`update episodes
                        set show_hidden = ${showhiddenmode}
                        where uid = '${uid}'`)
    },

    

    getHiddenEpisodes(knex, uid){
        //console.log('episodes service runnig: ')
        return knex('episodes').where({uid: uid, visible: false})
    },

    setShared(knex, uid, uni_id) {
        //console.log(`set shared running uid ${uid} uni_id ${uni_id}`)
        return knex('episodes').update({shared: true}).where({uid: uid, uni_id: uni_id})
    },

    getPermission(knex, project_id) {
        //console.log(`getPermission service ${project_id}`)
        return knex.select('permission').from('sharedprojects').where({id: project_id})
    }

    


}

module.exports = EpisodesService