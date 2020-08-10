const DetailsService = {

    getDetail(knex, detail, character, project_id){
        return knex.select(detail.toLowerCase()).from('details').where({character_name: character, project_id: project_id}).orderBy('date_updated', 'desc').limit(1).returning('*').then(rows => {
            return rows[0]
        })
    },


    postDetail(knex, newDetail){
        return knex.insert(newDetail).into('details').returning('*')
            .then(rows => {
            return rows[0]
        })
    },

    updateDetail(knex, detail, character, project_id, raw){
        return knex.raw(`update details
                         set ${detail} = '${JSON.stringify(raw)}'
                         where
                         character_name = '${character}'
                         and
                         project_id = '${project_id}'`)
    },

}

module.exports = DetailsService