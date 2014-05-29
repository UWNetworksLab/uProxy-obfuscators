#!/usr/bin/env bash

cd /vagrant
./create_swap_file.sh
./install_prereqs.sh
./build.sh
