const SharedProjectsService = {
    
    getChatSharedProject(knex, title, sw_uid) {
        console.log(`debug private message: get all shared projects running: title: ${title}, sw_uid: ${sw_uid}`)
        return knex('sharedprojects').where({shared_with_uid: sw_uid, title: title})
    }, 

    getSharedProjects(knex, uid) {
        console.log('get shared projects running uid is:', uid)
        return knex('sharedprojects').where({shared_with_uid: uid})
    },

   async shareProject(knex, projToShare) {
        console.log(`debug share project: shareProject Service running: ${JSON.stringify(projToShare)}`)
        let sharedProjects  = await knex.select('id', 'shared_by_uid', 'shared_with_uid').from('sharedprojects').where({shared_by_uid: projToShare[0].shared_by_uid})
        console.log(`debug share project shareProject service result: ${JSON.stringify( sharedProjects)}`)
        //let sharedProjects = result[0]
        const compareObjects = (obj1, obj2) => {
            return obj1.id === obj2.id && obj1.shared_by_uid === obj2.shared_by_uid && obj1.shared_with_uid === obj2.shared_with_uid
        }
        const projectExists = []
        sharedProjects.forEach(prj => {
            projectExists.push(compareObjects(prj, projToShare[0]))
        })
        console.log(`debug project share: projectExists ${projectExists}`)
        if(!projectExists.includes(true)) {
            return knex.insert(projToShare[0]).into('sharedprojects').returning('*')
                .then(rows => {
                    return rows[0]
                })
        }
        
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