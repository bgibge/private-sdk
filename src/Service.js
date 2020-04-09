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
const pkg = require('../package.json')




const Service = module.exports = class Service {
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
   *   list: [{
   *     number: String, // 套件编码
   *     omic: String, // 所在组学
   *     surveyId: Number, // 问卷id
   *     samplingTime: Number // 采样日期
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

      return Promise.resolve({ list: result })
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


  /**
   * 获取套件答卷信息
   *
   * @param {Object[]} conditions - 查询条件
   * @param {String} conditions[].userId - 用户id
   * @param {String} conditions[].number - 套件编码
   * @param {String} conditions[].surveyId - 问卷id
   *
   * @returns {Promise<Object>}
   * ```javascript
   * return {
   *   list: [{
   *     number: String, // 套件编码
   *     surveyId: Number, // 问卷id
   *     responseId: Number // 答卷id
   *   }]
   * }
   * ```
   */
  getSurveyRspns (conditions) {
    expect(conditions).to.be.an('array')

    return this.http.reqSurveyRspns(conditions).then(({
      error,
      message,
      result: list
    }) => {
      if (error) {
        return Promise.resolve({ code: 2, message })
      }

      const result = list.map(itemData => {
        return {
          number: itemData.biosample_id,
          surveyId: itemData.survey_id,
          responseId: itemData.response_id,
          submitTime: Date.parse(itemData.submit_time) || null
        }
      })

      return Promise.resolve({ list: result })
    })
  }

  /**
   * 向用户发送短信通知
   *
   * @param {string} phone - 手机号码
   * @param {string} tmpl - 短信模版
   * @param {Object} data - 模版数据
   *
   * @returns {Promise<Object>}
   * ```javascript
   * return {
   *   message: String,
   *   time: Number
   * }
   * ```
   */
  sendingSMS (phone, tmpl, data = {}) {
    return this.http.reqSendingSMS(phone, tmpl, data).then(({
      error,
      message
    }) => {
      if (error) {
        return Promise.resolve({ code: 3, message })
      }

      return Promise.resolve({
        message: 'success',
        time: Date.now()
      })
    })
  }


  /**
   * 检查套件编码是否有效
   *
   * @param {string} number - 套件编码
   *
   * @returns {Promise<Object>}
   * ```javascript
   * return {
   *   flag: Boolean // 标识；false 无效，true 有效
   * }
   * ```
   */
  isVaildNumber (number) {
    expect(number).to.be.a('string').not.empty

    return this.http.reqSampleData([number]).then(({
      error,
      message,
      result: list
    }) => {
      if (error) {
        return Promise.resolve({ code: 5, message })
      }

      return Promise.resolve({
        number,
        flag: !!list[0] && !!list[0].biosample_id
      })
    })
  }
}




// Package info
Service.name = pkg.name
Service.version = pkg.version
