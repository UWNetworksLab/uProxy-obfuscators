#!/usr/bin/env python2

import sys
import os
import commands

regex2dfa_binary_path = os.path.abspath("third_party/regex2dfa/bin")
regex2dfa_binary = "regex2dfa"
regexes_configuration = "src/fte_regexes.conf"

try:
    with open(os.path.join(regex2dfa_binary_path, regex2dfa_binary),'r'):
        pass
except:
    print "*** ERROR: regex2dfa binary does not exist at: " + regex2dfa_binary
    sys.exit(1)

with open(regexes_configuration,"r") as fh:
    regexes_content = fh.read() 
    regexes = regexes_content.split('\n')


print """var dfa_cache = {};
"""

for regex in regexes:
    if regex.strip() == "": continue
    cmd = "PATH="+regex2dfa_binary_path+":$PATH " + regex2dfa_binary + " -r \"" + regex + "\""
    dfa = commands.getstatusoutput(cmd)
    dfa = dfa[1]
    dfa = dfa.split("\n")
    dfa = dfa[1:]
    while '' in dfa: dfa.remove('')
    for i in range(len(dfa)):
        dfa[i] = "\"" + dfa[i] + "\\n\""
    dfa = ' + \n'.join(dfa)
    print "dfa_cache[\"" + regex + "\"] = " + dfa + ";"

print """
exports.regex2dfa = function(regex) {
  return dfa_cache[regex];
}"""
