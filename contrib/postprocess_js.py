#!/usr/bin/env python2

import os
import sys

transformer_name = sys.argv[1]

assert os.path.exists('html/js/utransformers.' + transformer_name + '.js')

retval =  """var """ + transformer_name + """ = {};
""" + transformer_name + """.Module = function() {
"""

with open('html/js/utransformers.' + transformer_name + '.js') as fh:
    retval +=  fh.read()

retval +=  """return Module;
}();

""" + transformer_name + """.Transformer = (function () {
  var Module = """ + transformer_name + """.Module;
"""

with open('src/transformer.js') as fh:
    retval +=  fh.read()

retval +=  """}());

exports.Transformer = function() {
  return new """ + transformer_name + """.Transformer();
};
"""

find = "module['exports'] = Module;"
replace = "Module['exports'] = Module;"

retval = retval.replace(find, replace)

with open('html/js/utransformers.' + transformer_name + '.js', 'w') as fh:
    fh.write(retval)
