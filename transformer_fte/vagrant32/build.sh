#!/usr/bin/env bash

# Tested on 14.04, 32-bit

WORKING_DIR=/vagrant/sandbox
PATH=$WORKING_DIR/emscripten-fastcomp/Release/bin:$WORKING_DIR/emscripten:$PATH
LLVM=$WORKING_DIR/emscripten-fastcomp/Release/bin

GIT_LIBFTE=https://github.com/uProxy/libfte.git
GIT_EMSCRIPTEN=https://github.com/kripken/emscripten.git
GIT_EMSCRIPTEN_FASTCOMP=https://github.com/kripken/emscripten-fastcomp
GIT_EMSCRIPTEN_FASTCOMP_CLANG=https://github.com/kripken/emscripten-fastcomp-clang

EMCC_CORES=`nproc`

###
mkdir -p $WORKING_DIR


# https://github.com/kripken/emscripten/wiki/LLVM-Backend
cd $WORKING_DIR
git clone $GIT_EMSCRIPTEN
git clone $GIT_EMSCRIPTEN_FASTCOMP
cd emscripten-fastcomp/tools
git clone $GIT_EMSCRIPTEN_FASTCOMP_CLANG clang
cd ..
./configure --enable-optimized --disable-assertions --enable-targets=host,js
make -j`nproc`


# init emscripten
$WORKING_DIR/emscripten/emcc


# fix broken emar
#  - using emar provided by emscripten results in archives that cause llvm-nm to hang
sudo rm /vagrant/sandbox/emscripten/emar
sudo ln -s /usr/bin/ar /vagrant/sandbox/emscripten/emar


# gtest relies on cxxabi, so we need to include this following hack
CXXFLAGS="-I$WORKING_DIR/emscripten/system/lib/libcxxabi/include"


# build libfte
cd $WORKING_DIR
git clone $GIT_LIBFTE
cd libfte
emconfigure ./configure

# hack to get GMP to compile under emscripten
GMP_DIR=third_party/gmp-6.0.0
sed -i 's/HAVE_LONG_LONG 1/HAVE_LONG_LONG 0/g' $GMP_DIR/config.h
sed -i 's/HAVE_LONG_DOUBLE 1/HAVE_LONG_DOUBLE 0/g' $GMP_DIR/config.h
sed -i 's/HAVE_QUAD_T 1/HAVE_QUAD_T 0/g' $GMP_DIR/config.h
sed -i 's/HAVE_OBSTACK_VPRINTF 1/HAVE_OBSTACK_VPRINTF 0/g' $GMP_DIR/config.h

make -j`nproc`
nodejs bin/test
exit $?
