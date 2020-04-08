/*
 * @Author: xiaorujun
 * @Description: 对外提供服务模块
 * @Date: 2020-04-03 17:46:44
 * @Last Modified by: xiaorujun
 */
const { expect } = require('chai')
const Http = require('./Http')
const filters = require('./filters')
const utils = require('./utils')




module.exports = class Service {
  constructor (configs = {}, options = {}) {
    if (!(this instanceof Service)) {
      return new Service(configs, options)
    }

    const {
      host,
      key,
      secret
    } = configs

    expect(host).to.match(utils.HOST_REGEX)
    expect(typeof key).a('string').lengthOf.above(0)
    expect(typeof secret).a('string').lengthOf.above(0)

    const {
      timeout = utils.DEFAULT_TIMEOUT,
      errorCodePrefix = utils.DEFAULT_ERROR_CODE_PREFIX
    } = options

    this.host = host
    this.key = key
    this.secret = secret
    this.timeout = Number.parseInt(timeout) ||
      utils.DEFAULT_TIMEOUT
    this.errorCodePrefix = errorCodePrefix

    this.http = new Http({
      host, key, secret, timeout
    })
  }



  /**
   * 获取套件信息
   *
   * @param {string[]} numbers - 套件编码列表
   *
   * @returns {Promise<Object>}
   * ```javascript
   * return {
   *   result: [{
   *     number: String, // 套件编码
   *     omic: String, // 所在组学
   *     surveyId: Number // 文件id
   *   }]
   * }
   * ```
   */
  getSampleData (numbers) {
    expect(numbers).to.be.an('array')

    return this.http.reqSampleData(numbers).then(({
      error,
      message,
      result: list
    }) => {
      if (error) {
        return Promise.resolve({ code: 1, message })
      }

      const result = list.map(filters.sampleData)

      return Promise.resolve({ result })
    })
  }


  /**
   * 404
   *
   * @returns {Promise<Object>}
   * ```javascript
   * return {
   *   code: Number,
   *   message: String
   * }
   * ```
   */
  getNotFound () {
    return this.http.reqNotFound().then(({
      error,
      message
    }) => {
      if (error) {
        return Promise.resolve({ code: 4, message })
      }

      return {}
    })
  }
}
