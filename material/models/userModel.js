const
  _ = require('lodash'),
  db = require('./dbModel').mongoReturn(),
  userSchema = new db.Schema({
    user_id: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    roles: [{
      type: String
    }],
    groups: [{
      type: String
    }]
  }, {
    timestamps: true
  })

userSchema.index({
  'name': 1
}, {name: 'userList'})

userSchema.index({
  'email': 1
}, {name: 'userGetByEmail'})

userSchema.index({
  'groups': 1
}, {name: 'groupsUpdate'})

userSchema.index({
  'roles': 1
}, {name: 'userRolesUpdate'})

/**
 * User Class
 * 
 * @class UserModel
 */
class UserModel {
  constructor() {
    this.userModel = db.model('User', userSchema)
  }

  /**
   * Create a user account
   * 
   * @param {any} data {user_id: string, name: string, email: string,
   *  password: string}
   * @returns 
   * @memberof UserModel
   */
  async userCreate(data) {
    return await this.userModel.create(data)
  }

  /**
   * get the number of the users
   */
  async userCount() {
    return await this.userModel.count()
  }

  /**
   * Get the user information by the email
   * 
   * @param {email: String} data
   * @returns 
   * @memberof UserModel
   */
  async userGetByEmail(data) {
    const
      conditions = {
        email: data.email
      },
      fields = {
        __v: 0,
        _id: 0
      }
    let user = await this.userModel.findOne(conditions).select(fields).lean().exec()
    return user
  }

  /**
   * Get the user by user_id
   * 
   * @param {any} data {user_id: string}
   * @returns 
   * @memberof UserModel
   */
  async userGetByUserId(data) {
    const
      conditions = {
        user_id: data.user_id
      },
      fields = {
        __v: 0,
        _id: 0,
        password: 0
      }
    //let user = await this.userModel.findOne(conditions).populate({path: 'virtualGroup', select: fields}).select(fields).lean().exec()
    let user = await this.userModel.findOne(conditions).select(fields).lean().exec()
    return user
  }

  /**
   * return name of the user_id
   * 
   * @param {any} data {user_id_arr: [String]}
   * @returns 
   * @memberof UserModel
   */
  async userNameLookUp(data) {
    const
      conditions = {
        user_id: {
          $in: data.user_id_arr
        }
      },
      fields = {
        _id: 0,
        user_id: 1,
        name: 1
      }
    const userArr = await this.userModel.find(conditions).select(fields).lean().exec()
    const userObj = {}
    _.map(userArr, (user) => {
      userObj[user.user_id] = user.name
    })
    return userObj
  }

  /**
   * find the user by giving the user_id array
   * 
   * @param {user_id_arr: [String]} data 
   * @returns 
   * @memberof UserModel
   */
  async userFindByUserId(data) {
    const
      conditions = {
        user_id: {
          $in: data.user_id_arr
        }
      },
      fields = {
        __v: 0,
        _id: 0,
        password: 0
      }
    return await this.userModel.find(conditions).select(fields).lean().exec()
  }

  /**
   * List all the users without password
   * 
   * @param {Object} data optional {num: Number, jump: Number} 
   * @returns user object
   * @memberof UserModel
   */
  async userList(data) {
    const
      fields = {
        __v: 0,
        _id: 0,
        password: 0
      }
    let response = await Promise.all([
      this.userModel.find()
        .select(fields)
        .skip(data.jump)
        .limit(data.num)
        .sort({ name: 1 })
        .lean()
        .exec(),
      this.userModel.find().count()
    ])
    return {res: response[0], total: response[1]}
  }

  /**
   * Return the value of emialVerified of the user
   * 
   * @param {email: String} data 
   * @returns Boolean
   * @memberof UserModel
   */
  async isUserVerified(data) {
    const conditions = {},
      fields = {
        _id: 0,
        emailVerified: 1
      }
    if (data.staff_id) {
      conditions.user_id = data.staff_id 
    } else if (data.email) {
      conditions.email = data.email
    }

    let user = await this.userModel.findOne(conditions).select(fields).lean().exec()
    if (_.isEmpty(user) === true) {
      user = {
        isVerified: false
      }
    } else {
      user = {
        isVerified: user.emailVerified
      }
    }
    return user
  }

  /**
   * Update the user's information
   * 
   * @param {user_id: String, update: Object} data 
   * @returns user object
   * @memberof UserModel
   */
  async userUpdate(data) {
    const
      conditions = {
        user_id: data.user_id
      },
      update = data.update,
      options = {
        new: true
      },
      fields = {
        _id: 0,
        __v: 0,
        password: 0
      }

    const user = await this.userModel.findOneAndUpdate(conditions, update, options).select(fields).exec()
    return user
  }

  /**
   * Drop the user
   * 
   * @param {mobile: String} data 
   * @returns 
   * @memberof UserModel
   */
  async userDrop(data) {
    const
      conditions = {}

    if (data.email) {
      conditions.email = data.email
    } else if (data.staff_id) {
      conditions.user_id = data.staff_id
    } else {
      return
    }
    return await this.userModel.remove(conditions)
  }

  /**
   * Replace the old groupName with new groupName in groups
   * 
   * @param {oldGroupName: String, groupName: String} data 
   * @returns 
   * @memberof UserModel
   */
  async groupsUpdate(data) {
    const
      conditions = {
        groups: data.oldGroupName
      },
      options = {
        new: true,
        multi: true
      }
    let
      update = {
        $push: {
          groups: data.groupName
        }
      }
      
    await this.userModel.update(conditions, update, options).exec()
    update = {
      $pullAll: {
        groups: [data.oldGroupName]
      }
    }
    return await this.userModel.update(conditions, update, options).exec()
  }

  /**
   * add a group to the user
   * 
   * @param {staff_id: String, groupName: String} data 
   * @returns 
   * @memberof UserModel
   */
  async groupsAdd(data) {
    const
      conditions = {
        user_id: data.staff_id
      },
      update = {
        $addToSet: {
          groups: data.groupName
        }
      },
      options = {
        new: true
      }
    return await this.userModel.findOneAndUpdate(conditions, update, options).exec()
  }

  /**
   * remove the group from the user
   * 
   * @param {staff_id: String, groupName: String} data 
   * @returns 
   * @memberof UserModel
   */
  async groupsRemove(data) {
    const
      conditions = {
        user_id: data.staff_id
      },
      update = {
        $pullAll: {
          groups: [data.groupName]
        }
      },
      options = {
        new: true
      }
    return await this.userModel.findOneAndUpdate(conditions, update, options).exec()
  }

  /**
   * Replace the old roleName with new roleName in roles
   * 
   * @param {oldRoleName: String, roleName: String} data 
   * @returns 
   * @memberof UserModel
   */
  async userRolesUpdate(data) {
    const
      conditions = {
        roles: data.oldRoleName
      },
      options = {
        multi: true
      }
    let
      update = {
        $push: {
          roles: data.roleName
        }
      }
      
    await this.userModel.update(conditions, update, options).exec()
    update = {
      $pullAll: {
        roles: [data.oldRoleName]
      }
    }
    return await this.userModel.update(conditions, update, options).exec()
  }

  async userRolesList(data) {
    const
      conditions = {
        user_id: data.user_id
      },
      fields = {
        _id: 0,
        roles: 1
      }
    return await this.userModel.findOne(conditions).select(fields).lean().exec()
  }
}

module.exports = UserModel