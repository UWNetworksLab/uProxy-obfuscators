#!/usr/bin/env bash

# Tested on 14.04, 32-bit

export WORKING_DIR=/home/vagrant
export BUILD_DIR=$WORKING_DIR/build
export INSTALL_DIR=$WORKING_DIR/install
export PATH=$INSTALL_DIR/bin:$BUILD_DIR/emscripten-fastcomp/Release/bin:$BUILD_DIR/emscripten:$PATH
export LLVM=$BUILD_DIR/emscripten-fastcomp/Release/bin

export GIT_EMSCRIPTEN=https://github.com/kripken/emscripten.git
export GIT_EMSCRIPTEN_FASTCOMP=https://github.com/kripken/emscripten-fastcomp
export GIT_EMSCRIPTEN_FASTCOMP_CLANG=https://github.com/kripken/emscripten-fastcomp-clang
export HTTP_GMP=https://ftp.gnu.org/gnu/gmp/gmp-6.0.0a.tar.bz2
export HTTP_NODEJS=http://nodejs.org/dist/v0.10.28/node-v0.10.28.tar.gz
export GIT_LIBFTE=https://github.com/uProxy/libfte.git
export GIT_OBFUSCATION=https://github.com/uProxy/obfuscation.git

export EMCC_CORES=`nproc`

export EMSCRIPTEN_VERSION=1.16.0
export EMSCRIPTEN_FASTCOMP_VERSION=1.16.0
export EMSCRIPTEN_FASTCOMP_CLANG_VERSION=1.16.0

# gtest relies on cxxabi, so we need to include this following hack
export CFLAGS="-O3"
export CXXFLAGS="-O3 -I$INSTALL_DIR/include -I$BUILD_DIR/emscripten/system/lib/libcxxabi/include"
export LDFLAGS="-O3 -L$INSTALL_DIR/lib"

###
mkdir -p $BUILD_DIR
mkdir -p $INSTALL_DIR


# install nodejs
cd $BUILD_DIR
wget $HTTP_NODEJS
tar xvf node-v0.10.28.tar.gz
cd node-*
./configure --prefix=$INSTALL_DIR
make -j`nproc`
make install
ln -s $INSTALL_DIR/bin/node $INSTALL_DIR/bin/nodejs


# https://github.com/kripken/emscripten/wiki/LLVM-Backend
cd $BUILD_DIR
git clone $GIT_EMSCRIPTEN
cd emscripten
git checkout $EMSCRIPTEN_VERSION

cd $BUILD_DIR
git clone $GIT_EMSCRIPTEN_FASTCOMP
cd emscripten-fastcomp
git checkout $EMSCRIPTEN_FASTCOMP_VERSION

cd $BUILD_DIR
cd emscripten-fastcomp/tools
git clone $GIT_EMSCRIPTEN_FASTCOMP_CLANG clang
cd clang
git checkout $EMSCRIPTEN_FASTCOMP_CLANG_VERSION
cd ..
cd ..
./configure --prefix=$INSTALL_DIR --enable-optimized --disable-assertions --enable-targets=host,js
make -j`nproc`


# init emscripten
$BUILD_DIR/emscripten/emcc


# fix broken emar
#  - using emar provided by emscripten results in archives that cause llvm-nm to hang
sudo rm $BUILD_DIR/emscripten/emar
sudo ln -s /usr/bin/ar $BUILD_DIR/emscripten/emar


# build/install gmp
cd $BUILD_DIR
wget $HTTP_GMP
tar xvf gmp-6.0.0a.tar.bz2
cd gmp-*
emconfigure ./configure --prefix=$INSTALL_DIR --disable-assembly --enable-shared --disable-static
# hack
sed -i 's/HAVE_OBSTACK_VPRINTF 1/HAVE_OBSTACK_VPRINTF 0/g' config.h
make -j`nproc`
make install
cp -f gmpxx.h $INSTALL_DIR/include/


# build libfte
cd $BUILD_DIR
git clone $GIT_LIBFTE
cd libfte
emconfigure ./configure --prefix=$INSTALL_DIR
make -j`nproc`
make install


# build transformer_fte
cd $BUILD_DIR
git clone $GIT_OBFUSCATION
cd obfuscation
emconfigure ./configure
make -j`nproc`

# test the transformers
nodejs bin/test.fte.js
nodejs bin/test.rabbit.js

# copy to shared directroy
mkdir -p /vagrant/build
cp -f html/js/transformer.rabbit.js /vagrant/build
cp -f html/js/transformer.fte.js /vagrant/build
cp -fr html /vagrant/build/demo
