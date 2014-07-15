var test_languages = [
{
  "description": "FPE",
  "protocol": "stream cipher",
  "plaintext_regex": "^.+$",
  "plaintext_max_len": 512,
  "ciphertext_regex": "^.+$",
  "ciphertext_max_len": 512
}, {
  "description": "FPE",
  "protocol": "stream cipher",
  "plaintext_regex": "^.+$",
  "plaintext_max_len": 1024,
  "ciphertext_regex": "^.+$",
  "ciphertext_max_len": 1024
}, {
  "description": "FPE",
  "protocol": "stream cipher",
  "plaintext_regex": "^.+$",
  "plaintext_max_len": 1450,
  "ciphertext_regex": "^.+$",
  "ciphertext_max_len": 1450
}, {
  "description": "FTE",
  "protocol": "bittorrent (l7)",
  "plaintext_regex": "^.+$",
  "plaintext_max_len": 1400,
  "ciphertext_regex": "^(\\x13bittorrent protocol|azver\\x01$|get /scrape\\?info_hash=get /announce\\?info_hash=|get /client/bitcomet/|GET /data\\?fid=)|d1:ad2:id20:|\\x08'7P\\)[RP].*$",
  "ciphertext_max_len": 1450
}, {
  "description": "FTE",
  "protocol": "ntp (l7)",
  "plaintext_regex": "^.+$",
  "plaintext_max_len": 1400,
  "ciphertext_regex": "^([\\x13\\x1b\\x23\\xd3\\xdb\\xe3]|[\\x14\\x1c$].......?.?.?.?.?.?.?.?.?[\\xc6-\\xff]).*$",
  "ciphertext_max_len": 1450
}, {
  "description": "FTE",
  "protocol": "bittorrent (appid)",
  "plaintext_regex": "^.+$",
  "plaintext_max_len": 1400,
  "ciphertext_regex": "^(\\x13BitTorrent protocol|GET /announce\\?(info_hash|peer_id|ip|port|uploaded|downloaded|left|event)).*$",
  "ciphertext_max_len": 1450
}, {
  "description": "FTE",
  "protocol": "ntp (appid)",
  "plaintext_regex": "^.+$",
  "plaintext_max_len": 1400,
  "ciphertext_regex": "^((\\x00|\\x01|\\x02|\\x03|\\x04|\\x40|\\x41|\\x42|\\x43|\\x44|\\x80|\\x81|\\x02|\\x83|\\x84|\\xc0|\\xc1|\\xc2|\\xc3|\\xc4)(\\x00-\\x04))((\\x19|\\x1a|\\x1b|\\x1c|\\x1d|\\x21|\\x22|\\x23|\\x24|\\x25|\\x59|\\x5a|\\x5b|\\x5c|\\x5d|\\x61|\\x62|\\x63|\\x64|\\x65|\\x99|\\x9a|\\x9b|\\x9c|\\x9d|\\xa1|\\xa2|\\xa3|\\xa4|\\xa5|\\xd9|\\xda|\\xdb|\\xdc|\\xdd|\\xe1|\\xe2|\\xe3|\\xe4|\\xe5)[\\x00-\\x15]).*$",
  "ciphertext_max_len": 1450
}, {
  "description": "FTE",
  "protocol": "rip (appid)",
  "plaintext_regex": "^.+$",
  "plaintext_max_len": 1400,
  "ciphertext_regex": "^(\\x01|\\x02)\\x02\\x00\\x00\\x00\\x02.{14}\\x00\\x00\\x00[\\x00-\\x16].*$",
  "ciphertext_max_len": 1450
}];
