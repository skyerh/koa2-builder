const
  multer = require('koa-multer'),
  router = require('koa-router')(),
  thumbnailController = require('../controllers/thumbnailController'),
  jwt = require('../middlewares/jwt'),
  rbac = require('../middlewares/rbac'),
  upload = multer({ dest: 'tmp/' })

router.get('/avatar/download', thumbnailController.avatarDownload)
router.post('/avatar/flush', jwt, rbac(), thumbnailController.avatarFlush)
router.post('/avatar/upload', jwt, rbac(), upload.single('file'), thumbnailController.avatarUpload)

module.exports = router
