/*
 * @Author: xiaorujun
 * @Description: 工具箱
 * @Date: 2020-04-07 15:28:22
 * @Last Modified by: xiaorujun
 */
const _ = require('lodash')
const searchFilters = require('./searchFilters')



// host regex
exports.HOST_REGEX = /^((ht|f)tps?:\/\/)?[\w-]+(\.[\w-]+)+(:\d{1,5})?\/?$/



// specifies the number of milliseconds before the request times out.
exports.DEFAULT_TIMEOUT = 30 * 1000



// return data key naming, default camelize with first letter is lowercase.
exports.DEFAULT_INFLECTION = 'camelize'



// error code prefix
exports.DEFAULT_ERROR_CODE_PREFIX = ''



// search scope
// 位点搜索不可和其它scope一块搜索
exports.SEARCH_SCOPES = [
  { app: 'application', pvt: 'app', default: true }, // 应用
  { app: 'report', pvt: 'report', default: true }, // 报告内容
  { app: 'locus', pvt: 'gene', default: false }, // 位点
  { app: 'survey', pvt: 'survey', default: true } // 问卷
]



// 默认的搜索 scopes
exports.DEFAULT_SEARCH_SCOPES = _.filter(exports.SEARCH_SCOPES, {
  default: true
})



// 对不同 scope 搜索结果的过滤器
exports.searchFilters = searchFilters
