const DetailsService = {

    getDetail(knex, detail, character, project_id){
        //console.log(`details getDetail service running: detail: ${detail.toLowerCase()} character: ${character} proj: ${proj}`)
        //console.log(`details get: ${knex.select(detail.toLowerCase()).from('details').where({character_name: character, proj_name: proj}).orderBy('date_created', 'desc').limit(1).returning('*')}`)
        return knex.select(detail.toLowerCase()).from('details').where({character_name: character, project_id: project_id}).orderBy('date_updated', 'desc').limit(1).returning('*').then(rows => {
            return rows[0]
        })
    },


    postDetail(knex, newDetail){
        //console.log('details postDetail service running: newDetail', JSON.stringify(newDetail))
        return knex.insert(newDetail).into('details').returning('*')
            .then(rows => {
            return rows[0]
        })
    },

    updateDetail(knex, detail, character, project_id, raw){
        //console.log(`details updateDetail service running typeof rawEditorData: ${typeof raw}`)
        return knex.raw(`update details
                         set ${detail} = '${JSON.stringify(raw)}'
                         where
                         character_name = '${character}'
                         and
                         project_id = '${project_id}'`)
    },

}

module.exports = DetailsService