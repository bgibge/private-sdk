/*
 * @Author: xiaorujun
 * @Description: 搜索结果不同的 scope 采用不一样的过滤策略
 * @Date: 2020-04-13 16:36:52
 * @Last Modified by: xiaorujun
 */
const _ = require('lodash')




/**
 * 应用
 */
exports.application = function (record = {}) {
  const {
    id,
    highlight,
    data
  } = record

  return {
    scope: 'application',
    id,
    type: data.appType,
    class: highlight.appName || data.appClassName,
    name: highlight.appName || data.appName,
    description: highlight.appDesc || data.appDesc,
    icon: data.appSimage
  }
}



/**
 * 报告内容
 */
exports.report = function (record = {}) {
  const {
    id,
    type,
    highlight,
    data
  } = record

  // 模型；scope 为 report，domain 为 model
  if (type === 'model') {
    return {
      scope: 'report',
      id,
      domain: _.capitalize(type),
      name: highlight.project_name || data.project_name,
      description: highlight.data_element_description || data.data_element_description
    }
  }

  return {
    scope: 'report',
    id,
    domain: _.capitalize(type),
    name: highlight['name.chinese'] || data.name.chinese,
    description: highlight.summary || data.summary
  }
}



/**
 * 位点
 */
exports.locus = function (record = {}) {
  const {
    data: {
      alternate_id: alternateId,
      variant: {
        chromosome = '-',
        genotype = '-',
        alternate_base = [],
        reference_base: referenceBase
      },
      genomic_context: {
        gene: genes = []
      }
    }
  } = record

  return {
    scope: 'locus',
    chromosome,
    gene: (genes[0] || {}).symbol || '-',
    rsId: alternateId[0] || '-',
    genotypes: _.concat(alternate_base, referenceBase),
    genotype
  }
}



/**
 * 问卷
 */
exports.survey = function (record = {}) {
  const {
    id,
    type,
    highlight,
    data
  } = record

  return {
    scope: 'survey',
    id,
    type: type,
    title: highlight.title || data.title,
    planTitle: highlight.planTitle || data.planTitle,
    description: highlight.description || data.description,
    icon: data.listImage
  }
}
