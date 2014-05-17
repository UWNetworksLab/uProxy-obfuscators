# TODO: no hardcoded vagrant paths
EMSCRIPTEN_DIR=/vagrant/sandbox/emscripten
GMP_INC_DIR=/vagrant/sandbox/gmp-5.1.3
GMP_LIB_DIR=/vagrant/sandbox/gmp-5.1.3/.libs
FTE_LIB_DIR=/vagrant/sandbox/libfte
RAPIDJSON_INC_DIR=third_party/rapidjson/include

SRC=src
EMSCRIPT_INC_DIR=$(EMSCRIPTEN_DIR)/system/include/
OBJ_DIR=objs


CC=$(EMSCRIPTEN_DIR)/em++
EXPORTS=-s EXPORTED_FUNCTIONS="[\
    '_delete_transformer','_create_transformer',\
    '_set_key','_set_init_vector','_configure',\
    '_transform','_flush_transform','_restore']"
OPTIMIZATION_FLAGS = -g0 --closure 1 -O3
LD_FLAGS = $(OPTIMIZATION_FLAGS) $(EXPORTS) -L$(FTE_LIB_DIR) -L$(GMP_LIB_DIR) -L../../libfte/.libs -lgmp -lfte
CFLAGS = $(OPTIMIZATION_FLAGS) -s DIABLE_EXCEPTION_CATCHING=0 -I$(EMSCRIPT_INC_DIR) -I$(GMP_INC_DIR) -I/vagrant/sandbox/libfte/src -I$(RAPIDJSON_INC_DIR) $(EXPORTS) 


TARGET = html/js/transformer_fte.js

.PHONY: directories

all: directories $(TARGET)

directories: ${OBJ_DIR}


_OBJ = fte_transformer.bc transformer.bc
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

