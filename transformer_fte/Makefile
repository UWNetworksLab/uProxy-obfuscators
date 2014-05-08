EMSCRIPTEN_DIR=/Users/kpdyer/Downloads/emsdk_portable/emscripten/1.12.0

SRC=cc_src
EMSCRIPT_INC_DIR=$(EMSCRIPTEN_DIR)/system/include/
OBJ_DIR=objs


CC=$(EMSCRIPTEN_DIR)/emcc
EXPORTS=-s EXPORTED_FUNCTIONS="[\
    '_delete_transformer','_create_transformer',\
    '_set_key','_set_init_vector','_configure',\
    '_transform','_flush_transform','_restore']"
LD_FLAGS = -O2 $(EXPORTS) -L../../libfte/.libs -lfte
CFLAGS = -O2 -I$(EMSCRIPT_INC_DIR) -I../../../gmp-5.1.3 -I../../libfte/src $(EXPORTS) 


TARGET = transformer_fte.js

.PHONY: directories

all: directories $(TARGET)

directories: ${OBJ_DIR}


_OBJ = fte_transformer.bc transformer.bc
OBJ=$(patsubst %, $(OBJ_DIR)/%, $(_OBJ))


$(TARGET): $(OBJ)
	$(CC) ../../../gmp-5.1.3/.libs/libgmp.a ../../../gmp-5.1.3/.libs/libgmpxx.a $(LD_FLAGS) -o $@ $^
	
$(OBJ_DIR):
	mkdir -p $(OBJ_DIR)

$(OBJ_DIR)/%.bc:    $(SRC)/%.cc
	$(CC) ../../../gmp-5.1.3/.libs/libgmp.a ../../../gmp-5.1.3/.libs/libgmpxx.a -o $@ $< $(CFLAGS)

.PHONY: clean

clean:
	rm -f $(OBJ_DIR)/*.bc
	rm -f $(TARGET)

