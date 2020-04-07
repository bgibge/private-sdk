/*
 * @Author: xiaorujun
 * @Description: 回调函数
 * @Date: 2020-04-07 18:11:46
 * @Last Modified by: xiaorujun
 */
const _ = require('lodash')




/**
 * getSampleData callbacl
 */
exports.getSampleDataCallback = function (data) {
  const {
    error,
    message,
    result: list
  } = data

  // TODO: errorCodePrefix
  if (error) {
    return { code: 1, message }
  }

  const samples = list.map(item => {
    // 项目信息
    const projectData = item.project[0] || {}

    // 问卷信息
    const surveyData = _.find(
      projectData.data_element || [],
      { type: 'survey' }
    ) || {}

    return {
      number: item.biosample_id,
      omic: projectData.project_omic || '-',
      surveyId: surveyData.data_element_id
    }
  })

  return Promise.resolve({ result: samples })
}
