EMSCRIPTEN_DIR=/Users/shanjian/dev/emsdk_portable/emscripten/1.13.0

SRC=.
EMSCRIPT_INC_DIR=$(EMSCRIPTEN_DIR)/system/include/
OBJ_DIR=objs


CC=$(EMSCRIPTEN_DIR)/emcc
EXPORTS=-s EXPORTED_FUNCTIONS="['_delete_transformer','_create_transformer','_set_key','_configure','_transform','_flush_transform','_restore']"
LD_FLAGS = $(EXPORTS)
#CFLAGS = -O2 -I $(EMSCRIPT_INC_DIR) 
CFLAGS = -I $(EMSCRIPT_INC_DIR) $(EXPORTS)
#CFLAGS = -I $(EMSCRIPT_INC_DIR) 


TARGET = transformer_asm.js

.PHONY: directories

all: directories $(TARGET)

directories: ${OBJ_DIR}


_OBJ = rabbit.bc rabbit_transformer.bc transformer.bc
OBJ=$(patsubst %, $(OBJ_DIR)/%, $(_OBJ))


$(TARGET): $(OBJ)
	$(CC) $(LD_FLAGS) -o $@ $^
	
$(OBJ_DIR):
	mkdir -p $(OBJ_DIR)

$(OBJ_DIR)/%.bc:    $(SRC)/%.cc
	$(CC) -o $@ $< $(CFLAGS)

.PHONY: clean

clean:
	rm -f $(OBJ_DIR)/*.bc
	rm -f $(TARGET)

