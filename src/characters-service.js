const CharactersService = {
    getAllCharacters(knex) {
        console.log('get all char running')
        return knex.select('*').from('characters')
    },

    getProjectCharacters(knex, proj, user) {
        console.log('get proj Characters running')
        console.log('proj in getPorjectCharacters', proj.replace(/"/g, "'"))
        console.log(`user_id in getProjectCharacters ${user}`)
        return knex.select('id', 'name', 'age', 'gender', 'details').from('characters').where({project_name: proj.replace(/"/g, "'"), user_id: user})
    },

    addCharacter(knex, newChar) {
        console.log('newChar in add char service', newChar)
        return knex.insert(newChar).into('characters').returning('*')
            .then(rows => {
            return rows[0]
        })
    },

    deleteCharacter(knex, id) {
        return knex('characters').where({id}).delete()
    }


}

module.exports = CharactersService;

