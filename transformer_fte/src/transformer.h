#ifndef __TRANSFORMER_H__
#define __TRANSFORMER_H__

#include <string>
#include <vector>

class Transformer {
  public:
    enum TransformerError {
        eTransformNoneError = 0,
        eTransformNullInput,        //The input data is the empty string.
        eTransformInputTooLong,     // The input data length is longer than allowed
        eTransformEncryptionFailed, // Fatal error in the encryption scheme
        eTransformEncoderFailed,    // Fatal error in the encoding scheme
        eTransformDecryptionFailed, // Decoding successful, decryption failed
        eTransformDecodeFailed,     // Decoding failed
    };

    virtual ~Transformer() {};

    /**
     * Sets the key for transformation and encryption.
     */
    virtual bool SetKey(const uint8_t *key_str, uint32_t key_len) = 0;


    /**
     * Sets the initial vector for upcoming transformation session.
     *
     * The initial vector must be reset for each transformation session.
     */
    virtual bool SetInitVector(const uint8_t* data, uint32_t data_len) = 0;

    /**
     * Configures how Transformer should work by passing it a JSON format
     * configuration string. This method only need to be called once, probably
     * right after transformer instance is created. Typical items include:
     *  - Packet regular expression
     *  - Max/min packet length
     *  - Additional restrictions
     *  - Version information.
     *  - Possible mode selection.
     *  - Encryption algorithm choice
     *  etc.
     */
    virtual bool Configure(const uint8_t *config_data,
                           uint32_t config_data_len) = 0;


    /**
      * Transforms data.
      *
      * In case of failure, this method will return false. Error detail can be
      * retrieved by calling GetErrorInfo().
      */
    virtual bool Transform(const uint8_t *data, uint32_t data_len,
                           std::vector<std::string>& transformed_data) = 0;

    /**
     *  This function notify the transformer that all data has been passed. If
     *  transformer has some data un-processed, it is time to process them.
     */
    virtual bool FlushTransform(std::vector<std::string>& transformed_data) = 0;

    /**
     * Restore data from transformed form.
     *
     * In case of failure, this method will return false. Error detail can be
     * retrieved by calling GetErrorInfo().
     */
    virtual bool Restore(const uint8_t *data, uint32_t data_len,
                         std::string& result) = 0;

    virtual TransformerError GetErrorInfo(std::string *detail = NULL) = 0;
};

#endif // __TRANSFORMER_H__
