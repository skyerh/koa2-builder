const
  router = require('koa-router')(),
  thumbnailRoute = require('./thumbnail'),
  userRoute = require('./user')

router.get('/', async (ctx) => {
  await ctx.render('index.ejs', {
    title: 'koa2 builder',
  })
})

router.use('/api/user', userRoute.routes(), userRoute.allowedMethods())
router.use('/api/thumbnail', thumbnailRoute.routes(), thumbnailRoute.allowedMethods())

module.exports = router
