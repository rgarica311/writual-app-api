const SharedProjectsService = {
    
    getChatSharedProject(knex, title, sw_uid) {
        console.log(`debug private message: get all shared projects running: title: ${title}, sw_uid: ${sw_uid}`)
        return knex('sharedprojects').where({shared_with_uid: sw_uid, title: title})
    }, 

    getSharedProjects(knex, uid) {
        console.log('get shared projects running uid is:', uid)
        return knex('sharedprojects').where({shared_with_uid: uid})
    },

    shareProject(knex, projToShare) {
        console.log('debug share project: shareProjec Service running')
        return knex.insert(projToShare).into('sharedprojects').returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    hideSharedProject(knex, proj, uid) {
        console.log('sharedwithuid hide shared project service running')
        return knex.raw(`UPDATE sharedprojects
                        SET visible = ${false}
                        where title = '${proj}'
                        and
                        shared_with_uid = '${uid}'`)
    },

    unHideSharedProject(knex, proj, uid) {
        console.log('unhide shared project service running')
        return knex.raw(`UPDATE sharedprojects
                        SET visible = ${true}
                        where title = '${proj}'
                        and
                        shared_with_uid = '${uid}'`)
    },

    showHiddenSharedProjects(knex, uid, showhiddenmode) {
        return knex.raw(`update sharedprojects
                     set show_hidden = ${showhiddenmode}
                     where shared_with_uid = '${uid}'`)
    },

    getHiddenSharedProjects(knex, uid){
        return knex('sharedprojects').where({shared_with_uid: uid, visible: false})
    },

    showSharedProject(knex, proj, uid) {
        return knex.raw(`UPDATE sharedprojects
                        SET visible = ${true}
                        where title = '${proj}'
                        and
                        shared_with_uid = '${uid}'`)
    }

}

module.exports = SharedProjectsService