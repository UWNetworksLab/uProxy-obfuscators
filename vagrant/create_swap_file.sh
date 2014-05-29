#!/usr/bin/env bash

# Exit on any error (non-zero return code)
set -e

# Create swapfile of 4GB with block size 1MB
sudo /bin/dd if=/dev/zero of=/swapfile bs=1024 count=8388608

# Set up the swap file
sudo /sbin/mkswap /swapfile

# Enable swap file immediately
sudo /sbin/swapon /swapfile

# Enable swap file on every boot
/bin/echo '/swapfile          swap            swap    defaults        0 0' | sudo tee -a /etc/fstab

