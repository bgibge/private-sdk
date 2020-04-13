/*
 * @Author: xiaorujun
 * @Description: 对外提供服务模块
 * @Date: 2020-04-03 17:46:44
 * @Last Modified by: xiaorujun
 */
const { expect } = require('chai')
const _ = require('lodash')
const Http = require('./Http')
const filters = require('./filters')
const utils = require('./utils')
const pkg = require('../package.json')




const Service = module.exports = class Service {
  constructor (configs = {}, options = {}) {
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
    expect(numbers).to.be.an('array').not.empty

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
      message
    }) => {
      return Promise.resolve({ code: 4, message })
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


  /**
   * 向私有平台请求报告的基因型数据
   *
   * @param {string} number - 套件编码
   * @param {string[]} rsids - rs 位点id 列表
   *
   * @returns {Promise<Object>}
   * ```
   * return {
   *   list: [{
   *     chromosome: String, // 染色体编号
   *     position: Number, // rs位点位置
   *     isCall: Boolean, // 是否检出
   *     rsid: String, // RS code
   *     genotype: String // 基因型
   *   }]
   * }
   */
  getVariants (number, rsids) {
    expect(number).to.be.a('string').not.empty
    expect(rsids).to.be.an('array')

    return this.http.reqVariants(number, rsids).then(({
      error,
      message,
      result: list
    }) => {
      if (error) {
        return Promise.resolve({ code: 6, message })
      }

      return Promise.resolve({
        list: filters.pickVariants(list)
      })
    })
  }

  /**
   * 搜索
   *
   * @param {Object} params - 搜索参数
   * @param {string} params.number - 套件编码
   * @param {string} params.query - 搜索内容
   * @param {string[]} [params.scopes=['application', 'survey', 'report']] - 搜索范围
   * @param {number} [params.page=1] - 指定第几页
   * @param {number} [params.limit=10] - 指定返回记录的数量
   *
   * @returns {Promise<Object>}
   * ```
   * return {
   *   page: Number, // 当前页
   *   limit: Number, // 返回记录数
   *   pages: Number, // 总页数
   *   total: Number, // 记录总数
   *   list: [Object]
   * }
   * ```
   */
  doSearch (params = {}) {
    const {
      number,
      query,
      scopes = _.map(utils.DEFAULT_SEARCH_SCOPES, 'app'),
      page = 1,
      limit = 10
    } = params

    expect(query).a('string').not.empty

    const data = {}
    data.number = number
    data.query = query
    data.page = page
    data.limit = limit

    // 将 sdk 定义的 scope 转换成私有平台的定义
    data.scopes = _.reduce(scopes, (r, scope) => {
      const bar = _.find(utils.SEARCH_SCOPES, {
        app: scope
      })

      return r.concat(bar ? bar.pvt : scope)
    }, [])
    data.scopes = data.scopes.join(',')

    return this.http.reqSearch(data).then(({
      error,
      message,
      result
    }) => {
      if (error) {
        return Promise.resolve({ code: 7, message })
      }

      return Promise.resolve({
        page,
        limit,
        total: result.total,
        pages: result.pages,
        list: _.map(result.result, filters.searchItem)
      })
    })
  }
}




// Package info
Service.name = pkg.name
Service.version = pkg.version
