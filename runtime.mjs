import http from "http";
import path from "path";
import { Buffer } from "buffer";
import { loadFile } from "/opt/lib/node_modules/nbb/index.mjs";

// TODO is this the only one to support?
const ext = 'cljs';

// The standard format of _HANDLER is file.method, where file is the
// name of the file without an extension, and method is the name of a
// method or function that's defined in the file.

const [filePathNoExt, handlerFuncName] = process.env._HANDLER.split('.');
const handlerFileName = `${filePathNoExt}.${ext}`;

const filePath = path.join(process.env.LAMBDA_TASK_ROOT, handlerFileName);
const file = await loadFile(filePath);
const handler = file[handlerFuncName];

function run() {
  request(
    {
      url:
        process.env.AWS_LAMBDA_RUNTIME_API +
        "/2018-06-01/runtime/invocation/next",
    },
    function (err, invoke_result) {
      if (err) {
        return request(
          {
            url:
              process.env.AWS_LAMBDA_RUNTIME_API +
              "/2018-06-01/runtime/init/error",
            method: "POST",
            data: err,
          },
          run
        );
      }
      var event_data = invoke_result.data;
      var request_id =
        invoke_result.resp.headers["lambda-runtime-aws-request-id"];

      var response = handler(
        JSON.parse(event_data),
        {},
        function (err, result) {
          if (err) {
            failure(err);
          } else {
            success(result);
          }
        }
      );
      if (response && response.then && typeof response.then === "function") {
        response.then(success);
      }
      if (response && response.catch && typeof response.catch === "function") {
        response.catch(failure);
      }

      function success(result) {
        request(
          {
            url:
              process.env.AWS_LAMBDA_RUNTIME_API +
              "/2018-06-01/runtime/invocation/" +
              request_id +
              "/response",
            method: "POST",
            data: result,
          },
          run
        );
      }
      function failure(err) {
        request(
          {
            url:
              process.env.AWS_LAMBDA_RUNTIME_API +
              "/2018-06-01/runtime/invocation/" +
              request_id +
              "/error",
            method: "POST",
            data: err,
          },
          run
        );
      }
    }
  );
}
run();

function request(options, cb) {
  if (!cb) {
    cb = function () {};
  }
  if (options.data && typeof options.data === "object") {
    options.data = JSON.stringify(options.data);
  }
  if (options.data && !options.headers) {
    options.headers = {};
  }
  if (options.data && !options.headers["Content-Length"]) {
    options.headers["Content-Length"] = Buffer.byteLength(options.data);
  }
  if (options.data && !options.headers["Content-Type"]) {
    options.headers["Content-Type"] = "application/x-www-form-urlencoded";
  }
  options.timeout = 1000;

  var req = http
    .request("http://" + options.url, options, function (resp) {
      var data = "";
      resp.on("data", function (chunk) {
        data += chunk;
      });
      resp.on("end", function () {
        cb(null, { data: data, resp: resp });
      });
    })
    .on("error", function (err) {
      cb(err);
    });

  if (options.data) {
    req.write(options.data);
  }
  req.end();
}
