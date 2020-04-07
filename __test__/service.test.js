/*
 * @Author: xiaorujun
 * @Description: Test `Service`
 * @Date: 2020-04-07 16:37:48
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
  timeout: 30 * 100,
  errorCodePrefix: 80
})



describe('获取套件信息：getSampleData()', () => {
  test('单个套件：正常', () => {
    const number = config.numbers[0]

    return service.getSampleData([
      number
    ]).then(data => {
      expect(data).toEqual({
        result: [{
          number,
          omic: 'genomics',
          surveyId: 5
        }]
      })
    })
  })
})

