const SharedProjectsService = {
    
    getChatSharedProject(knex, title, sw_uid) {
        return knex('sharedprojects').where({shared_with_uid: sw_uid, title: title})
    }, 

    getSharedProjects(knex, uid) {
        return knex('sharedprojects').where({shared_with_uid: uid})
    },

   async shareProject(knex, projToShare) {
        let sharedProjects  = await knex.select('id', 'shared_by_uid', 'shared_with_uid').from('sharedprojects').where({shared_by_uid: projToShare[0].shared_by_uid})
        //let sharedProjects = result[0]
        const compareObjects = (obj1, obj2) => {
            return obj1.id === obj2.id && obj1.shared_by_uid === obj2.shared_by_uid && obj1.shared_with_uid === obj2.shared_with_uid
        }
        const projectExists = []
        sharedProjects.forEach(prj => {
            projectExists.push(compareObjects(prj, projToShare[0]))
        })
        if(!projectExists.includes(true)) {
            return knex.insert(projToShare[0]).into('sharedprojects').returning('*')
                .then(rows => {
                    return rows[0]
                })
        }
        
    },

    hideSharedProject(knex, proj, uid) {
        return knex.raw(`UPDATE sharedprojects
                        SET visible = ${false}
                        where title = '${proj}'
                        and
                        shared_with_uid = '${uid}'`)
    },

    unHideSharedProject(knex, proj, uid) {
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