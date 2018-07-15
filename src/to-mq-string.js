const hyphenize = str => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

const o2mq = queryObject => {
  if (typeof queryObject === 'string') return queryObject
  return Object.entries(queryObject)
    .reduce((mq, [feature, value]) => {
      feature = hyphenize(feature)
      if (typeof value === 'boolean') {
        mq.push(value ? `${feature}` : `not ${feature}`)
      } else {
        const isDimension = /[height|width]$/.test(feature) && Number.isFinite(+value)
        mq.push(`(${feature}: ${isDimension ? (+value)+'px' : value})`)
      }
      return mq
    }, []).join(' and ')
}

const toMq = query => {
  return (Array.isArray(query) ? query : [query]).map(q => o2mq(q)).join(', ')
}

// module.exports = toMq
export default toMq
