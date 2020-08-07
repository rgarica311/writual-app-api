const  ProjectsService = {
  
  getUserProjects(knex, uid) {
	  console.log('projects service runnig: get user projects running, uid', uid)
    console.log(`getUserProjects running knex: ${knex}`)
    return knex('projects').where({uid: uid}).orderBy('date_created', 'dsc')
  },

  getSharedWithUids(knex, uid, project_id, shared, isEpisode) {
    console.log(`getSharedWithUids service running uid: ${uid} project_id: ${project_id} isEpisode: ${isEpisode} type of isEpisode: ${typeof isEpisode}`)
    if(shared === 'false') {
      console.log('gSWUids false')
      if(isEpisode === 'true') {
        return knex.select('shared_with_uid').from('shared_episodes').where({shared_by_uid: uid,id: project_id})
      } else {
          return knex.select('shared_with_uid').from('sharedprojects').where({shared_by_uid: uid, id: project_id})
      }
    } else {
      console.log('gSWUids true')
      if(isEpisode === 'true') {
        return knex.select('shared_by_uid').from('shared_episodes').where({shared_with_uid: uid, id: project_id})
      } else {
          return knex.select('shared_by_uid').from('sharedprojects').where({shared_with_uid: uid, id: project_id})
      }
      
    }
  },

  test(knex, ids){
    console.log(`test service running ids: ${ids}`)
    let queryStr = knex('users').where({uid: ids[0]})
    if(ids.length > 0){
      console.log('ids', ids)
      for(i=1; i<ids.length; i++){
        console.log('index', i)
        queryStr.orWhere({uid: ids[i]})
        console.log(`queryStr ${queryStr}`)
      }
    }
    console.log(`queryStr: ${queryStr}`)
    return queryStr
  },

  /*getPhotoUrls(knex, id){
    console.log('debug photourl: getPhotoUrls running id', id )
    return knex('users').where({uid: id})
  },*/

  getSharedProjects(knex, uid) {
    console.log('projects service runnig: shared projects service running uid:', uid)
    return knex('projects').whereRaw(`'${uid}' = any (shared)`)
  },

  setShared(knex, uid, project_id) {
    console.log(`set shared running uid ${uid} project_id ${project_id}`)
    return knex('projects').update({shared: true}).where({uid: uid, id: project_id})
  },

  getProjectToShare(knex, uid, project_id) {
    console.log('getProjectToShare runnig uid', uid)
    //setShared(knex, uid, proj)
    return knex.select('id', 'title', 'author', 'logline', 'genre', 'projformat', 'has_episodes', 'budget', 'timeperiod', 'similarprojects', 'framework').from('projects').where({uid: uid, id: project_id})
  },

  
  shareProject(knex, uid, projectName, sharedUID) {
    console.log(`projects service runnig: shareProject running: uid: ${uid}, projectName: ${projectName}, sharedUID: ${sharedUID}`)
    return knex.raw(`UPDATE projects 
                    SET shared = shared || '{${sharedUID}}' 
                    where title = '${projectName}' 
                    AND
                    uid = '${uid}'`)
  },

  addProject(knex, newProj) {
    console.log('projects service runnig: newProj in add project service', newProj)
	  return knex.insert(newProj).into('projects').returning('*')
	  	.then(rows => {
        return rows[0]
      })
  },

  deleteProject(knex, id) {
    console.log('projects service runnig: ')
    return knex('projects').where({id}).delete()
  },

  hideProject(knex, proj, uid) {
    console.log('projects service runnig:  hidProject running')
    return knex.raw(`UPDATE projects
                     SET visible = ${false}
                     where title = '${proj}'
                     and
                     uid = '${uid}'`)
  },

  unHideProject(knex, proj, uid) {
    console.log(`projects service runnig:  debug hide/show: unHideProject servivce running: proj: ${proj}, uid: ${uid}`)
    return knex.raw(`UPDATE projects
                     SET visible = ${true}
                     where title = '${proj}'
                     and
                     uid = '${uid}'`)
  },

  showHiddenProjects(knex, uid, showhiddenmode) {
    console.log('projects service runnig: ')
    return knex.raw(`update projects
                     set show_hidden = ${showhiddenmode}
                     where uid = '${uid}'`)
  },

  getHiddenProjects(knex, uid){
    console.log('projects service runnig: ')
    return knex('projects').where({uid: uid, visible: false})
  },

  showProject(knex, proj, uid) {
    console.log('projects service runnig: ')
    return knex.raw(`UPDATE projects
                     SET visible = ${true}
                     where title = '${proj}'
                     and
                     uid = '${uid}'`)
  }
}

module.exports = ProjectsService;