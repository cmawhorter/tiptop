module.exports = {
  options: {
    editorconfig: '.editorconfig',
    ignores: [
      'js-comments'
    ]
  },
  gruntfile: {
    src: ['Gruntfile.js', 'tasks/{,*/}*.js']
  },
  lib: {
    src: ['lib/<%= pkg.name %>.js']
  },
  test: {
    src: ['test/spec/**/*.js']
  }
};
