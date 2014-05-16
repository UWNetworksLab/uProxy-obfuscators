#include <stdlib.h>

#include "fte_transformer.h"

FteTransformer::FteTransformer()
{

}

bool FteTransformer::Transform(
    const uint8_t* data, uint32_t data_len,
    std::vector<std::string>& transformed_data) {
    
    const char * s = reinterpret_cast<const char *>(data);
    std::string datagram(s, data_len);
    std::string ciphertext = cryptor_.encrypt(datagram);
    transformed_data.push_back(ciphertext);
    
    return true;
}


bool FteTransformer::Restore(const uint8_t* data, uint32_t data_len,
                                std::string& result) {
    
    const char * s = reinterpret_cast<const char *>(data);
    std::string datagram(s, data_len);
    std::string plaintext = cryptor_.decrypt(datagram);
    result = plaintext;
    
    return true;
}

bool FteTransformer::FlushTransform(std::vector<std::string>& transformed_data) {
    return true;
}

bool FteTransformer::SetKey(const uint8_t* key_str, uint32_t key_len) {
    return true;
}

bool FteTransformer::SetInitVector(const uint8_t* data, uint32_t data_len) {
    return true;
}

bool FteTransformer::Configure(const uint8_t* data, uint32_t data_len) {
    cryptor_ = fte::FTE(VALID_DFA_5,128,
                        VALID_DFA_5,128,
                        "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
    
    return true;
}