#include <stdlib.h>

#include "fte_transformer.h"

bool FteTransformer::SetKey(const uint8_t* key_str, uint32_t key_len) {
    return true;
}

bool FteTransformer::SetInitVector(const uint8_t* data, uint32_t data_len) {
    return true;
}

bool FteTransformer::Transform(
    const uint8_t* data, uint32_t data_len,
    std::vector<std::string>& transformed_data) {
    return true;
}


bool FteTransformer::FlushTransform(std::vector<std::string>& transformed_data) {
    return true;
}


bool FteTransformer::Restore(const uint8_t* data, uint32_t data_len,
                                std::string& result) {
    return true;
}
