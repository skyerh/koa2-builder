const
  app = require('../app'),
  crypto = require('../utils/crypto'),
  expect = require('chai').expect,
  request = require('supertest'),
  adminEmail = 'admin@mailinator.com',
  adminGroup = 'RD',
  adminRole = 'admin',
  dealerEmail = 'dealer@mailinator.com',
  testEmail = 'test@email.com',
  dealerGroup = 'forTest',
  testPassword = "123123",
  dealerRole = 'dealer',
  UserModel = require('../models/userModel'),
  userModel = new UserModel()

describe('User APIs Test', () => {
  let
    admin = {},
    dealer = {},
    invitationCode = ''
  
  before(async () => {
    const data = {
      email: testEmail
    }
    await userModel.userDrop(data)
  })
  
  before(async () => {
    const data = {
      email: adminEmail
    }
    admin = await userModel.userGetByEmail(data)
    admin.token = 'Bearer ' + crypto.jwtSign({ user_id: admin.user_id })
  })

  before(async () => {
    const data = {
      email: dealerEmail
    }
    dealer = await userModel.userGetByEmail(data)
    dealer.token = 'Bearer ' + crypto.jwtSign({ user_id: dealer.user_id })
  })

  describe('POST /api/user/invite (email)', () => {
    it ('should return error code -5 if the authorization is missing', async () => {
      return await request(app.listen())
        .post('/api/user/invite')
        .send({
          "email": testEmail,
          "groups": [dealerGroup],
          "roles": [dealerRole]
        })
        .set('Content-Type', 'application/json')
        //.set('Authorization', admin.token)
        .expect(400)
        .then((response) => {
          expect(response.body.code).to.equal(-5)
        })
    })

    it ('should return error code -403 if it ran under the dealer role', async () => {
      return await request(app.listen())
        .post('/api/user/invite')
        .send({
          "email": testEmail,
          "groups": [dealerGroup],
          "roles": [dealerRole]
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', dealer.token)
        .expect(400)
        .then((response) => {
          expect(response.body.code).to.equal(-403)
        })
    })
    
    it ('should return error code -3 if the email is missing', async () => {
      return await request(app.listen())
        .post('/api/user/invite')
        .send({
          //"email": testEmail,
          "groups": [dealerGroup],
          "roles": [dealerRole]
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', admin.token)
        .expect(400)
        .then((response) => {
          expect(response.body.code).to.equal(-3)
        })
    })

    it ('should return error code -3 if the groups is missing', async () => {
      return await request(app.listen())
        .post('/api/user/invite')
        .send({
          "email": testEmail,
          //"groups": [dealerGroup],
          "roles": [dealerRole]
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', admin.token)
        .expect(400)
        .then((response) => {
          expect(response.body.code).to.equal(-3)
        })
    })

    it ('should return error code -3 if the roles is missing', async () => {
      return await request(app.listen())
        .post('/api/user/invite')
        .send({
          "email": testEmail,
          "groups": [dealerGroup],
          //"roles": [dealerRole]
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', admin.token)
        .expect(400)
        .then((response) => {
          expect(response.body.code).to.equal(-3)
        })
    })
    
    it ('should return error code -3 if the groups is not an array', async () => {
      return await request(app.listen())
        .post('/api/user/invite')
        .send({
          "email": testEmail,
          "groups": dealerGroup,
          "roles": [dealerRole]
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', admin.token)
        .expect(400)
        .then((response) => {
          expect(response.body.code).to.equal(-3)
        })
    })

    it ('should return error code -3 if the groups is not a single array', async () => {
      return await request(app.listen())
        .post('/api/user/invite')
        .send({
          "email": testEmail,
          "groups": [dealerGroup, adminGroup],
          "roles": [dealerRole]
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', admin.token)
        .expect(400)
        .then((response) => {
          expect(response.body.code).to.equal(-3)
        })
    })

    it ('should return error code -3 if the roles is not array', async () => {
      return await request(app.listen())
        .post('/api/user/invite')
        .send({
          "email": testEmail,
          "groups": [dealerGroup],
          "roles": dealerRole
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', admin.token)
        .expect(400)
        .then((response) => {
          expect(response.body.code).to.equal(-3)
        })
    })

    it ('should return error code -3 if the roles is not a single array', async () => {
      return await request(app.listen())
        .post('/api/user/invite')
        .send({
          "email": testEmail,
          "groups": [dealerGroup],
          "roles": [dealerRole, adminRole]
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', admin.token)
        .expect(400)
        .then((response) => {
          expect(response.body.code).to.equal(-3)
        })
    })
    
    it ('should return success and invitation code if all the fields are correct', async () => {
      return await request(app.listen())
        .post('/api/user/invite')
        .send({
          "email": testEmail,
          "groups": [dealerGroup],
          "roles": [dealerRole]
        })
        .set('Content-Type', 'application/json')
        .set('Authorization', admin.token)
        .expect(200)
        .then((response) => {
          expect(response.body.code).to.equal(0)
          expect(response.body.message).to.equal('success')
          expect(response.body.result).to.be.a('string')
          invitationCode = response.body.result
        })
    })
  })
    
  describe('POST /api/user/create (email)', () => {
    it ('should return error code -3 if the groups is not an array', async () => {
      return await request(app.listen())
        .post('/api/user/create')
        .send({
          "password": testPassword,
          "email": testEmail,
          "name": "Skyer",
          "groups": dealerGroup,
          "roles": [dealerRole],
          "invitationCode": invitationCode
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .then((response) => {
          expect(response.body.code).to.equal(-3)
        })
    })

    it ('should return error code -3 if the groups is not a single array', async () => {
      return await request(app.listen())
        .post('/api/user/create')
        .send({
          "password": testPassword,
          "email": testEmail,
          "name": "Skyer",
          "groups": [dealerGroup, adminGroup],
          "roles": [dealerRole],
          "invitationCode": invitationCode
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .then((response) => {
          expect(response.body.code).to.equal(-3)
        })
    })

    it ('should return error code -3 if the roles is not an array', async () => {
      return await request(app.listen())
        .post('/api/user/create')
        .send({
          "password": testPassword,
          "email": testEmail,
          "name": "Skyer",
          "groups": [dealerGroup],
          "roles": dealerRole,
          "invitationCode": invitationCode
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .then((response) => {
          expect(response.body.code).to.equal(-3)
        })
    })

    it ('should return error code -3 if the roles is not a single array', async () => {
      return await request(app.listen())
        .post('/api/user/create')
        .send({
          "password": testPassword,
          "email": testEmail,
          "name": "Skyer",
          "groups": [dealerGroup],
          "roles": [dealerRole, adminGroup],
          "invitationCode": invitationCode
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .then((response) => {
          expect(response.body.code).to.equal(-3)
        })
    })
    
    it ('should return error code -3 if the inivtationCode is missing', async () => {
      return await request(app.listen())
        .post('/api/user/create')
        .send({
          "password": testPassword,
          "email": testEmail,
          "name": "Skyer",
          "groups": [dealerGroup],
          "roles": [dealerRole],
          //"invitationCode": invitationCode
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .then((response) => {
          expect(response.body.code).to.equal(-3)
        })
    })

    it ('should return error code -105 if the inivtationCode is incorrect', async () => {
      return await request(app.listen())
        .post('/api/user/create')
        .send({
          "password": testPassword,
          "email": testEmail,
          "name": "Giraffe",
          "groups": [dealerGroup],
          "roles": [dealerRole],
          "invitationCode": 'xxxxx'
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .then((response) => {
          expect(response.body.code).to.equal(-105)
        })
    })
    
    it ('should return error code -106 if the inivtation email is not matched', async () => {
      return await request(app.listen())
        .post('/api/user/create')
        .send({
          "password": testPassword,
          "email": 'wrong_mail@mailinator.com',
          "name": "Skyer",
          "groups": [dealerGroup],
          "roles": [dealerRole],
          "invitationCode": invitationCode
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .then((response) => {
          expect(response.body.code).to.equal(-106)
        })
    })

    it ('should return error code -106 if the inivtation groups is not matched', async () => {
      return await request(app.listen())
        .post('/api/user/create')
        .send({
          "password": testPassword,
          "email": testEmail,
          "name": "Skyer",
          "groups": [adminGroup],
          "roles": [dealerRole],
          "invitationCode": invitationCode
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .then((response) => {
          expect(response.body.code).to.equal(-106)
        })
    })

    it ('should return error code -106 if the inivtation roles is not matched', async () => {
      return await request(app.listen())
        .post('/api/user/create')
        .send({
          "password": testPassword,
          "email": testEmail,
          "name": "Skyer",
          "groups": [dealerGroup],
          "roles": [adminRole],
          "invitationCode": invitationCode
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .then((response) => {
          expect(response.body.code).to.equal(-106)
        })
    })

    it ('should return success and the user information if all the post data are correct', async () => {
      return await request(app.listen())
        .post('/api/user/create')
        .send({
          "password": testPassword,
          "email": testEmail,
          "name": "Skyer",
          "groups": [dealerGroup],
          "roles": [dealerRole],
          "invitationCode": invitationCode
        })
        .set('Content-Type', 'application/json')
        .expect(200)
        .then((response) => {
          expect(response.body.code).to.equal(0)
          expect(response.body.message).to.equal('success')
          expect(response.body.result.email).to.equal(testEmail)
          expect(response.body.result).has.not.property('password')
          expect(response.body.result.emailVerified).to.equal(true)
          expect(response.body.result).to.have.property('roles').that.is.an('array')
          expect(response.body.result.roles[0]).to.equal(dealerRole)
          expect(response.body.result).to.have.property('groups').that.is.an('array')
          expect(response.body.result.groups[0]).to.equal(dealerGroup)
        })
    })

    it ('should return error code -104 if the user has already registered', async () => {
      return await request(app.listen())
        .post('/api/user/create')
        .send({
          "password": testPassword,
          "email": testEmail,
          "name": "Skyer",
          "groups": [dealerGroup],
          "roles": [dealerRole],
          "invitationCode": invitationCode
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .then((response) => {
          expect(response.body.code).to.equal(-104)
        })
    })
  })
})