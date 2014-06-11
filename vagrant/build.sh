#!/usr/bin/env bash

# Tested on 14.04, 32-bit

export WORKING_DIR=/home/vagrant
export BUILD_DIR=$WORKING_DIR/build
export INSTALL_DIR=$WORKING_DIR/install
export PATH=$INSTALL_DIR/bin:$BUILD_DIR/emscripten-fastcomp/Release/bin:$BUILD_DIR/emscripten:$PATH
export LLVM=/usr/lib/llvm-3.3/bin

export GIT_EMSCRIPTEN=https://github.com/kripken/emscripten.git
export HTTP_GMP=https://ftp.gnu.org/gnu/gmp/gmp-6.0.0a.tar.bz2
export GIT_LIBFTE=https://github.com/uProxy/libfte.git
export GIT_OBFUSCATION=https://github.com/uProxy/uTransformers.git

export CORES=`nproc`
export EMCC_CORES=$CORES
export EMCC_FAST_COMPILER=0
export EMSCRIPTEN_VERSION=1.16.0

# gtest relies on cxxabi, so we need to include this following hack
export CFLAGS="-O3"
export CPPFLAGS="-O3"
export CXXFLAGS="-O3 -I$INSTALL_DIR/include -I$BUILD_DIR/emscripten/system/lib/libcxxabi/include"
export LDFLAGS="-O3 -L$INSTALL_DIR/lib"

###
mkdir -p $BUILD_DIR
mkdir -p $INSTALL_DIR

# get emscripten
cd $BUILD_DIR
git clone $GIT_EMSCRIPTEN
cd emscripten
git checkout $EMSCRIPTEN_VERSION

#
sudo ln -s /usr/bin/clang /usr/lib/llvm-3.3/bin/clang
sudo ln -s /usr/bin/clang++ /usr/lib/llvm-3.3/bin/clang++
sudo ln -s /usr/bin/clang-check /usr/lib/llvm-3.3/bin/clang-check
sudo ln -s /usr/bin/clang-tblgen /usr/lib/llvm-3.3/bin/clang-tblgen

# init. emscripten
emcc

# build/install gmp
cd $BUILD_DIR
wget $HTTP_GMP
tar xvf gmp-6.0.0a.tar.bz2
cd gmp-*
emconfigure ./configure --prefix=$INSTALL_DIR --disable-assembly --enable-shared --disable-static
sed -i 's/HAVE_OBSTACK_VPRINTF 1/HAVE_OBSTACK_VPRINTF 0/g' config.h
# <hack> need to add CFLAGS because GMP configure doesn't use env CFLAGS </hack>
CFLAGS=-O3 make -j$CORES
make install
cp -f gmpxx.h $INSTALL_DIR/include/

# build libfte
cd $BUILD_DIR
git clone $GIT_LIBFTE
cd libfte
# <hack> don't check for gmpxx.h
sed -i 's/AC_CHECK_HEADER/#AC_CHECK_HEADER/g' configure.ac
sed -i 's/\[Couldn/#[Couldn/g' configure.ac
autoconf configure.ac > configure
autoreconf
# </hack>
emconfigure ./configure --prefix=$INSTALL_DIR
make -j$CORES
make install

# build uTransformers
cd $BUILD_DIR
git clone $GIT_OBFUSCATION
cd uTransformers
git checkout kpdyer-issue12
emconfigure ./configure
make -j$CORES

# test the transformers
make test

# copy to shared directroy
mkdir -p /vagrant/build
cp -f dist/utransformers.rabbit.js /vagrant/build
cp -f dist/utransformers.fte.js /vagrant/build

mkdir -p /vagrant/build/demo
cp -rfv dist /vagrant/build/demo/dist
cp -rfv html /vagrant/build/demo/html
