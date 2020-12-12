/**
 * For display purposes, for types of commit, the name field should be in the following format:
 *  `<type>: <description>(\n<optional second line>)`
 *  with type having max 10 characters,
 *  and leave a padding of 12 characters before starting the description (14 for the second lines).
 */

module.exports = {
  types: [
    { value: 'feat', name: 'feat:       A new feature' },
    { value: 'fix', name: 'fix:        A bug fix' },
    { value: 'docs', name: 'docs:       Documentation only changes' },
    {
      value: 'style',
      name:
        'style:      Changes that do not affect the meaning of the code\n              (white-space, formatting, missing semi-colons, etc)',
    },
    {
      value: 'refactor',
      name:
        'refactor:   A code change that neither really fixes a bug nor adds a feature\n              (move/remove files, implementation, readability, etc)',
    },
    {
      value: 'improvement',
      name: 'improvement:       A code change that improves something',
    },
    { value: 'test', name: 'test:       Adding missing tests' },
    {
      value: 'chore',
      name: 'chore:      Changes to the build process or auxiliary tools',
    },
    { value: 'revert', name: 'revert:     Revert to a commit' },
    { value: 'wip', name: 'WIP:        Work in progress' },
  ],

  scopes: [{ name: 'test' }, { name: 'types' }, { name: 'lint' }, { name: 'build' }],

  allowTicketNumber: false,
  isTicketNumberRequired: false,
  ticketNumberPrefix: 'TICKET-',
  ticketNumberRegExp: '\\d{1,5}',

  // it needs to match the value for field type. Eg.: 'fix'
  /*
  scopeOverrides: {
    fix: [

      {name: 'merge'},
      {name: 'style'},
      {name: 'e2eTest'},
      {name: 'unitTest'}
    ]
  },
  */
  // override the messages, defaults are as follows
  messages: {
    type: "Select the type of change that you're committing:",
    scope: '\nDenote the SCOPE of this change (optional):',
    // used if allowCustomScopes is true
    customScope: 'Denote the SCOPE of this change:',
    subject: 'Write a SHORT, IMPERATIVE tense description of the change:\n',
    body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
    breaking: 'List any BREAKING CHANGES (optional):\n',
    footer: 'List any ISSUES CLOSED by this change (optional). E.g.: #31, #34:\n',
    confirmCommit: 'Are you sure you want to proceed with the commit above?',
  },

  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix', 'refactor'],
  // skip any questions you want
  // skipQuestions: ['body'],

  // limit subject length
  subjectLimit: 130,
  // breaklineChar: '|', // It is supported for fields body and footer.
  // footerPrefix : 'ISSUES CLOSED:'
  // askForBreakingChangeFirst : true, // default is false
}
