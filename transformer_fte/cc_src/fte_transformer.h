#ifndef __RABBIT_TRANSFORMER_H__
#define __RABBIT_TRANSFORMER_H__

#include "transformer.h"
#include "tests/dfas.h"
#include "fte/fte.h"

#include <string>

class FteTransformer : public Transformer {
public:
  FteTransformer()
  : cryptor_(fte::FTE(VALID_DFA_5,128,VALID_DFA_5,128,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"))
  {
      cryptor_ = fte::FTE(VALID_DFA_5,128,VALID_DFA_5,128,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
  };

  virtual ~FteTransformer() {};

  virtual bool SetKey(const uint8_t* key_str, uint32_t key_len);

  virtual bool SetInitVector(const uint8_t* data, uint32_t data_len);

  virtual bool Configure(const uint8_t* config_data,
                         uint32_t config_data_len) { 
    return true; 
  }

  virtual bool Transform(const uint8_t* data, uint32_t data_len,
                         std::vector<std::string>& transformed_data);
  virtual bool FlushTransform(std::vector<std::string>& transformed_data);

  virtual bool Restore(const uint8_t* data, uint32_t data_len,
                       std::string& result);

  virtual TransformerError GetErrorInfo(std::string* detail = NULL) {
    return eTransformNoneError;
  }

protected:
  fte::FTE     cryptor_;
  std::string  init_vector_;
  std::string  key_;
};

#endif // __RABBIT_TRANSFORMER_H__