#!/usr/bin/env bash

# Tested on 14.04, 32-bit

export WORKING_DIR=/vagrant/sandbox
export PATH=$WORKING_DIR/emscripten-fastcomp/Release/bin:$WORKING_DIR/emscripten:$PATH
export LLVM=$WORKING_DIR/emscripten-fastcomp/Release/bin

export GMP_SERVER=ftp.gnu.org
export GMP_VERSION=5.1.3
export GMP_DIR=/vagrant/sandbox/gmp-5.1.3
export GMP_INC_DIR=$GMP_DIR
export GMP_LIB_DIR=$GMP_DIR/.libs

export GIT_LIBFTE=https://github.com/uProxy/libfte.git
export GIT_EMSCRIPTEN=https://github.com/kripken/emscripten.git
export GIT_EMSCRIPTEN_FASTCOMP=https://github.com/kripken/emscripten-fastcomp
export GIT_EMSCRIPTEN_FASTCOMP_CLANG=https://github.com/kripken/emscripten-fastcomp-clang

export EMCC_CORES=`nproc`
export CXXFLAGS="-I$WORKING_DIR/emscripten/system/lib/libcxxabi/include"

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
# init emscripten
$WORKING_DIR/emscripten/emcc


###
# fix broken emar
#  - using emar provided by emscripten results in archives that cause llvm-nm (and hence the build) to hang
sudo rm /vagrant/sandbox/emscripten/emar
sudo ln -s /usr/bin/ar /vagrant/sandbox/emscripten/emar


###
# build GMP
cd $WORKING_DIR
wget https://$GMP_SERVER/gnu/gmp/gmp-$GMP_VERSION.tar.bz2
tar xvf gmp-*.tar.bz2
cd gmp-*
emconfigure ./configure CFLAGS="-g0 -O3" CXXFLAGS="-g0 -O3" ABI=32 --disable-assembly --disable-static --enable-shared
sed -i 's/HAVE_LONG_LONG 1/HAVE_LONG_LONG 0/g' config.h
sed -i 's/HAVE_LONG_DOUBLE 1/HAVE_LONG_DOUBLE 0/g' config.h
sed -i 's/HAVE_QUAD_T 1/HAVE_QUAD_T 0/g' config.h
sed -i 's/HAVE_OBSTACK_VPRINTF 1/HAVE_OBSTACK_VPRINTF 0/g' config.h
make -j`nproc`


# build libfte
cd $WORKING_DIR
git clone $GIT_LIBFTE
cd libfte/third_party/gtest-*
emconfigure ./configure CFLAGS="-g0 -O3" CXXFLAGS="-g0 -O3 -I$WORKING_DIR/emscripten/system/lib/libcxxabi/include" --enable-static --disable-shared
make -j`nproc`


# validate that we built everything correctly
cd $WORKING_DIR/libfte
EMSCRIPTEN=1 CFLAGS="-g0 -O3" CXXFLAGS="-g0 -O3 -I$WORKING_DIR/emscripten/system/lib/libcxxabi/include" make -j`nproc` bin/test.js
nodejs bin/test.js
