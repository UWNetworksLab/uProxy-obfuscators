# build/install gmp
cd $BUILD_DIR
wget $HTTP_GMP
tar xvf gmp-6.0.0a.tar.bz2
cd gmp-*
emconfigure ./configure --prefix=$INSTALL_DIR --disable-assembly --enable-shared --disable-static
sed -i 's/HAVE_OBSTACK_VPRINTF 1/HAVE_OBSTACK_VPRINTF 0/g' config.h
sed -i 's/HAVE_QUAD_T 1/HAVE_QUAD_T 0/g' config.h
# <hack> need to add CFLAGS because GMP configure doesn't use env CFLAGS </hack>
make -j$CORES
make install
cp -f gmpxx.h $INSTALL_DIR/include/
