#include "fte_transformer.h"


static FteTransformer *the_transformer = NULL;

const int kMaxTransformerNum = 32;
static Transformer*  transformer_pool[kMaxTransformerNum] = {0};


extern "C"  {

    int create_transformer(void) {
        for (int i = 0; i < kMaxTransformerNum; i++) {
            if (transformer_pool[i] == NULL) {
                transformer_pool[i] = new FteTransformer();
                return i;
            }
        }
        return -1;
    }

    int delete_transformer(int handle) {
        if (handle < 0 || handle >= kMaxTransformerNum) {
            return -1;
        }
        delete transformer_pool[handle];
        transformer_pool[handle] = NULL;
        return 0;
    }

    Transformer* _get_transformer_instance(int handle) {
        if (handle < 0 || handle >= kMaxTransformerNum) {
            return NULL;
        }
        return transformer_pool[handle];
    }

    int transform(int handle, const uint8_t* data, uint32_t data_len,
                  uint8_t* output, uint32_t* output_len) {

        Transformer* instance = _get_transformer_instance(handle);
        if (instance == NULL) {
            return -1;
        }

        std::vector<std::string> transformed_data;
        bool success = instance->Transform(data, data_len, transformed_data);
        if (!success) {
            *output_len = 0;
            return -1;
        }

        if (transformed_data[0].size() > *output_len) {
            *output_len = transformed_data[0].size();
            return -1;
        }

        memcpy(output, transformed_data[0].data(), transformed_data[0].size());
        *output_len = transformed_data[0].size();
        return 0;
    }

    int restore(int handle, const uint8_t* data, uint32_t data_len,
                uint8_t* result, uint32_t* result_len) {
        Transformer* instance = _get_transformer_instance(handle);
        if (instance == NULL) {
            return -1;
        }

        std::string result_str;
        if (!instance->Restore(data, data_len, result_str)) {
            *result_len = 0;
            return -1;
        }
        if (result_str.size() > *result_len) {
            return result_str.size();
            *result_len = result_str.size();
            return -1;
        }
        memcpy(result, result_str.data(), result_str.size());
        *result_len = result_str.size();
        return 0;
    }

    int set_key(int handle, const unsigned char* key, uint32_t key_len) {
        Transformer* instance = _get_transformer_instance(handle);
        if (instance == NULL) {
            return -1;
        }
        return instance->SetKey(key, key_len) ? 0 : -1;
    }

    int set_init_vector(int handle, const unsigned char* data, uint32_t data_len) {
        Transformer* instance = _get_transformer_instance(handle);
        if (instance == NULL) {
            return -1;
        }
        return instance->SetInitVector(data, data_len) ? 0 : -1;
    }

    int configure(int handle, const unsigned char* data, uint32_t data_len) {
        Transformer* instance = _get_transformer_instance(handle);
        if (instance == NULL) {
            return -1;
        }
        return instance->Configure(data, data_len) ? 0 : -1;
    }

}
