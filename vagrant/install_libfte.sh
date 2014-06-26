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
emconfigure ./configure --prefix=$INSTALL_DIR
make -j$CORES
make install
