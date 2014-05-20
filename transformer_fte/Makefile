# TODO: no hardcoded vagrant paths
EMSCRIPTEN_DIR=/vagrant/sandbox/emscripten
FTE_DIR=/vagrant/sandbox/libfte
FTE_LIB_DIR=$(FTE_DIR)
GMP_DIR=/vagrant/sandbox/libfte/third_party/gmp-6.0.0
GMP_INC_DIR=$(GMP_DIR)
GMP_LIB_DIR=$(GMP_DIR)/.libs
RAPIDJSON_INC_DIR=third_party/rapidjson/include

SRC=src
EMSCRIPT_INC_DIR=$(EMSCRIPTEN_DIR)/system/include/
OBJ_DIR=objs


CXX=$(EMSCRIPTEN_DIR)/em++
EXPORTS=-s EXPORTED_FUNCTIONS="[\
    '_delete_transformer','_create_transformer',\
    '_set_key','_set_init_vector','_configure',\
    '_transform','_flush_transform','_restore']"
OPTIMIZATION_FLAGS = -Oz -s OUTLINING_LIMIT=100000 -s AGGRESSIVE_VARIABLE_ELIMINATION=1 -s FORCE_ALIGNED_MEMORY=1 -s PRECISE_I64_MATH=1 --closure 1 --llvm-lto 3 --llvm-opts 3
LD_FLAGS = $(OPTIMIZATION_FLAGS) -Wno-warn-absolute-paths $(EXPORTS) -L$(FTE_LIB_DIR) -L$(GMP_LIB_DIR) -L../../libfte/.libs -lgmp -lfte
CFLAGS = $(OPTIMIZATION_FLAGS) -Wno-warn-absolute-paths -I$(EMSCRIPT_INC_DIR) -I$(GMP_INC_DIR) -I/vagrant/sandbox/libfte/src -I$(RAPIDJSON_INC_DIR) $(EXPORTS) 


TARGET = html/js/transformer_fte.js

.PHONY: directories

all: directories $(TARGET)

directories: ${OBJ_DIR}


_OBJ = fte_transformer.bc transformer.bc
OBJ=$(patsubst %, $(OBJ_DIR)/%, $(_OBJ))


$(TARGET): $(OBJ)
	$(CXX) $(LD_FLAGS) -o $@ $^
	
$(OBJ_DIR):
	mkdir -p $(OBJ_DIR)

$(OBJ_DIR)/%.bc:    $(SRC)/%.cc
	$(CXX) -o $@ $< $(CFLAGS)

.PHONY: clean

clean:
	rm -f $(OBJ_DIR)/*.bc
	rm -f $(TARGET)

