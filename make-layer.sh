#!/bin/bash

npm install

mkdir bin lib
cp -R node_modules lib

wget -O bin/node.tar.xz https://nodejs.org/dist/v16.13.0/node-v16.13.0-linux-x64.tar.xz

cd bin
tar -xvf node.tar.xz
cd ..

zip layer.zip bin lib
