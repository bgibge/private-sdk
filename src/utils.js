/*
 * @Author: xiaorujun
 * @Description: 正则表达式
 * @Date: 2020-04-07 15:28:22
 * @Last Modified by: xiaorujun
 */


// host regex
exports.HOST_REGEX = /^((ht|f)tps?:\/\/)?[\w-]+(\.[\w-]+)+(:\d{1,5})?\/?$/



// specifies the number of milliseconds before the request times out.
exports.DEFAULT_TIMEOUT = 30 * 1000



// return data key naming, default camelize with first letter is lowercase.
exports.DEFAULT_INFLECTION = 'camelize'



// error code prefix
exports.DEFAULT_ERROR_CODE_PREFIX = ''
