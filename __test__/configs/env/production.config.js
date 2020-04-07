/*
 * @Author: xiaorujun
 * @Description: 生产环境配置
 * @Date: 2020-04-07 16:46:02
 * @Last Modified by: xiaorujun
 */
const defaultConfig = require('./default.config')




module.exports = Object.assign(defaultConfig, {
  env: 'production',
  host: 'https://api.private.omgut.com',
  key: 'qX3NZtMd5bGjy6hHRNIxIGD9G8Ntice0gnVlWnwU',
  secret: 'jHSHh0XZ5lFmtl3uuk65qS0YRjxdg7KeekjdTFdZwg10M4OLMjRRgIBzRhTfyZ2KZSQcIInMYKyCGdKK3Tlm8H0DL3pZBCAutDFqVKp2DIDIwlzRwECJ89AlpOJjbD73'
})
