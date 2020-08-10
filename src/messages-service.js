
const  MessagesService = {

    getUnreadMessages(knex, argSet) {
        return new Promise((resolve, reject) => {
            resolve(knex('messages').where({recipient_uid: argSet[0], socket_available: false, proj: argSet[1]}))
                
        })
        
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
                         limit 10`)
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
                         limit 10`)
        }
        
           
    },

    getNextMessages(knex, episode_id, project_id, uid, limit, recipient_uid) {
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
            
        

    },

    postMessage(knex, message) {
        knex.insert(message).into('messages').returning('*')
            .then(rows => {
                return rows[0]
        })
    },

    getMessageIconUrl(knex, sender_uid) {
        knex.raw(`select photo_url from users where uid = '${sender_uid}'`)
    }
    

}

module.exports = MessagesService;