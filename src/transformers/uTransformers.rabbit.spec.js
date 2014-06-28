var rabbit = require('./uTransformers.rabbit.js');
var benchmarks = require('./benchmarks.js');

describe("uTransformers.rabbit", function() {
  it('basic', function() {
  var test_lengths = [128, 256, 512, 1024, 2048, 4096, 8192];
  for (var i = 0; i < test_lengths.length; i++) {
    retval = benchmarks.do_rabbit_benchmark(test_lengths[i]);
    expect(retval[0]).toBe(true);
  }
  });
});
