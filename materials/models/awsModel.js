const
  AWS = require('aws-sdk'),
  s3Stream = require('s3-upload-stream'),
  config = require('../config/index')

class AWSModel {
  constructor() {
    this.s3Stream = s3Stream.client(new AWS.S3({
      accessKeyId: config.s3.accessKeyId,
      secretAccessKey: config.s3.secretAccessKey,
    }))
    this.s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      accessKeyId: config.s3.accessKeyId,
      secretAccessKey: config.s3.secretAccessKey,
    })
    AWS.config.setPromisesDependency()
  }

  /**
   * to get the signed url of the file in s3
   *
   * @param {{key: stirng}} data key is the file path in s3
   * @returns
   * @memberof AWSModel
   */
  s3FileDownload(data) {
    const linkUrlGet = () => {
      return new Promise((resolve, reject) => {
        this.s3.getSignedUrl('getObject', {
          Bucket: config.s3.Bucket,
          Key: data.key,
        }, (err, url) => {
          if (err) {
            reject(err)
          } else {
            resolve(url)
          }
        })
      })
    }
    return linkUrlGet(data)
  }

  /**
   * to get the file metadata in s3
   *
   * @param {{key: string}} data key is the file path in s3
   * @returns
   * @memberof AWSModel
   */
  s3HeadInfoGet(data) {
    const
      params = {
        Bucket: config.s3.Bucket,
        Key: data.key,
      }
    return new Promise((resolve, reject) => {
      this.s3.headObject(params, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  /**
   * drop the files
   *
   * @param {*} data {
   *  aws_objects_arr: [{Key: 'string'}]
   * }
   * @returns
   * @memberof AWSModel
   */
  s3FileDrop(data) {
    const params = {
      Bucket: config.s3.Bucket,
      Delete: {
        Objects: data.aws_objects_arr,
        Quiet: false,
      },
    }
    return new Promise((resolve, reject) => {
      this.s3.deleteObjects(params, (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }
}

module.exports = AWSModel
