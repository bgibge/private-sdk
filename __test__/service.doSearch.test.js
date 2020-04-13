/*
 * @Author: xiaorujun
 * @Description:
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
  timeout: 30 * 1000,
  errorCodePrefix: 80
})




describe('搜索：doSearch()', () => {
  const number = 'E-B19722207213'
  const rsid = 'rs279845'

  test(`搜索${number}的报告结果：成功`, () => {
    return service.doSearch({
      number,
      scopes: ['report'],
      query: '疾病'
    }).then(res => {
      expect(res.page).toBe(1)
      expect(res.limit).toBe(10)
      expect(res.pages).toBe(25)
      expect(res.total).toBe(246)
      expect(res.list.length).toBe(10)
    })
  })

  test(`搜索${number}的所有内容：成功`, () => {
    return service.doSearch({
      number,
      query: '脸盲'
    }).then(res => {
      expect(res.page).toBe(1)
      expect(res.limit).toBe(10)
      expect(res.pages).toBe(1)
      expect(res.total).toBe(7)
      expect(res.list.length).toBe(7)
    })
  })


  test('搜索的内容溢出总页数 pages：成功', () => {
    return service.doSearch({
      number,
      scopes: ['report'],
      query: '色盲',
      page: 2
    }).then(res => {
      expect(res.page).toBe(2)
      expect(res.limit).toBe(10)
      expect(res.pages).toBe(1)
      expect(res.total).toBe(2)
      expect(res.list.length).toBe(0)
    })
  })

  test(`搜索${number}的${rsid}基因型：成功`, () => {
    return service.doSearch({
      number,
      scopes: ['locus'],
      query: rsid
    }).then(res => {
      expect(res.page).toBe(1)
      expect(res.limit).toBe(10)
      expect(res.pages).toBe(1)
      expect(res.total).toBe(1)
      expect(res.list[0]).toEqual({
        scope: 'locus',
        chromosome: 'chr4',
        gene: 'GABRA2',
        rsId: 'rs279845',
        genotypes: ['A', 'T'],
        genotype: 'T/A'
      })
    })
  })

  test('搜索未传 query：失败', () => {
    expect(() => {
      service.doSearch({ number })
    }).toThrow(/expected/)
  })

  test('搜索不存在的scope：失败', () => {
    return service.doSearch({
      number,
      scopes: ['invaild'],
      query: '疾病'
    }).then(res => {
      expect(res).toEqual({
        code: 7,
        message: '私有平台：参数错误'
      })
    })
  })
})
