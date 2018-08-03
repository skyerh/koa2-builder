# koa2-builder

koa2-builder is a tool that can help you to build up the back-end structure with node.js koa2 framework.
koa2-builder will create several essential folders for you before you start to design your APIs.
All you need to do is adjust the configuration, review the purpose of the folders, start to add the package you need, and that is it.

## Features

 - api documentation
 - mocha test with mochawesome test report
 - socket io
 - pm2 for production mode
 - nodemon for developer mode
 - developer and production configuration selector
 - simple role base access control
 - ajv for validation
 - json web token
 - logs for error
 - logs for receive and response
 - mongo connection
 - redis connection
 - bcrypt, aes256 encode and decode
 - json web token validation
 
## Installlation

    npm install -g koa2-builder

## Usage

    Usage: koa2-builder <dirName>

    Options:
    
    -V, --version  output the version number
    -h, --help     output usage information

## Running Your Project
Install dependencies
```
npm install
```
Start node server in developer mode
```
npm run dev
```
Start node server in production mode
```
npm run prd
```
## Pre-built folders

**your project dirName**  
├┬ bin  (project start here)  
│├ config  
││├ development.js (config for developer mode)  
││├ index.js (mode selector)  
││├ log.js (config of output log format)  
││├ production.js (config for production mode)  
││└ rbac.js (simple rbac config)  
│├ controllers  
││└ rbac.js (simple rbac config)  
│├ error  
││├ apiError.js (error output defined)  
││└ apiErrorNames.js (error information definition)  
│├ events  
││├ index.js (event exporter)  
││├ server.js (errors event for server)  
││└ socketIo.js (example of socket io event)  
│├ logs  
││├ error (all the error logs go here)  
││└ response (all the received and responded logs go here)  
│├ middlewares  
││├ jwt.js (json web token middleware)  
││├ rbac.js (role base access control middleware)  
││└ response.js (response formatting middleware)  
│├ models  
││├ dbModel.js (database selector)  
││├ rbacModel.js (role base access control model)  
││├ redisInviteModel.js (redis model sample)  
││└ userModel.js (user model sample)  
│├ public  
││├ doc (apis documentation goes here)  
││└ report (mocha test report goes here)  
│├ routes  
││├ index.js (index for routing)  
││└ user.js (user routing sample)  
│├ test  
││└ user.test.js (user module test sample)  
│├ tmp  
│├ utils  
││├ crypto.js (utility for encrypt and decrypt data)  
││├ email.js (utility for sending the email)  
││├ log_util.js (utility for formatting the log)  
││└ validate.js (utility for validate the json schema)  
└└ views  

You can be free to adding your own packages or remove unnecessary packages came with koa2-builder.

##  To generate APIs Document
```
npm install apidoc -g
```

Run apidoc generator under the <dirName> (default port is 3088)
```
npm run doc
```
[http://127.0.0.1:3088/doc/](http://127.0.0.1:3088/doc/)
You can modified the port in developer.js and production.js in config folder.

##  To generate the Test Report
To generate the test report using mocha (default port is 3088)
```
npm run test
```

[http://127.0.0.1:3088/report/](http://127.0.0.1:3088/report/)
You can modified the port in developer.js and production.js in config folder.

##  Your project logs location
Response logs
```
<dirName>/logs/response/response--YYYY-MM-DD.log
```

Error logs
```
<dirName>/logs/error/error--YYYY-MM-DD.log
```

##  Your project output format

If there is no error occured, **code will be 0**
Standard output format example
```
{
  "code": 0,
  "message": "success"
}
```

Standard output format with result return example
```
{
  "code": 0,
  "message": "success",
  "result": {
    ...
  }
}
```

Standard output format with **multi** results return example
```
{
  "code": 0,
  "message": "success",
  "result": [{
      ...
  }]
}
```

If there is an error which is not from the server api, it will give the **code > 0**
Error output format examples
```
{
  "code": 11000,
  "message": "E11000 duplicate key error collection: users index: account_1 dup key: { : \"f124226244\" }"
}
```

If there is an error which is from the server api, it will give ethe **code < 0**
Error output format examples
```
{
  "code": -1,
  "message": "unknown error"
}
```
