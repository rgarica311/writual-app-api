
const  MessagesService = {

    getUnreadMessages(knex, argSet) {
        //console.log(`refactor unread: getUnreadMessages argSet ${argSet} argset[0]: ${argSet[0]}`)
        return new Promise((resolve, reject) => {
            resolve(knex('messages').where({recipient_uid: argSet[0], socket_available: false, proj: argSet[1]}))
                
        })
        //console.log(`debug chat getUnreadMessages running`)
        
    },

    setRead(knex, uid) {
        return knex.raw(`UPDATE messages
                         set socket_available = '${true}'
                         where recipient_uid = '${uid}'`)
    },

    getMaxIndex(knex, uid, title) {
        return knex.select('id').from('messages').where({sender_uid: uid, proj, title}).orWhere({recipient_uid: uid, proj: title}).orderBy('id', 'dsc').limit(1)
    },

    getInitialMessages(knex, recipient_uid, episode_id, uid, project_id) {
        //console.log(`debug chat: get initial messages service running uid: ${uid}, episode_id: ${episode_id}, recipient_uid: ${recipient_uid}`)
        /*return knex.with('msg_alias', (qb) => {
            qb.select('*').from('messages').where(function () {
                    this
                        .where({sender_uid: uid, proj: title})
                        .orWhere({recipient_uid: uid, proj: title}).limit(300).orderBy('date_created', 'dsc') })
        }).select('*').from('msg_alias')*/
        //return knex('messages').where({sender_uid: uid, proj: title}).orWhere({recipient_uid: uid, proj: title}).orderBy('date_created', 'dsc').limit(7)
        if(episode_id !== null) {
            //console.log(`episode_id !== null: ${episode_id}`)
            return knex.raw(`select * from messages 
                         where 
                         sender_uid = '${uid}'
                         and 
                         episode_id = '${episode_id}'
                         and
                         recipient_uid = '${recipient_uid}'
                         or 
                         recipient_uid = '${uid}'
                         and 
                         sender_uid = '${recipient_uid}'
                         and
                         episode_id = '${episode_id}'
                         order by 
                         date_created desc
                         limit 10`)
        } else {
            //console.log(`episode_id === null: ${episode_id}`)
            return knex.raw(`select * from messages 
                         where 
                         sender_uid = '${uid}'
                         and 
                         project_id = '${project_id}'
                         and
                         recipient_uid = '${recipient_uid}'
                         or 
                         recipient_uid = '${uid}'
                         and 
                         sender_uid = '${recipient_uid}'
                         and
                         project_id = '${project_id}'
                         order by 
                         date_created desc
                         limit 10`)
        }
        
           
    },

    getNextMessages(knex, episode_id, project_id, uid, limit, recipient_uid) {
        //console.log(`get next messages running uid: ${uid}, title: ${title}, limit: ${limit}`)
        if(episode_id !== null) {
            return knex.raw(`select * from messages 
                         where 
                         sender_uid = '${uid}'
                         and 
                         episode_id = '${episode_id}'
                         and
                         recipient_uid = '${recipient_uid}'
                         or 
                         recipient_uid = '${uid}'
                         and 
                         sender_uid = '${recipient_uid}'
                         and
                         episode_id = '${episode_id}'
                         order by 
                         date_created desc
                         limit ${limit}`)
        } else {
            return knex.raw(`select * from messages 
                         where 
                         sender_uid = '${uid}'
                         and 
                         project_id = '${project_id}'
                         and
                         recipient_uid = '${recipient_uid}'
                         or 
                         recipient_uid = '${uid}'
                         and 
                         sender_uid = '${recipient_uid}'
                         and
                         project_id = '${project_id}'
                         order by 
                         date_created desc
                         limit ${limit}`)
        }
            
        /*return knex.with('msg_alias', (qb) => {
            qb.select('*').from('messages').where({sender_uid: uid, proj: title}).orWhere({recipient_uid: uid, proj: title}).orderBy('date_created', 'desc')
        }).select('*').from('msg_alias').orderBy('id', 'desc').limit(limit)*/

    },

    postMessage(knex, message) {
        //console.log(`post message: ${message}`)
        knex.insert(message).into('messages').returning('*')
            .then(rows => {
                return rows[0]
        })
    },

    getMessageIconUrl(knex, sender_uid) {
        //console.log(`getMessageIconUrl service running sender_uid: ${sender_uid}`)
        //console.log(`select photo_url from users where uid = '${sender_uid}'`)
        knex.raw(`select photo_url from users where uid = '${sender_uid}'`)
    }
    

}

module.exports = MessagesService;