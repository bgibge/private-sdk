/*
 * @Author: xiaorujun
 * @Description: 向私有平台发出 HTTP 请求模块
 * @Date: 2020-04-07 16:13:13
 * @Last Modified by: xiaorujun
 */
const axios = require('axios')
const { expect } = require('chai')
const _ = require('lodash')
const qs = require('querystring')
const sign = require('./sign')




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
    if (!(this instanceof Http)) {
      return new Http(configs)
    }

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
      const status = error.response.status || 500

      return {
        data: {
          error: true,
          message: `私有平台：发生网络异常（${status}）`
        }
      }
    })
  }


  /**
   * 向私有平台发出请求套件信息
   *
   * @param {string[]} numbers - 套件编码数组
   *
   * @returns {Promise<Object>}
   * ```javascript
   * return {
   *   error: Boolean,
   *   message: String,
   *   result: Object
   * }
   * ```
   */
  reqSampleData (numbers) {
    expect(numbers).to.be.an('array')

    if (numbers.length === 0) {
      return []
    }

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
}
