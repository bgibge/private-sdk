/*
 * @Author: xiaorujun
 * @Description: 刷选从私有平台返回的睡觉
 * @Date: 2020-04-07 18:11:46
 * @Last Modified by: xiaorujun
 */
const _ = require('lodash')





/**
 * 样品信息
 */
exports.sampleData = function (itemData) {
  // 项目信息
  const projectData = itemData.project[0] || {}

  // 问卷信息
  const surveyData = _.find(
    projectData.data_element || [],
    { type: 'survey' }
  ) || {}

  // 采样时间
  const sampleTime = itemData.sample_time

  return {
    number: itemData.biosample_id,
    omic: projectData.project_omic || '-',
    surveyId: surveyData.data_element_id,
    samplingTime: Date.parse(sampleTime) || null
  }
}
