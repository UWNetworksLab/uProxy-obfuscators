function do_fte_benchmark(plaintext_dfa, plaintext_max_len,
  ciphertext_dfa, ciphertext_max_len) {

  var input_plaintext = "HelloWorld";
  var transformer = new fte.Transformer();

  var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
  var ab_key = str2ab(key);
  transformer.setKey(ab_key);

  var json_obj = {
    'plaintext_dfa': plaintext_dfa,
    'plaintext_max_len': plaintext_max_len,
    'ciphertext_dfa': ciphertext_dfa,
    'ciphertext_max_len': ciphertext_max_len
  };

  var json_str = JSON.stringify(json_obj);
  transformer.configure(json_str);

  var ab_plaintext = str2ab(input_plaintext);
  var ciphertext = transformer.transform(ab_plaintext);
  var ab_output_plaintext = transformer.restore(ciphertext);
  var output_plaintext = ab2str(ab_output_plaintext);

  var success = (output_plaintext === input_plaintext);

  var trials = 1000;
  var start = new Date().getTime();
  for (var i = 0; i < trials; i++) {
    transformer.transform(ab_plaintext);
  }
  var end = new Date().getTime();
  var elapsed = end - start;
  elapsed = elapsed / trials;

  transformer.dispose();

  return [success, elapsed];
}

function do_rabbit_benchmark(plaintext_len) {
  var transformer = new rabbit.Transformer();

  var key = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
  var ab_key = str2ab(key);
  transformer.setKey(ab_key);

  var input_plaintext = "";
  for (var i = 0; i < plaintext_len; ++i) {
    input_plaintext += "x";
  }
  var ab_plaintext = str2ab(input_plaintext);
  var ciphertext = transformer.transform(ab_plaintext);
  var ab_output_plaintext = transformer.restore(ciphertext);
  var output_plaintext = ab2str(ab_output_plaintext);

  var success = (output_plaintext === input_plaintext);

  var trials = 1000;
  var start = new Date().getTime();
  for (var i = 0; i < trials; i++) {
    transformer.transform(ab_plaintext);
  }
  var end = new Date().getTime();
  var elapsed = end - start;
  elapsed = elapsed / trials;
  transformer.dispose();


  return [success, elapsed];
}

if (typeof exports == 'undefined') {
  var exports = {};
}

exports.do_fte_benchmark = do_fte_benchmark;
exports.do_rabbit_benchmark = do_rabbit_benchmark;
// Functions for the FTE table
function WriteFteTable() {
  for (var i = 0; i < test_languages.length; i++) {
    var retval = '';
    retval += '<tr id="fte_row' + i + '">';
    retval += '<td class="obfuscatorName">fte</td>';
    retval += '<td class="testNum">' + (i + 1) + '</td>';
    retval += '<td class="testInputLanguage">(' + test_languages[i][
      'plaintext_regex'
    ] + ', ' + test_languages[i]['plaintext_max_len'] + ')</td>';
    retval += '<td class="testInputLaguage">(' + test_languages[i][
      'ciphertext_regex'
    ] + ', ' + test_languages[i]['ciphertext_max_len'] + ')</td>';
    retval += '<td class="testCost">';
    retval += '-';
    retval += '</td>';
    retval += '</tr>';

    document.getElementById('FteBenchmarkResults').innerHTML += retval;
  }
}

function FillFteTable(i) {
  var plaintext_dfa = regex2dfa(test_languages[i]['plaintext_regex']);
  var ciphertext_dfa = regex2dfa(test_languages[i]['ciphertext_regex']);
  retval = do_fte_benchmark(plaintext_dfa, test_languages[i][
      'plaintext_max_len'
    ],
    ciphertext_dfa, test_languages[i]['ciphertext_max_len']);
  var success = retval[0];
  var elapsed = retval[1];

  var rowClass = 'fail';
  if (success) {
    rowClass = 'success';
  }

  var toUpdate = document.getElementById('fte_row' + i).className = rowClass;
  var toUpdate = document.getElementById('fte_row' + i).getElementsByClassName(
    'testCost')[0];
  toUpdate.innerHTML = elapsed;

}


// Functions for the Rabbit table
var test_lengths = [128, 256, 512, 1024, 2048, 4096, 8192];
function WriteRabbitTable() {
  for (var i = 0; i < test_lengths.length; i++) {
    var retval = '';
    retval += '<tr id="rabbit_row' + i + '">';
    retval += '<td class="obfuscatorName">rabbit</td>';
    retval += '<td class="testNum">' + (i + 1) + '</td>';
    retval += '<td class="plaintext_len">' + test_lengths[i] + '</td>';
    retval += '<td class="testCost">';
    retval += '-';
    retval += '</td>';
    retval += '</tr>';

    document.getElementById('RabbitBenchmarkResults').innerHTML += retval;
  }
}
function FillRabbitTable(i) {

  retval = do_rabbit_benchmark(test_lengths[i]);
  var success = retval[0];
  var elapsed = retval[1];

  var rowClass = 'fail';
  if (success) {
    rowClass = 'success';
  }

  var toUpdate = document.getElementById('rabbit_row' + i).className = rowClass;
  var toUpdate = document.getElementById('rabbit_row' + i).getElementsByClassName(
    'testCost')[0];
  toUpdate.innerHTML = elapsed;

}


// This is the main onload function that initializes the tables, then fills them.
window.onload = function () {
  WriteFteTable();
  WriteRabbitTable();
  for (var i = 0; i < test_languages.length; i++) {
    (function (i) {
      setTimeout(function () {
        FillFteTable(i);
      }, 10)
    })(i);
  }
  for (var i = 0; i < test_lengths.length; i++) {
    (function (i) {
      setTimeout(function () {
        FillRabbitTable(i);
      }, 10)
    })(i);
  }
};
