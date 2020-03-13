const  ProjectsService = {
  getUserProjects(knex, id) {
	console.log('get user projects running')
    return knex('projects').where({user_id: id})
  },

  addProject(knex, newProj) {
    console.log('newProj in add project service', newProj)
	  return knex.insert(newProj).into('projects').returning('*')
	  	.then(rows => {
        return rows[0]
      })
  },

  deleteProject(knex, id) {
    return knex('projects').where({id}).delete()
  }
}

module.exports = ProjectsService;