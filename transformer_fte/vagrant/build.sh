#!/bin/sh

# Tested on 14.04, 32-bit

WORKING_DIR=/vagrant/sandbox
PATH=$WORKING_DIR/emscripten-fastcomp/Release/bin:$WORKING_DIR/emscripten:$PATH
LLVM=$WORKING_DIR/emscripten-fastcomp/Release/bin

GMP_SERVER=ftp.gnu.org
GMP_VERSION=5.1.3
GMP_DIR=$WORKING_DIR/gmp-5.1.3

GIT_LIBFTE=https://github.com/uProxy/libfte.git
GIT_EMSCRIPTEN=https://github.com/kripken/emscripten.git
GIT_EMSCRIPTEN_FASTCOMP=https://github.com/kripken/emscripten-fastcomp
GIT_EMSCRIPTEN_FASTCOMP_CLANG=https://github.com/kripken/emscripten-fastcomp-clang

sudo apt-get -y update

sudo apt-get -y install m4
sudo apt-get -y install git-core
sudo apt-get -y install nodejs

####

mkdir -p $WORKING_DIR


# #https://github.com/kripken/emscripten/wiki/LLVM-Backend
cd $WORKING_DIR
git clone $GIT_EMSCRIPTEN
git clone $GIT_EMSCRIPTEN_FASTCOMP
cd emscripten-fastcomp/tools
git clone $GIT_EMSCRIPTEN_FASTCOMP_CLANG clang
cd ..
../configure --enable-optimized --disable-assertions --enable-targets=host,js
make -j`nproc`


cd $WORKING_DIR
wget https://$GMP_SERVER/gnu/gmp/gmp-$GMP_VERSION.tar.bz2
tar xvf gmp-*.tar.bz2
cd gmp-*
./configure --enable-cxx --disable-assembly --disable-static --enable-shared
make -j`nproc`

make clean
EMCONFIGURE_JS=1 emconfigure ./configure ABI=32 --disable-assembly --disable-static --enable-shared
sed -i 's/HAVE_QUAD_T 1/HAVE_QUAD_T 0/g' config.h
sed -i 's/HAVE_LONG_LONG 1/HAVE_LONG_LONG 0/g' config.h
sed -i 's/HAVE_LONG_DOUBLE 1/HAVE_LONG_DOUBLE 0/g' config.h
make -j`nproc`


cd $WORKING_DIR
git clone $GIT_LIBFTE
cd libfte
make .libs/libfte.a


em++ examples/fte.cc -L$GMP_DIR/.libs -lgmp -I$GMP_DIR -o examples/fte.js
nodejs examples/fte.js
