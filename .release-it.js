module.exports = {
  git: {
    commitMessage: 'chore: release v${version}',
    tagName: 'v${version}',
    tagAnnotation: 'Release v${version}',
    push: true,
  },
  github: {
    release: true,
    releaseName: 'Release ${version}',
  },
  npm: {
    publish: false,
  },
  plugins: {
    '@release-it/conventional-changelog': {
      preset: 'angular',
      infile: 'CHANGELOG.md',
    },
  },
}; 