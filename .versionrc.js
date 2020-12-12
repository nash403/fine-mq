const types = require('commitlint-config-cz/lib/types')()

module.exports = {
  types: types.map((type) => {
    const base = { type, hidden: false }
    if (type === 'feat') return { ...base, section: 'Features' }
    if (type === 'fix') return { ...base, section: 'Bug Fixes' }
    if (type === 'docs') return { ...base, section: 'Docs' }
    if (type === 'chore' || type === 'test') return { ...base, section: 'Others' }
    if (type === 'improvement') return { ...base, section: 'Improvements' }
    return { ...base, hidden: true }
  }),
}
