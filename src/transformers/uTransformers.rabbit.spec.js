var rabbit = require('./npm/utransformers.rabbit.js');
var benchmarks = require('./npm/benchmarks.js');

function rabbit_basic_test() {
  var test_lengths = [128, 256, 512, 1024, 2048, 4096, 8192];
  for (var i = 0; i < test_lengths.length; i++) {
    retval = benchmarks.do_rabbit_benchmark(test_lengths[i]);
    if (!retval) {
      return false;
    }
  }
  return true;
}

function main() {
  if (!rabbit_basic_test()) {
    console.log('FAIL\trabbit_basic_test');
    process.exit(code = 1);
  }
  else {
    console.log('SUCCESS\trabbit_basic_test');
  }
  process.exit(code = 0);
}

main();
