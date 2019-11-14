const
  db = require('./dbModel').mongoReturn(),
  userSchema = new db.Schema({
    user_id: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
    },
    countryCode: {
      type: String,
    },
    lastSync: {
      file: { type: Number },
      patient: { type: Number },
    },
    mobile: {
      type: String,
      trim: true,
    },
    mobileVerified: {
      type: Boolean,
      default: false,
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
      required: true,
    },
    authy_id: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    roles: {},
  }, {
    timestamps: true,
  })

userSchema.index(
  { user_id: 1 },
  { name: 'userId' },
)

userSchema.index(
  { email: 1 },
  { name: 'email' },
)

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
    return this.userModel.create(data)
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
        email: data.email,
      },
      fields = {
        __v: 0,
        _id: 0,
      }
    return this.userModel.findOne(conditions).select(fields).lean().exec()
  }

  /**
   * Get the user information by the mobile
   *
   * @param {mobile: String} data
   * @returns
   * @memberof UserModel
   */
  async userGetByMobile(data) {
    const
      conditions = {
        countryCode: data.countryCode,
        mobile: data.mobile,
      },
      fields = {
        __v: 0,
        _id: 0,
      }
    return this.userModel.findOne(conditions).select(fields).lean().exec()
  }

  /**
   * get the user list by the group name of the roles
   *
   * @param {*} data
   * @returns
   * @memberof UserModel
   */
  async userListByRolesGroup(data) {
    const
      conditions = {
        [`roles.${data.group}`]: {
          $exists: true,
        },
      },
      fields = {
        _id: 0,
        user_id: 1,
      }
    return this.userModel.find(conditions).select(fields).lean().exec()
  }

  /**
   * drop the group from user (includes all the roles)
   *
   * @param {*} data {user_id_arr: [string], group: string}
   * @returns
   * @memberof UserModel
   */
  async userGroupDropByList(data) {
    const
      conditions = {
        user_id: {
          $in: data.user_id_arr,
        },
      },
      update = {
        $unset: {
          [`roles.${data.group}`]: '',
        },
      }
    return this.userModel.updateMany(conditions, update).lean().exec()
  }

  /**
   * Get the user by user_id
   *
   * @param {{user_id: string}} data
   * @returns user object
   * @memberof UserModel
   */
  async userGetByUserId(data) {
    const
      conditions = {
        user_id: data.user_id,
      },
      fields = {
        __v: 0,
        _id: 0,
        password: 0,
      }
    return this.userModel.findOne(conditions).select(fields).lean().exec()
  }

  /**
   * Get the user by staff_id
   * it is mainly for the user want to check the staff but restricted to the same group
   *
   * @param {any} data {staff_id: string, group: string}
   * @returns
   * @memberof UserModel
   */
  async userGetByStaffId(data) {
    const
      conditions = {
        user_id: data.staff_id,
        [`roles.${data.group}`]: {
          $exists: true,
        },
      },
      fields = {
        __v: 0,
        _id: 0,
        password: 0,
      }
    return this.userModel.findOne(conditions).select(fields).lean().exec()
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
          $in: data.user_id_arr,
        },
      },
      fields = {
        _id: 0,
        user_id: 1,
        name: 1,
      }
    const userArr = await this.userModel.find(conditions).select(fields).lean().exec()
    const userObj = {}
    userArr.forEach((user) => {
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
          $in: data.user_id_arr,
        },
      },
      fields = {
        __v: 0,
        _id: 0,
        password: 0,
      }
    return this.userModel.find(conditions).select(fields).lean().exec()
  }

  /**
   * List all the users without password
   *
   * @param {Object} data {group: string, num: Number, jump: Number}
   * @returns user object
   * @memberof UserModel
   */
  async userList(data) {
    const
      conditions = {
        groups: data.group,
      },
      fields = {
        __v: 0,
        _id: 0,
        password: 0,
      }
    const response = await Promise.all([
      this.userModel.find(conditions)
        .select(fields)
        .skip(data.jump)
        .limit(data.num)
        .sort({ name: 1 })
        .lean()
        .exec(),
      this.userModel.find(conditions).lean().exec(),
    ])
    return { res: response[0], total: response[1].length }
  }

  /**
   * Return the value of emialVerified and mobileVerified of the user
   *
   * @param {mobile: String || user_id: String} data
   * @returns Boolean
   * @memberof UserModel
   */
  async isUserVerified(data) {
    const conditions = {},
      fields = {
        _id: 0,
        emailVerified: 1,
        mobileVerified: 1,
      }
    if (data.staff_id) {
      conditions.user_id = data.staff_id
    } else if (data.mobile) {
      conditions.mobile = data.mobile
    } else if (data.email) {
      conditions.email = data.email
    }

    let user = await this.userModel.findOne(conditions).select(fields).lean().exec()
    if (!user) {
      user = {
        emailVerified: false,
        mobileVerified: false,
      }
    }
    return user
  }

  /**
   * use user_id to update the user information
   *
   * @param {{update: {
   *  name: string,
   *  password: string,
   *  license: string,
   *  hospital: string}, user_id: string}} data
   * @returns
   * @memberof UserModel
   */
  async userUpdate(data) {
    const
      conditions = {
        user_id: data.user_id,
      },
      { update } = data,
      options = {
        new: true,
      },
      fields = {
        _id: 0,
        __v: 0,
        password: 0,
      }

    return this.userModel.findOneAndUpdate(conditions, update, options).select(fields).lean().exec()
  }

  /**
   * set the emailVerified true or false
   *
   * @param {*} data {email: string, emailVerified: boolean}
   * @returns
   * @memberof UserModel
   */
  async userVerify(data) {
    const
      conditions = {
        email: data.email,
      },
      update = {
        $set: {
          emailVerified: data.emailVerified,
        },
      },
      options = {
        new: true,
      },
      fields = {
        _id: 0,
        __v: 0,
        password: 0,
      }
    const user = this.userModel.findOneAndUpdate(conditions, update, options)
      .select(fields)
      .exec()
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

    if (data.mobile) {
      conditions.mobile = data.mobile
    } else if (data.email) {
      conditions.email = data.email
    } else {
      conditions.user_id = data.staff_id
    }
    return this.userModel.remove(conditions)
  }

  /**
   * add a role to the user
   *
   * @param {*} data {staff_id: String, group: String, roleName: string}
   * @returns
   * @memberof UserModel
   */
  async userRoleAdd(data) {
    const
      conditions = {
        user_id: data.staff_id,
      },
      update = {
        $addToSet: {
          [`roles.${data.group}`]: data.roleName,
        },
      },
      options = {
        new: true,
      },
      fields = {
        __v: 0,
        _id: 0,
      }
    return this.userModel.findOneAndUpdate(conditions, update, options).select(fields).lean().exec()
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
        roles: data.oldRoleName,
      },
      options = {
        multi: true,
      }
    let
      update = {
        $push: {
          roles: data.roleName,
        },
      }

    await this.userModel.update(conditions, update, options).exec()
    update = {
      $pullAll: {
        roles: [data.oldRoleName],
      },
    }
    return this.userModel.update(conditions, update, options).exec()
  }

  /**
   * set the user roles
   *
   * @param {*} data {update: {group: [roleName, roleName...]}, user_id: string}
   * @returns
   * @memberof UserModel
   */
  userRolesSet(data) {
    const
      conditions = {
        user_id: data.user_id,
      },
      update = {
        $set: {
          roles: data.update,
        },
      },
      options = { new: true }
    return this.userModel.findOneAndUpdate(conditions, update, options).exec()
  }

  /**
   * drop all the roles from the specific group
   *
   * @param {*} data {group: string, roleName: String}
   * @returns
   * @memberof UserModel
   */
  userRoleDrop(data) {
    const
      conditions = {
        [`roles.${data.group}`]: data.roleName,
      },
      update = {
        $pull: {
          [`roles.${data.group}`]: data.roleName,
        },
      },
      options = {
        new: true,
      }
    return this.userModel.updateMany(conditions, update, options).lean().exec()
  }

  /**
   * list the user group roles by group name
   *
   * @param {*} data {user_id: string, groups: string}
   * @returns
   * @memberof UserModel
   */
  async userRolesList(data) {
    const
      conditions = {
        user_id: data.user_id,
        groups: data.group,
      },
      fields = {
        _id: 0,
        roles: 1,
      }
    const user = await this.userModel.findOne(conditions).select(fields).lean().exec()
    if (user.roles) {
      return user.roles[data.group]
    }
    return []
  }

  /**
   * update the user's avatar
   *
   * @param {{user_id: string, avatarUrl: string}} data
   * @returns
   * @memberof UserModel
   */
  async userAvatarUpdate(data) {
    const
      conditions = {
        user_id: data.user_id,
      },
      update = {
        $set: {
          avatar: data.avatarUrl,
        },
      },
      fields = {
        _id: 0,
        __v: 0,
      },
      options = {
        new: true,
      }
    return this.userModel.findOneAndUpdate(conditions, update, options)
      .select(fields)
      .lean()
      .exec()
  }
}

module.exports = UserModel
