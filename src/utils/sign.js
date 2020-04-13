/*
 * @Author: xiaorujun
 * @Description: 签名
 * @Date: 2020-04-03 17:03:59
 * @Last Modified by: xiaorujun
 */
const _ = require('lodash')
const moment = require('moment')
const qs = require('querystring')
const crypto = require('@bgibge/crypto')





/**
 * 私有平台接口签名参数
 *
 * @param {string} key - key
 * @param {string} secret - 秘钥
 * @param {Object} data - 其它数据
 *
 * @returns {Object}
 * ```javascript
 * return {
 *   app_key: String, // key
 *   signature_nonce: String, // 随机字符串
 *   timestamp: String, // 时间
 *   sign: String // 签名
 * }
 * ```
 */
module.exports = function sign ({ key, secret }, data) {
  const timestamp =
    moment().utcOffset(0).toISOString()
      .replace(/\.(\d+)Z/, 'Z')

  data = data || {}
  data = qs.stringify(data, ',', '=')
  data = _.filter(data.split(','), _.identity)

  const nonceStr =
    Math.random().toString(24).slice(-8)

  const params = [
    `app_key=${escape(key)}`,
    `timestamp=${escape(timestamp)}`,
    `signature_nonce=${escape(nonceStr)}`
  ].concat(data).sort()

  let tmpStr = escape(params.join('&'))

  tmpStr = 'abcdefghijklmnopqrstuvwxyz' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    '&' + tmpStr


  return {
    app_key: key,
    signature_nonce: nonceStr,
    timestamp,
    sign: crypto.hmac(tmpStr, secret + '&', {
      algorithm: 'sha1',
      encoding: 'base64'
    })
  }
}


/**
 * 转义特殊字符
 *
 * @param {string} str - 待转义字符串
 *
 * @returns {string} - new string
 */
function escape (str) {
  return qs.escape(str)
    .replace('*', '%2A').replace('%7E', '~')
}
