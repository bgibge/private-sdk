/*
 * @Author: xiaorujun
 * @Description: 测试 timeout
 * @Date: 2020-04-13 18:11:01
 * @Last Modified by: xiaorujun
 */
const env = process.env.NODE_ENV || 'development'
const config = require(`./configs/env/${env}.config`)
const Service = require('../src/Service')




const service = new Service({
  host: config.host,
  key: config.key,
  secret: config.secret
}, {
  timeout: 1,
  errorCodePrefix: 80
})




describe('搜索：doSearch()', () => {
  const number = 'E-B19722207213'

  test('搜索网络超时：成功', () => {
    return service.doSearch({
      number,
      scopes: ['report'],
      query: '疾病'
    }).then(res => {
      expect(res).toEqual({
        code: 7,
        message: '私有平台：发生网络异常（408）'
      })
    })
  })
})
