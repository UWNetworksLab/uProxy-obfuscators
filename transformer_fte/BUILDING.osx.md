install emscripten

./configure --host=i386-apple-darwin --build=i386-apple-darwin --enable-optimized --disable-assertions --enable-targets=host,js

gmp build

LDFLAGS=CFLAGS=CXXFLAGS=-m32
emconfigure ./configure --disable-assembly --disable-static --enable-shared

sed -i '' -e 's/HAVE_QUAD_T 1/HAVE_QUAD_T 0/g' config.h
sed -i '' -e 's/HAVE_LONG_LONG 1/HAVE_LONG_LONG 0/g' config.h
sed -i '' -e 's/HAVE_LONG_DOUBLE 1/HAVE_LONG_DOUBLE 0/g' config.h
sed -i '' -e 's/HAVE_OBSTACK_VPRINTF 1/HAVE_OBSTACK_VPRINTF 0/g' config.h

make -j8

em++ -O3 --closure 1 examples/fte.cc -L$GMP_DIR/.libs -lgmp -I$GMP_DIR -o examples/fte.js
