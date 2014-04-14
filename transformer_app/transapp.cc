/// @file transformer.cc
/// This NaCl module performs data packet obfuscation using rabbit stream
/// cipher.
///
/// The browser can talk to this module via the postMessage() Javascript
/// function. The request is in Json format.
/// 
/// {
///   command: 'transform' | 'restore',
///   id: an integer id, uniquely identify the request.
///   key: an ArrayBuffer that has the key for cipher.
///   plain_text: original text to be encrypted.
///   cipher_text: cipher_text after encryption.
/// }
/// 
/// The result of operation will also be returned to browser in the same
/// Json structure with "key" field removed, and "plain_text" filled if 
/// command is "transform, or "cipher_text" filled if command is "restore".
///
/// There seems no way for NaCl module to create a new ArrayBuffer and pass
/// back to browser, but it can modify the ArrayBuffer provided by browser. 

#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"
#include "ppapi/utility/completion_callback_factory.h"

#include "rabbit_transformer.h"

using namespace std;

namespace {
const char* const kCommand = "command";
const char* const kKey = "key";
const char* const kSetKey = "set_key";
const char* const kConfig = "config";
const char* const kTransform = "transform";
const char* const kTransformReply = "transform_reply";
const char* const kRestore = "restore";
const char* const kPlainTextLabel = "plain_text";
const char* const kCipherTextLabel = "cipher_text";
const char* const kId = "id";
} // namespace


/// The Instance class.The browser will ask the Module object to create
/// a new Instance for each occurrence of the <embed> tag that has these
/// attributes:
///     src="transformer.nmf"
///     type="application/x-pnacl"

class TransformerInstance : public pp::Instance {
 public:
  /// The constructor creates the plugin-side instance.
  /// @param[in] instance the handle to the browser-side plugin instance.
  explicit TransformerInstance(PP_Instance instance) : pp::Instance(instance),
      factory_(this) {}
  virtual ~TransformerInstance() {}

  /// Handler for messages coming in from the browser via postMessage().  The
  /// @a var_message can contain be any pp:Var type; for example int, string
  /// Array or Dictinary. Please see the pp:Var documentation for more details.
  /// @param[in] var_message The message posted by the browser.
  virtual void HandleMessage(const pp::Var& var) {
    if (var.is_dictionary()) {
      pp::VarDictionary dict(var);
      pp::Var command_var = dict.Get(pp::Var(kCommand));
      if (command_var.is_string() && command_var.AsString() == kTransform) {
        pp::VarArrayBuffer key(dict.Get(pp::Var(kKey)));
        transformer_.SetKey(static_cast<const uint8_t*>(key.Map()),
                            key.ByteLength());

        pp::VarArrayBuffer data(dict.Get(pp::Var(kPlainTextLabel)));
        unsigned int data_len = data.ByteLength();
        uint8_t* data_buf = static_cast<uint8_t*>(data.Map());
        vector<string> result;
        transformer_.Transform(data_buf, data_len, result);
        pp::VarArrayBuffer cipher_data(dict.Get(pp::Var(kCipherTextLabel)));
        uint8_t* encryptedPtr = static_cast<uint8_t*>(cipher_data.Map());
        memcpy(encryptedPtr, result[0].data(), result[0].size());
        cipher_data.Unmap();

        pp::VarDictionary response;
        response.Set(pp::Var(kCommand), command_var);
        response.Set(pp::Var(kId), dict.Get(pp::Var(kId)));
        response.Set(pp::Var(kCipherTextLabel), cipher_data);
        PostMessage(response); 
      } else if (command_var.is_string() && command_var.AsString() == kRestore) {
        pp::VarArrayBuffer key(dict.Get(pp::Var(kKey)));
        transformer_.SetKey(static_cast<const uint8_t*>(key.Map()),
                            key.ByteLength());


        pp::VarArrayBuffer cipher_data(dict.Get(pp::Var(kCipherTextLabel)));
        uint8_t* cipher_buf = static_cast<uint8_t*>(cipher_data.Map());
        string result;
        transformer_.Restore(cipher_buf, cipher_data.ByteLength(), result);

        pp::VarArrayBuffer data(dict.Get(pp::Var(kPlainTextLabel)));
        unsigned int data_len = data.ByteLength();
        uint8_t* data_buf = static_cast<uint8_t*>(data.Map());
        if (data_len != result.size()) {
          PostError("plaintext field is not in right size.");
          return;
        }
        memcpy(data_buf, result.data(), result.size()); 
        data.Unmap();

        pp::VarDictionary response;
        response.Set(pp::Var(kCommand), command_var);
        response.Set(pp::Var(kId), dict.Get(pp::Var(kId)));
        response.Set(pp::Var(kPlainTextLabel), data);
        PostMessage(response); 
      }
    }
  }

  void PostError(const char* format, ...) {
    char dest[1024]; 
    va_list argptr;
    va_start(argptr, format);
    vsnprintf(dest, 1023, format, argptr);
    va_end(argptr);
    PostMessage(pp::Var(dest));
  }


protected:
  pp::CompletionCallbackFactory<TransformerInstance> factory_;
  RabbitTransformer transformer_;
};

/// The Module class.  The browser calls the CreateInstance() method to create
/// an instance of your NaCl module on the web page.  The browser creates a new
/// instance for each <embed> tag with type="application/x-pnacl".
class TransformModule : public pp::Module {
 public:
  TransformModule() : pp::Module() {}
  virtual ~TransformModule() {}

  /// Create and return a P2pInstance object.
  /// @param[in] instance The browser-side instance.
  /// @return the plugin-side instance.
  virtual pp::Instance* CreateInstance(PP_Instance instance) {
    return new TransformerInstance(instance);
  }
};

namespace pp {
/// Factory function called by the browser when the module is first loaded.
/// The browser keeps a singleton of this module. 
Module* CreateModule() {
  return new TransformModule();
}
}  // namespace pp
