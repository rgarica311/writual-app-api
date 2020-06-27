const TreatmentService = {

    getTreatment(knex, proj_id) {
        return knex.select('treatment').from('treatments').where({project_id: proj_id}).orderBy('date_updated', 'desc').limit(1).returning('*').then(rows => {
            return rows[0]
        })
    },


    postTreatment(knex, updatedTreatment) {
        console.log('postTreatment service running: updatedTreatment', JSON.stringify(updatedTreatment))
        return knex.insert(updatedTreatment).into('treatments').returning('*')
            .then(rows => {
            return rows[0]
        })
    },

    updateTreatment(knex, proj_id, raw) {
        return knex.raw(`update treatments
                         set treatment = '${JSON.stringify(raw)}'
                         where
                         project_id = '${proj_id}'`)
    },

}

module.exports = TreatmentService