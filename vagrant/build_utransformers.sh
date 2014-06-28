# build uTransformers
cd $BUILD_DIR
git clone $GIT_OBFUSCATION
cd uTransformers
git checkout $UTRANSFORMERS_VERSION
emconfigure ./configure
emmake make clean
emmake make -j$CORES

npm install
grunt clean
grunt build
grunt test

rm -rfv /vagrant/uTransformers
cp -rvf $BUILD_DIR/uTransformers /vagrant/
