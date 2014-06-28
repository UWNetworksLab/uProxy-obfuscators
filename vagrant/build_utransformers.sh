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

cp -rvf build /vagrant/
cp -rvf demo /vagrant/

