# nbb-aws-lambda-runtime
AWS Lambda runtime for nbb

## Setup

* `./make-layer.sh`
* `./make-runtime.sh`
* `aws lambda publish-layer-version --layer-name node-nbb-al2 --compatible-runtimes "provided.al2" --zip-file fileb://layer.zip`
* Go to Lambda Console
* Create function
* Select runtime: Provide your own bootstrap on Amazon Linux 2
* Select architecture `x86_64`
* Click Create Function
* In Code section "upload from" ... choose runtime.zip 
* In layers section "add a layer" => Custom layers => select `node-nbb-al2`

## TODO

* Make ARM version
* Make aws-sdk somehow available in CLJS scripts
* Publish runtime to AWS Serverless Repository
