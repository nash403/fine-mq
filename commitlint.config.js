const types = require('commitlint-config-cz/lib/types')()
const config = require('commitlint-config-cz/lib/cz-config')()

module.exports = {
  extends: ['@commitlint/config-conventional', 'cz'],
  rules: {
    'header-max-length': [0, 'always', config.subjectLimit],
    'type-enum': [2, 'always', types],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'scope-case': [2, 'always', ['lower-case', 'upper-case', 'camel-case']],
    'scope-enum': [0],
  },
}
