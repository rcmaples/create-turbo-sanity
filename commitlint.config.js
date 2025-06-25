module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting, missing semicolons, etc
        'refactor', // Code change that neither fixes bug nor adds feature
        'test',     // Adding missing tests
        'chore',    // Maintenance
        'ci',       // CI related changes
        'build',    // Build system changes
        'revert'    // Revert previous commit
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'template',   // Changes to template files
        'cli',        // Changes to CLI tool
        'deps',       // Dependency updates
        'docs',       // Documentation changes
        'ci',         // CI/CD changes
        'config',     // Configuration changes
        'release'     // Release related changes
      ]
    ],
    'subject-min-length': [2, 'always', 10],
    'subject-max-length': [2, 'always', 72],
    'subject-case': [2, 'always', 'lower-case'],
    'header-max-length': [2, 'always', 100]
  }
}
