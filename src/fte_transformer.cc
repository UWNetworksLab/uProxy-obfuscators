#include <stdlib.h>

#include "rapidjson/document.h"

#include "fte_transformer.h"

FteTransformer::FteTransformer() {

}

bool FteTransformer::Transform(
  const uint8_t* data, uint32_t data_len,
  std::vector<std::string>& transformed_data) {

  const char * s = reinterpret_cast<const char *>(data);
  std::string datagram(s, data_len);
  std::string ciphertext;
  cryptor_.Encrypt(datagram, &ciphertext);
  transformed_data.push_back(ciphertext);

  return true;
}


bool FteTransformer::Restore(const uint8_t* data, uint32_t data_len,
                             std::string& result) {

  const char * s = reinterpret_cast<const char *>(data);
  std::string datagram(s, data_len);
  cryptor_.Decrypt(datagram, &result);

  return true;
}

bool FteTransformer::FlushTransform(std::vector<std::string>& transformed_data) {
  return true;
}

bool FteTransformer::SetKey(const uint8_t* key_str, uint32_t key_len) {
  const char * s = reinterpret_cast<const char *>(key_str);
  key_ = std::string(s, key_len);
  return true;
}

bool FteTransformer::SetInitVector(const uint8_t* data, uint32_t data_len) {
  return true;
}

bool FteTransformer::Configure(const uint8_t* data, uint32_t data_len) {
  rapidjson::Document document;
  const char * s = reinterpret_cast<const char *>(data);
  std::string jsonStr = std::string(s, data_len);
  if (document.Parse<0>(jsonStr.c_str()).HasParseError()) {
    return false;
  }

  std::string plaintext_dfa = document["plaintext_dfa"].GetString();
  uint32_t plaintext_max_len = document["plaintext_max_len"].GetInt();
  std::string ciphertext_dfa = document["ciphertext_dfa"].GetString();
  uint32_t ciphertext_max_len = document["ciphertext_max_len"].GetInt();

  cryptor_ = fte::Fte();
  cryptor_.set_key(key_);
  cryptor_.SetLanguages(plaintext_dfa, plaintext_max_len,
                        ciphertext_dfa, ciphertext_max_len);

  return true;
}

REGISTER_TRANSPORT(FteTransformer);
