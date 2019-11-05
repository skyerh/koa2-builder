/**
 * Roles Based Access Control config setting
 */
module.exports = {
  root: {
    can: [],
    inherits: ['admin'],
  },
  admin: {
    can: [
      '/api/user/get',
      '/api/user/list',
      '/api/user/invite',
      '/api/user/isVerified',
    ],
    inherits: ['dealer'],
  },
  user: {
    can: [
      '/api/user/get',
      '/api/user/update',
    ],
  },
}
