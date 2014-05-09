#!/usr/bin/env bash

# Tested on 14.04, 32-bit

WORKING_DIR=/vagrant/sandbox
PATH=$WORKING_DIR/emscripten-fastcomp/Release/bin:$WORKING_DIR/emscripten:$PATH
LLVM=$WORKING_DIR/emscripten-fastcomp/Release/bin

GMP_SERVER=ftp.gnu.org
GMP_VERSION=5.1.3
GMP_DIR=$WORKING_DIR/gmp-$GMP_VERSION

GIT_LIBFTE=https://github.com/uProxy/libfte.git
GIT_EMSCRIPTEN=https://github.com/kripken/emscripten.git
GIT_EMSCRIPTEN_FASTCOMP=https://github.com/kripken/emscripten-fastcomp
GIT_EMSCRIPTEN_FASTCOMP_CLANG=https://github.com/kripken/emscripten-fastcomp-clang


###
mkdir -p $WORKING_DIR


###
# https://github.com/kripken/emscripten/wiki/LLVM-Backend
cd $WORKING_DIR
git clone $GIT_EMSCRIPTEN
git clone $GIT_EMSCRIPTEN_FASTCOMP
cd emscripten-fastcomp/tools
git clone $GIT_EMSCRIPTEN_FASTCOMP_CLANG clang
cd ..
./configure --enable-optimized --disable-assertions --enable-targets=host,js
make -j`nproc`


###
# build GMP
cd $WORKING_DIR
wget https://$GMP_SERVER/gnu/gmp/gmp-$GMP_VERSION.tar.bz2
tar xvf gmp-*.tar.bz2
cd gmp-*
emconfigure ./configure ABI=32 --disable-assembly --disable-static --enable-shared
sed -i 's/HAVE_QUAD_T 1/HAVE_QUAD_T 0/g' config.h
sed -i 's/HAVE_LONG_LONG 1/HAVE_LONG_LONG 0/g' config.h
sed -i 's/HAVE_LONG_DOUBLE 1/HAVE_LONG_DOUBLE 0/g' config.h
sed -i 's/HAVE_OBSTACK_VPRINTF 1/HAVE_OBSTACK_VPRINTF 0/g' config.h
make -j`nproc`


# build libfte
cd $WORKING_DIR
git clone $GIT_LIBFTE
cd libfte
GMP_DIR=/vagrant/sandbox/gmp-5.1.3 make .libs/libfte.a


# validate that we built everything correctly
em++ -O3 --closure 1 examples/fte.cc -L$GMP_DIR/.libs -lgmp -I$GMP_DIR -o examples/fte.js -s ALLOW_MEMORY_GROWTH=1
nodejs examples/fte.js
