var rabbit = require('./dist/utransformers.rabbit.js');
var benchmarks = require('./dist/benchmarks.js');
var regex2dfa = require('./dist/regex2dfa.js');

var test_lengths = [128, 256, 512, 1024, 2048, 4096, 8192];

function main() {
for (var i = 0; i < test_lengths.length; i++) {            
  retval = benchmarks.do_rabbit_benchmark(test_lengths[i]);
if (retval[0]) {
  console.log(["rabbit",
               "plaintext len (bytes) = " + test_lengths[i],
               "avg. encrypt cost (ms) = " + retval[1],
               "success = " + retval[0]]);
} else {
  console.log(["rabbit",
               "plaintext len (bytes) = " + test_lengths[i],
               "avg. encrypt cost (ms) = " + retval[1],
               "success = " + retval[0]]);
  console.log("*** FAIL");
  process.exit(code=1);
}
}

process.exit(code=0);
}

main();
