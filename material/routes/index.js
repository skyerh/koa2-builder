const
  router = require('koa-router')(),
  userRoute = require('./user')

router.get('/', async (ctx) => {
  await ctx.render('index.ejs', {
    title: 'koa2 builder'
  })
})

router.use('/api/user', userRoute.routes(), userRoute.allowedMethods())

module.exports = router
