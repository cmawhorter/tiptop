module.exports = {
  options: {
    banner: '<%= banner %>',
    sourceMap: true
  },
  dist: {
    src: '<%= concat.dist.dest %>',
    dest: 'dist/<%= pkg.name %>.min.js'
  }
};
