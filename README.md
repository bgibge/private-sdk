# Node 版私有平台 SDK


### Usage

```javascript
const Service = require('private-sdk')


const service = new Service({
  host: 'https://dev.private.omgut.com',
  key: 'app-key',
  secret: 'app-secret',
  timeout: 30 * 1000,
  errorCodePrefix: ''
})


service.getSampleData(['E-B19722207213']).then((res) => {
  // Doing
})

// or

const res = await service.getSampleData(['E-B19722207213'])
```


### API


#### 获取套件信息

```javascript
/**
 * 获取套件信息
 *
 * @param {string[]} numbers - 套件编码列表
 *
 * @returns {Promise<Object>}
 * ```javascript
 * return {
 *   list: [{
 *     number: String, // 套件编码
 *     omic: String, // 所在组学
 *     surveyId: Number, // 问卷id
 *     samplingTime: Number // 采样日期
 *   }]
 * }
 * ```
 */
```


#### 获取套件答卷信息

```javascript
/**
 * 获取套件答卷信息
 *
 * @param {Object[]} conditions - 查询条件
 * @param {String} conditions[].userId - 用户id
 * @param {String} conditions[].number - 套件编码
 * @param {String} conditions[].surveyId - 问卷id
 *
 * @returns {Promise<Object>}
 * ```javascript
 * return {
 *   list: [{
 *     number: String, // 套件编码
 *     surveyId: Number, // 问卷id
 *     responseId: Number // 答卷id
 *   }]
 * }
 * ```
 */
```


#### 向用户发送短信通知

```javascript
/**
 * 向用户发送短信通知
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
```


#### 检查套件编码是否有效

```javascript
/**
 * 检查套件编码是否有效
 *
 * @param {string} number - 套件编码
 *
 * @returns {Promise<Object>}
 * ```javascript
 * return {
 *   flag: Boolean // 标识；false 无效，true 有效
 * }
 * ```
 */
```


#### 请求报告的基因型数据

```javascript
/**
 * 向私有平台请求报告的基因型数据
 *
 * @param {string} number - 套件编码
 * @param {string[]} rsids - rs 位点id 列表
 *
 * @returns {Promise<Object>}
 * ```
 * return {
 *   list: [{
 *     chromosome: String, // 染色体编号
 *     position: Number, // rs位点位置
 *     isCall: Boolean, // 是否检出
 *     rsid: String, // RS code
 *     genotype: String // 基因型
 *   }]
 * }
 */
```


#### 搜索，包括报告内容、应用、问卷和位点

```javascript
/**
 * 搜索
 *
 * @param {Object} params - 搜索参数
 * @param {string} params.number - 套件编码
 * @param {string} params.query - 搜索内容
 * @param {string[]} [params.scopes=['application', 'survey', 'report']] - 搜索范围
 * @param {number} [params.page=1] - 指定第几页
 * @param {number} [params.limit=10] - 指定返回记录的数量
 *
 * @returns {Promise<Object>}
 * ```
 * return {
 *   page: Number, // 当前页
 *   limit: Number, // 返回记录数
 *   pages: Number, // 总页数
 *   total: Number, // 记录总数
 *   list: [Object]
 * }
 * ```
 */
```
