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
    const number = 'E-B19320110961'

    return service.getSampleData([
      number
    ]).then(data => {
      expect(data).toEqual({
        list: [{
          number,
          omic: 'genomics',
          surveyId: 93,
          samplingTime: null
        }]
      })
    })
  })

  test('无效套件编码：返回空数据', () => {
    const number = 'E-B19320110000'

    return service.getSampleData([
      number
    ]).then(data => {
      expect(data).toEqual({
        list: []
      })
    })
  })

  // test('参数错误', () => {
  //   const number = 'E-B19320110961'

  //   return service.getSampleData([
  //     number
  //   ]).then(data => {
  //     expect(data).toEqual({
  //       code: 1,
  //       message: '私有平台：参数错误'
  //     })
  //   })
  // })
})



describe('发生网络异常', () => {
  test('404', () => {
    return service.getNotFound().then(data => {
      expect(data).toEqual({
        code: 4,
        message: '私有平台：发生网络异常（404）'
      })
    })
  })
})



describe('发送短信通知：sendingSMS()', () => {
  const phone = '18938832473'
  const tmpl = 'microarray_delivery'
  const data = {
    nickname: '小小鸟'
  }

  test(`向 ${phone} 发送"芯片数据已完成解读"通知：成功`, () => {
    return service.sendingSMS(phone, tmpl, data).then(res => {
      expect(res.message).toBe('success')
      expect(res.time).toBeLessThan(Date.now())
    })
  })

  test(`向 ${phone} 发送不存在通知模版的短信：失败`, () => {
    return service.sendingSMS(phone, tmpl + 'a', data).then(res => {
      expect(res).toEqual({
        code: 3,
        message: '私有平台：短信模板不存在'
      })
    })
  })

  test(`向 ${phone} 发送"芯片数据已完成解读"通知时缺少您称：失败`, () => {
    return service.sendingSMS(phone, tmpl).then(res => {
      expect(res).toEqual({
        code: 3,
        message: '私有平台：参数错误'
      })
    })
  })
})



describe('检查套件编码是否有效：isVaildNumber()', () => {
  const number = 'E-B19320110961'

  test(`检查套件编码 ${number}：有效`, () => {
    return service.isVaildNumber(number).then(res => {
      expect(res).toEqual({
        number,
        flag: true
      })
    })
  })

  test(`检查套件编码 ${number + 1}：无效`, () => {
    return service.isVaildNumber(number + 1).then(res => {
      expect(res).toEqual({
        number: number + 1,
        flag: false
      })
    })
  })
})



describe('获取套件答卷信息：getSurveyRspns()', () => {
  const numbers = ['E-B19614288800', 'E-B19867009238']
  const userId = '5d649d868a04445685d4dd21'
  const surveyId = 107

  test(`用户${userId}的套件${numbers[0]}有填写问卷（${surveyId}）：成功`, () => {
    const number = numbers[0]

    return service.getSurveyRspns([{
      userId,
      number,
      surveyId
    }]).then(res => {
      expect(res).toEqual({
        list: [{
          number,
          surveyId,
          responseId: 125,
          submitTime: Date.parse('2019-12-11T10:21:32+0800')
        }]
      })
    })
  })

  test(`用户${userId}的套件${numbers[1]}没有填写问卷（${surveyId}）：成功`, () => {
    const number = numbers[1]

    return service.getSurveyRspns([{
      userId,
      number,
      surveyId
    }]).then(res => {
      expect(res).toEqual({
        list: []
      })
    })
  })

  test(`用户${userId}的套件${numbers[0]}没有填写问卷（${101}）：成功`, () => {
    const number = numbers[1]

    return service.getSurveyRspns([{
      userId,
      number,
      surveyId: 101
    }]).then(res => {
      expect(res).toEqual({
        list: []
      })
    })
  })
})



describe('获取位点基因型：getVariants()', () => {
  const number = 'E-B19320110961'

  test(`获取${number}的微醺所需位点数据：成功`, () => {
    const rsids = [
      'rs279845',
      'rs1229984',
      'rs671',
      'rs10246939',
      'rs3813867',
      'rs279871',
      'rs1421085',
      'rs698'
    ]

    return service.getVariants(number, rsids).then(res => {
      expect(res).toEqual({
        list: [
          { chromosome: 'chr10', position: 133526101, isCall: true, rsid: 'rs3813867', genotype: 'GG' },
          { chromosome: 'chr4', position: 46327706, isCall: true, rsid: 'rs279845', genotype: 'TA' },
          { chromosome: 'chr12', position: 111803962, isCall: true, rsid: 'rs671', genotype: 'GA' },
          { chromosome: 'chr4', position: 99339632, isCall: true, rsid: 'rs698', genotype: 'TT' },
          { chromosome: 'chr4', position: 46303716, isCall: true, rsid: 'rs279871', genotype: 'TC' },
          { chromosome: 'chr4', position: 99318162, isCall: true, rsid: 'rs1229984', genotype: 'TT' },
          { chromosome: 'chr16', position: 53767042, isCall: true, rsid: 'rs1421085', genotype: 'TC' },
          { chromosome: 'chr7', position: 141972804, isCall: true, rsid: 'rs10246939', genotype: 'CC' }
        ]
      })
    })
  })

  test('未传递所需数据的位点：失败', () => {
    const rsids = []

    return service.getVariants(number, rsids).then(res => {
      expect(res).toEqual({
        code: 6,
        message: '私有平台：参数错误'
      })
    })
  })

  test('传递不存在的rs位点：失败', () => {
    const rsids = [
      'rs279845',
      'rsinvaild'
    ]

    return service.getVariants(number, rsids).then(res => {
      expect(res).toEqual({
        list: [{
          chromosome: 'chr4', position: 46327706, isCall: true, rsid: 'rs279845', genotype: 'TA'
        }]
      })
    })
  })
})
