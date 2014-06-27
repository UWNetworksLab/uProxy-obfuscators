# build libfte
cd $BUILD_DIR
git clone $GIT_LIBFTE
cd libfte
git checkout $LIBFTE_VERSION

# <hack> don't check for gmpxx.h
sed -i 's/AC_CHECK_HEADER/#AC_CHECK_HEADER/g' configure.ac
sed -i 's/\[Couldn/#[Couldn/g' configure.ac
autoconf configure.ac > configure
autoreconf
# </hack>

# <hack>
cd $BUILD_DIR/libfte/third_party/regex2dfa/third_party/openfst
emconfigure ./configure --enable-bin --disable-shared --enable-static
emmake make
emconfigure ./configure --enable-bin --disable-shared --enable-static
# </hack>

cd $BUILD_DIR/libfte
emconfigure ./configure --prefix=$INSTALL_DIR
make -j$CORES
make install
