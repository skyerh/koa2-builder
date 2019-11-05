const
  router = require('koa-router')(),
  jwt = require('../middlewares/jwt'),
  rbac = require('../middlewares/rbac'),
  userController = require('../controllers/userController')

router.post('/account/create', userController.accountCreate)
//router.post('/invite', jwt, rbac(), userController.userInvite)

module.exports = router
