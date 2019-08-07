const
  db = require('./dbModel').mongoReturn(),
  roleSchema = new db.Schema({
    group: { type: String },
    roles: [{
      roleName: { type: String },
      isDefault: { type: Boolean, default: false },
      weight: { type: Number },
      description: { type: String },
      createdAt: { type: Date },
      updatedAt: { type: Date },
    }],
    isPublic: { type: Boolean, default: true },
    description: { type: String },
  }, { timestamps: true })

roleSchema.index(
  { roleName: 1, weight: -1 },
  { name: 'roleWeight' },
)

class RoleModel {
  constructor() {
    this.roleModel = db.model('Role', roleSchema)
  }

  /**
   * Create a new role to the group
   *
   * @param {any} data {
   *  group: string,
   *  roleName: string,
   *  weight: number,
   *  description: string,
   *  createdAt: date,
   *  updatedAt: date,
   * }
   * @returns
   * @memberof RoleModel
   */
  roleCreate(data) {
    const
      conditions = {
        group: data.group,
      },
      update = {
        $push: {
          roles: {
            roleName: data.roleName,
            weight: data.weight,
            description: data.description,
            isDefault: data.isDefault,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          },
        },
      },
      options = {
        new: true,
      },
      fields = {
        __v: 0,
        _id: 0,
      }
    return this.roleModel.findOneAndUpdate(conditions, update, options)
      .select(fields)
      .lean()
      .exec()
  }

  /**
   * return the role of the group
   *
   * @param {*} data {group: string, roleName: string}
   * @returns
   * @memberof RoleModel
   */
  async roleGet(data) {
    const
      conditions = {
        group: data.group,
        'roles.roleName': data.roleName,
      }
    const group = await this.roleModel.findOne(conditions).lean().exec()
    if (group) {
      let role
      group.roles.forEach((roleObj) => {
        if (roleObj.roleName === data.roleName) {
          role = roleObj
        }
      })
      return role
    }
    return group
  }

  /**
   * return the default role object
   *
   * @param {*} data {group: string}
   * @returns role object
   * @memberof RoleModel
   */
  async roleDefaultGet(data) {
    const
      conditions = {
        group: data.group,
      }
    const group = await this.roleModel.findOne(conditions).lean().exec()
    if (group) {
      let role = null
      group.roles.forEach((roleObj) => {
        if (roleObj.isDefault === true) {
          role = roleObj
        }
      })
      return role
    }
    return null
  }

  /**
   * return the all the roles under the group
   *
   * @param {*} data {group: string}
   * @returns
   * @memberof RoleModel
   */
  async roleList(data) {
    const
      conditions = {
        group: data.group,
      },
      fields = {
        _id: 0,
        __v: 0,
      }
    return this.roleModel.findOne(conditions)
      .select(fields)
      .lean()
      .exec()
  }

  /**
   * Update the role
   *
   * @param {any} data {oldRoleName: String}
   * @returns
   * @memberof RoleModel
   */
  roleUpdate(data) {
    const
      conditions = {
        roleName: data.oldRoleName,
      },
      { update } = data,
      options = {
        new: true,
      }
    return this.roleModel.findOneAndUpdate(conditions, update, options).exec()
  }

  /**
   * rename all the group
   *
   * @param {*} data
   * @returns
   * @memberof RoleModel
   */
  groupUpdate(data) {
    const
      conditions = {
        group: data.oldgroup,
      },
      update = {
        $set: {
          group: data.group,
          description: data.description,
        },
      },
      options = {
        new: true,
      },
      fields = {
        _id: 0,
        __v: 0,
        roles: 0,
      }
    if (data.oldgroup === data.group) {
      delete update.$set.group
    }

    return this.roleModel.findOneAndUpdate(conditions, update, options).select(fields).lean().exec()
  }

  /**
   * Create a new group
   *
   * @param {any} data
   * @returns
   * @memberof RoleModel
   */
  groupCreate(data) {
    return this.roleModel.create(data)
  }

  /**
   * get the group
   *
   * @param {*} data {group: string}
   * @returns
   * @memberof RoleModel
   */
  groupGet(data) {
    const
      conditions = {
        group: data.group,
      },
      fields = {
        _id: 0,
        __v: 0,
      }
    return this.roleModel.findOne(conditions).select(fields).lean().exec()
  }

  /**
   * list all the group
   *
   * @returns
   * @memberof RoleModel
   */
  groupList(data) {
    const
      fields = {
        __v: 0,
        _id: 0,
        roles: 0,
      }
    return this.roleModel.find()
      .sort({ updatedAt: 1 })
      .skip(data.jump)
      .limit(data.num)
      .select(fields)
      .lean()
      .exec()
  }

  /**
   * drop the tole by roleName
   *
   * @param {any} data { roleName: String }
   * @returns
   * @memberof RoleModel
   */
  roleDrop(data) {
    const
      conditions = {
        group: data.group,
      },
      update = {
        $pull: {
          roles: {
            roleName: data.roleName,
          },
        },
      },
      fields = {
        __v: 0,
        _id: 0,
      },
      options = {
        new: true,
      }
    return this.roleModel.findOneAndUpdate(conditions, update, options)
      .select(fields)
      .lean()
      .exec()
  }

  /**
   * drop all the roles by the group
   *
   * @param {*} data
   * @returns
   * @memberof RoleModel
   */
  groupDrop(data) {
    const
      conditions = {
        group: data.group,
      }
    return this.roleModel.deleteMany(conditions).exec()
  }

  /**
   * give roleName to get the weight
   *
   * @param {roleName: String} data
   * @returns
   * @memberof RoleModel
   */
  weightGetByRole(data) {
    const
      conditions = {
        roleName: data.roleName,
      },
      fields = {
        _id: 0,
        weight: 1,
      }
    let jsonFin = this.roleModel.findOne(conditions).select(fields).lean().exec()
    if (!jsonFin) {
      jsonFin = {
        weight: 0,
      }
    }
    return jsonFin
  }
}

module.exports = RoleModel
