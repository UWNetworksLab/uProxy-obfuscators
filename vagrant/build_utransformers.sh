# build uTransformers
cd $BUILD_DIR
git clone $GIT_OBFUSCATION
cd uTransformers
git checkout $UTRANSFORMERS_VERSION
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
