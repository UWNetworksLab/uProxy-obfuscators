GTEST_DIR = thirdparty/gtest-1.7.0
GMP_DIR = /usr/local/lib

# the compiler: gcc for C program, define as g++ for C++
CXX = g++

# compiler flags:
#  -g    adds debugging information to the executable file
#  -Wall turns on most, but not all, compiler warnings
CXXFLAGS  = -g -Wall -I$(GTEST_DIR)/include
LDFLAGS = -L$(GMP_DIR) -L$(GTEST_DIR) -lgmp -lgtest

# the build target executable:
TARGET = main
OBJ = src/main.o src/ranker.o

all: $(TARGET)

%.o: %.cc
	$(CXX) $(CXXFLAGS) -c -o $@ $<

$(TARGET): $(OBJ)
	$(CXX) $(CXXFLAGS) $(LDFLAGS) -o $@ $^

test:
	@./$(TARGET)

clean:
	$(RM) $(TARGET)
	$(RM) $(OBJ)
