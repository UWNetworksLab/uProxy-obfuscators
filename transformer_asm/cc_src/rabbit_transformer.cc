#include "rabbit_transformer.h"
//#include "emscripten/bind.h"

//using namespace emscripten;

#include <stdlib.h>

using namespace std;

bool RabbitTransformer::SetKey(const uint8_t* key_str, uint32_t key_len) {
  if (key_len != cryptor_.kDefaultKeySize) {
    return false;
  }
  key_.assign(reinterpret_cast<const char*>(key_str), key_len);
  cryptor_.keysetup(reinterpret_cast<const uint8_t*>(key_.data()), 
                    key_.size(), cryptor_.kDefaultIvSize);
  return true;
}

bool RabbitTransformer::SetInitVector(const uint8_t* data, uint32_t data_len) {
  if (data_len != cryptor_.kDefaultIvSize) {
    return false;
  }
  init_vector_.assign(reinterpret_cast<const char*>(data), data_len); 
  return true;
}

bool RabbitTransformer::Transform(
    const uint8_t* data, uint32_t data_len,
    vector<string>& transformed_data) {
 
  // Only do this once for each transformation sessions (which may consiste of
  // a series of "Transform' call).
  // uint8_t iv[cryptor_.kDefaultIvSize];
  const uint8_t* iv = reinterpret_cast<const uint8_t*>(init_vector_.data());
  uint32_t iv_size = init_vector_.size();
  if (iv_size == cryptor_.kDefaultIvSize) {
    cryptor_.ivsetup(iv); 
  } else {
    iv_size = 0;
  }

  uint32_t buf_len = iv_size + data_len;
  string result;
  result.resize(buf_len);
  char* buf_ptr = const_cast<char*>(result.data());
  if (iv_size) {
    memcpy(buf_ptr, iv, iv_size); 
    buf_ptr += iv_size;
  }
  cryptor_.encrypt_bytes(data, reinterpret_cast<uint8_t*>(buf_ptr), data_len);
  transformed_data.clear();
  transformed_data.push_back(result);
  init_vector_.clear();
  return true;
}


bool RabbitTransformer::FlushTransform(vector<string>& transformed_data) {
  transformed_data.clear();
  // prepare for next transformation session.
  cryptor_.keysetup(reinterpret_cast<const uint8_t*>(key_.data()), 
                    key_.size(), cryptor_.kDefaultIvSize);
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

