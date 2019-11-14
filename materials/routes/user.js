const
  router = require('koa-router')(),
  jwt = require('../middlewares/jwt'),
  rbac = require('../middlewares/rbac'),
  userController = require('../controllers/userController')

router.get('/get', jwt, rbac(), userController.userGet)
router.post('/account/create', userController.accountCreate)

module.exports = router
