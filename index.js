const
  path = require('path'),
  program = require('commander'),
  ncp = require('ncp').ncp,
  version = require('./package.json').version

const builder = () => {
  program
    .version(version)
    .allowUnknownOption()
    .usage('<dirName>')
    .arguments('<dirName>')

  program
    .action((dirName) => {
      console.log()
      console.log('    koa2-builder')
      console.log('    ____________________________________________________')
      console.log('    \x1b[36mStart building\x1b[0m : ' + dirName + ' ...')
      console.log('    \x1b[36mStart building\x1b[0m : ' + dirName + '/bin ...')
      console.log('    \x1b[36mStart building\x1b[0m : ' + dirName + '/config ...')
      console.log('    \x1b[36mStart building\x1b[0m : ' + dirName + '/controllers ...')
      console.log('    \x1b[36mStart building\x1b[0m : ' + dirName + '/error ...')
      console.log('    \x1b[36mStart building\x1b[0m : ' + dirName + '/events ...')
      console.log('    \x1b[36mStart building\x1b[0m : ' + dirName + '/logs ...')
      console.log('    \x1b[36mStart building\x1b[0m : ' + dirName + '/middlewares ...')
      console.log('    \x1b[36mStart building\x1b[0m : ' + dirName + '/models ...')
      console.log('    \x1b[36mStart building\x1b[0m : ' + dirName + '/public ...')
      console.log('    \x1b[36mStart building\x1b[0m : ' + dirName + '/test ...')
      console.log('    \x1b[36mStart building\x1b[0m : ' + dirName + '/tmp ...')
      console.log('    \x1b[36mStart building\x1b[0m : ' + dirName + '/utils ...')
      console.log('    \x1b[36mStart building\x1b[0m : ' + dirName + '/views ...')
      console.log('    \x1b[36mStart building\x1b[0m : ' + dirName + '/app.js ...')
      console.log('    \x1b[36mStart building\x1b[0m : ' + dirName + '/package.json ...')
      console.log('    ____________________________________________________')
      console.log()
      copyFolder(__dirname + '/materials', path.basename(path.resolve(dirName)))
    })
  
  program.parse(process.argv)
  
  if (program.args.length < 1) {
    program.outputHelp()
    process.exit()
  }
}

const copyFolder = (source, destination) => {
  ncp.limit = 16
  
  ncp(source, destination, (err) => {
    if (err) {
      return console.error(err)
    } else {
      console.log('completed')
    }
  })
}

module.exports = builder

