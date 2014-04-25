# the compiler: gcc for C program, define as g++ for C++
CXX = g++

# compiler flags:
#  -g    adds debugging information to the executable file
#  -Wall turns on most, but not all, compiler warnings
CXXFLAGS  = -g -Wall
LDFLAGS = -L/usr/local/lib -lgmp

# the build target executable:
TARGET = main
OBJ = src/main.o src/rank_unrank.o

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
