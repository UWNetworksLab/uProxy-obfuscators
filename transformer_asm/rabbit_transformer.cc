#include "rabbit_transformer.h"
//#include "emscripten/bind.h"

//using namespace emscripten;

#include <stdlib.h>

using namespace std;

bool RabbitTransformer::SetKey(const uint8_t* key_str, uint32_t key_len) {
  if (key_len != cryptor_.kDefaultKeySize) {
    return false;
  }
  cryptor_.keysetup(key_str, cryptor_.kDefaultKeySize, cryptor_.kDefaultIvSize);
  return true;
}

bool RabbitTransformer::Transform(
    const uint8_t* data, uint32_t data_len,
    vector<string>& transformed_data) {

  uint8_t iv[cryptor_.kDefaultIvSize];

  // TODO(shanjian) this is a only a placeholder for nouce generation.
  for (int i = 0; i < cryptor_.kDefaultIvSize; ++i) {
      iv[i] = i; //rand() & 0xff;
  }
  cryptor_.ivsetup(iv); 

  uint32_t buf_len = cryptor_.kDefaultIvSize + data_len;
  string result;
  result.resize(buf_len);
  char* buf_ptr = const_cast<char*>(result.data());
  memcpy(buf_ptr, iv, cryptor_.kDefaultIvSize);
  buf_ptr += cryptor_.kDefaultIvSize;
  cryptor_.encrypt_bytes(data, reinterpret_cast<uint8_t*>(buf_ptr), data_len);
  transformed_data.clear();
  transformed_data.push_back(result);
  return true;
}

bool RabbitTransformer::Restore(const uint8_t* data, uint32_t data_len,
                                std::string& result) {
  const uint8_t* iv = data;
  cryptor_.ivsetup(iv); 

  result.resize(data_len - cryptor_.kDefaultIvSize);
  uint8_t* buf = reinterpret_cast<uint8_t*>(const_cast<char*>(result.data()));
  cryptor_.decrypt_bytes(data + cryptor_.kDefaultIvSize,
                         buf, data_len - cryptor_.kDefaultIvSize);
  return true;
}

