const  ProjectsService = {
  
  getUserProjects(knex, uid) {
    return knex('projects').where({uid: uid}).orderBy('date_created', 'dsc')
  },

  getSharedWithUids(knex, uid, project_id, shared, isEpisode) {
    if(shared === 'false') {
      if(isEpisode === 'true') {
        return knex.select('shared_with_uid').from('shared_episodes').where({shared_by_uid: uid, id: project_id})
      } else {
          return knex.select('shared_with_uid').from('sharedprojects').where({shared_by_uid: uid, id: project_id})
      }
    } else {
      if(isEpisode === 'true') {
        return knex.select('shared_by_uid').from('shared_episodes').where({shared_with_uid: uid, id: project_id})
      } else {
          return knex.select('shared_by_uid').from('sharedprojects').where({shared_with_uid: uid, id: project_id})
      }
      
    }
  },

  getUrls(knex, ids){
    let queryStr
    if(ids.length > 0){
      queryStr = knex('users').where({uid: ids[0]})
      for(i=1; i<ids.length; i++){
        queryStr.orWhere({uid: ids[i]})
      }
    }
    return queryStr
  },

  getSharedProjects(knex, uid) {
    return knex('projects').whereRaw(`'${uid}' = any (shared)`)
  },

  setShared(knex, uid, project_id) {
    return knex('projects').update({shared: true}).where({uid: uid, id: project_id})
  },

  getProjectToShare(knex, uid, project_id) {
    //setShared(knex, uid, proj)
    return knex.select('id', 'title', 'author', 'logline', 'genre', 'projformat', 'has_episodes', 'budget', 'timeperiod', 'similarprojects', 'framework').from('projects').where({uid: uid, id: project_id})
  },

  
  shareProject(knex, uid, projectName, sharedUID) {
    return knex.raw(`UPDATE projects 
                    SET shared = shared || '{${sharedUID}}' 
                    where title = '${projectName}' 
                    AND
                    uid = '${uid}'`)
  },

  addProject(knex, newProj) {
	  return knex.insert(newProj).into('projects').returning('*')
	  	.then(rows => {
        return rows[0]
      })
  },

  deleteProject(knex, id) {
    return knex('projects').where({id}).delete()
  },

  hideProject(knex, proj, uid) {
    return knex.raw(`UPDATE projects
                     SET visible = ${false}
                     where title = '${proj}'
                     and
                     uid = '${uid}'`)
  },

  unHideProject(knex, proj, uid) {
    return knex.raw(`UPDATE projects
                     SET visible = ${true}
                     where title = '${proj}'
                     and
                     uid = '${uid}'`)
  },

  showHiddenProjects(knex, uid, showhiddenmode) {
    return knex.raw(`update projects
                     set show_hidden = ${showhiddenmode}
                     where uid = '${uid}'`)
  },

  getHiddenProjects(knex, uid){
    return knex('projects').where({uid: uid, visible: false})
  },

  showProject(knex, proj, uid) {
    return knex.raw(`UPDATE projects
                     SET visible = ${true}
                     where title = '${proj}'
                     and
                     uid = '${uid}'`)
  }
}

module.exports = ProjectsService;