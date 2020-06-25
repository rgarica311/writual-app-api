
const  MessagesService = {

    getUnreadMessages(knex, uid, title) {
        //console.log(`debug chat getUnreadMessages running`)
        return knex('messages').where({recipient_uid: uid, socket_available: false, proj: title})
    },

    setRead(knex, uid) {
        return knex.raw(`UPDATE messages
                         set socket_available = '${true}'
                         where recipient_uid = '${uid}'`)
    },

    getMaxIndex(knex, uid, title) {
        return knex.select('id').from('messages').where({sender_uid: uid, proj, title}).orWhere({recipient_uid: uid, proj: title}).orderBy('id', 'dsc').limit(1)
    },

    getInitialMessages(knex, uid, title, recipient_uid) {
        //console.log(`debug chat: get initial messages service running uid: ${uid}, title: ${title}`)
        /*return knex.with('msg_alias', (qb) => {
            qb.select('*').from('messages').where(function () {
                    this
                        .where({sender_uid: uid, proj: title})
                        .orWhere({recipient_uid: uid, proj: title}).limit(300).orderBy('date_created', 'dsc') })
        }).select('*').from('msg_alias')*/
        //return knex('messages').where({sender_uid: uid, proj: title}).orWhere({recipient_uid: uid, proj: title}).orderBy('date_created', 'dsc').limit(7)
        return knex.raw(`select * from messages 
                         where 
                         sender_uid = '${uid}'
                         and 
                         proj = '${title}'
                         and
                         recipient_uid = '${recipient_uid}'
                         or 
                         recipient_uid = '${uid}'
                         and 
                         sender_uid = '${recipient_uid}'
                         and
                         proj = '${title}'
                         order by 
                         date_created desc
                         limit 10`)
           
    },

    getNextMessages(knex, title, uid, limit, recipient_uid) {
        //console.log(`get next messages running uid: ${uid}, title: ${title}, limit: ${limit}`)
        return knex.raw(`select * from messages 
                         where 
                         sender_uid = '${uid}'
                         and 
                         proj = '${title}'
                         and
                         recipient_uid = '${recipient_uid}'
                         or 
                         recipient_uid = '${uid}'
                         and 
                         sender_uid = '${recipient_uid}'
                         and
                         proj = '${title}'
                         order by 
                         date_created desc
                         limit ${limit}`)
        /*return knex.with('msg_alias', (qb) => {
            qb.select('*').from('messages').where({sender_uid: uid, proj: title}).orWhere({recipient_uid: uid, proj: title}).orderBy('date_created', 'desc')
        }).select('*').from('msg_alias').orderBy('id', 'desc').limit(limit)*/

    },

    postMessage(knex, message) {
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