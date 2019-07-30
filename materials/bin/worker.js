require('../models/dbModel').mongoConnect()
const
  worker = require('../jobs/worker')

worker.create()
