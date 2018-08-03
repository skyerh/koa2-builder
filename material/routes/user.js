const
  jwt = require('../middlewares/jwt'),
  rbac = require('../middlewares/rbac'),
  router = require('koa-router')(),
  userController = require('../controllers/userController')

router.post('/create', userController.userCreate)
router.post('/invite', jwt, rbac(), userController.userInvite)

module.exports = router
