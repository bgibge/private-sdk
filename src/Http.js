/*
 * @Author: xiaorujun
 * @Description: 向私有平台发出 HTTP 请求模块
 * @Date: 2020-04-07 16:13:13
 * @Last Modified by: xiaorujun
 */
const axios = require('axios')
const { expect } = require('chai')
const inflection = require('inflection')
const _ = require('lodash')
const qs = require('querystring')
const sign = require('./utils/sign')




// eslint-disable-next-line no-unused-vars
module.exports = class Http { // Class
  /**
   * @constructor
   * @param {Object} configs - 配置对象
   * @param {string} configs.host - url 地址
   * @param {string} configs.key - private key
   * @param {string} configs.secret - private secret
   * @param {number} configs.timeout - request timeout
   *
   */
  constructor (configs = {}) {
    const {
      host,
      key,
      secret,
      timeout
    } = configs

    this.key = key
    this.secret = secret
    this.axios = axios.create({
      timeout,
      baseURL: host
    })

    this.axios.interceptors.response.use(rspns => {
      if (+rspns.data.code === 0) {
        return {
          message: 'success',
          result: rspns.data.data
        }
      } else {
        const message = rspns.data.msg || '未知异常'

        return {
          error: true,
          message: '私有平台：' + message
        }
      }
    }, function (error) {
      let status = (error.response || {}).status || 500

      if ((/timeout/).test(error.message)) {
        status = 408
      }

      return {
        error: true,
        message: `私有平台：发生网络异常（${status}）`
      }
    })
  }


  /**
   * 向私有平台请求不存在的接口
   */
  reqNotFound () {
    return this.axios.get('/openbge/notFound')
  }


  /**
   * 向私有平台请求套件信息
   *
   * @param {string[]} numbers - 套件编码数组
   *
   * @returns {Promise<Object>}
   * ```javascript
   * return {
   *   error: Boolean,
   *   message: String,
   *   result: [Object]
   * }
   * ```
   */
  reqSampleData (numbers) {
    expect(numbers).to.be.an('array').not.empty

    const reqData = {
      page: 1,
      limit: 1000,
      biosample_id: numbers.join(',')
    }

    // 签名
    const signature = sign({
      key: this.key,
      secret: this.secret
    })

    return this.axios.post(
      '/openbge/samples',
      qs.stringify(_.assign(reqData, signature)) //
    )
  }


  /**
   * 向私有平台请求套件答卷
   *
   * @param {Object[]} conditions - 查询条件
   * @param {String} conditions[].userId - 用户id
   * @param {String} conditions[].number - 套件编码
   * @param {String} conditions[].surveyId - 问卷id
   *
   * @returns {Promise<Object>}
   * ```javascript
   * return {
   *   error: Boolean,
   *   message: String,
   *   result: [Object]
   * }
   * ```
   */
  reqSurveyRspns (conditions) {
    expect(conditions).to.be.an('array')

    const query = _.map(conditions, (item) => {
      return {
        user_id: item.userId,
        biosample_id: item.number,
        survey_id: item.surveyId
      }
    })

    const reqData = {
      query: JSON.stringify({
        query: {
          $in: query
        }
      })
    }

    // 签名
    const signature = sign({
      key: this.key,
      secret: this.secret
    }, reqData)

    return this.axios.post(
      '/openbge/response',
      qs.stringify(_.assign(reqData, signature)) //
    )
  }


  /**
   * 向私有平台请求向用户发送短信通知
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
  reqSendingSMS (phone, tmpl, data = {}) {
    expect(phone).to.be.a('string').not.empty
    expect(tmpl).to.be.a('string').not.empty

    if (data.nickname) {
      data.user_nick_name = data.nickname
      delete data.nickname
    }

    const reqData = {
      mobiles: phone,
      template: inflection.underscore(tmpl),
      ...data
    }

    // 签名
    const signature = sign({
      key: this.key,
      secret: this.secret
    }, reqData)

    return this.axios.post(
      '/service/sms',
      qs.stringify(_.assign(reqData, signature)) //
    )
  }


  /**
   * 向私有平台请求报告的基因型数据
   *
   * @param {string} number - 套件编码
   * @param {string[]} rsids - rs 位点id 列表
   */
  reqVariants (number, rsids) {
    expect(number).to.be.a('string').not.empty
    expect(rsids).to.be.an('array')

    const reqData = {
      biosample_id: number,
      rsids: rsids.join(',')
    }

    // 签名
    const signature = sign({
      key: this.key,
      secret: this.secret
    }, reqData)

    return this.axios.post(
      '/v2/openbge/genome/variant',
      qs.stringify(_.assign(reqData, signature)) //
    )
  }


  /**
   * 搜索
   *
   * @param {Object} conditions - 搜索条件
   * @param {string} conditions.number - 套件编码
   * @param {string} conditions.query - 搜索内容
   * @param {string} conditions.scopes - 搜索范围
   * @param {number} conditions.page - 指定第几页
   * @param {number} conditions.limit - 指定返回记录的数量
   *
   * @returns {Promise<Object>}
   * ```
   * return {
   *   page: Number, // 当前页
   *   limit: Number, // 返回记录数
   *   count: Number, // 记录数
   *   pages: Number, // 总页数
   *   total: Number, // 记录总数
   *   result: [Object]
   * }
   * ```
   */
  reqSearch (conditions) {
    const {
      number,
      query,
      scopes,
      page,
      limit
    } = conditions

    expect(query).a('string').not.empty
    expect(scopes).a('string').not.empty
    expect(page).a('number').above(0)
    expect(limit).a('number').above(0)

    const reqData = {
      biosample_id: number,
      query,
      category: scopes,
      page,
      limit
    }

    // 签名
    const signature = sign({
      key: this.key,
      secret: this.secret
    }, reqData)

    return this.axios.post(
      '/openbge/search',
      qs.stringify(_.assign(reqData, signature)) //
    )
  }
}
