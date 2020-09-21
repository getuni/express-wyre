import express from "express";
import { OK } from "http-status-codes";
import { compile } from "handlebars";
import { decode as atob } from "base-64";
import { typeCheck } from "type-check";

const defaultOptions = Object.freeze({ env: "test" });

const verifyMiddleware = ({ ...options }) => async (req, res, next) => {
  try {
    const html = `
<!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.3/jquery.min.js"></script>
    <script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"></script>
    <script src="https://verify.sendwyre.com/js/pm-widget-init.js"></script>
    <script type="text/javascript">
      function post(data) {

        if ("{{{env}}}" === "test") {
          console.log(data);
        }

        /* react-native */
        if (window.ReactNativeWebView) {
          return window.ReactNativeWebView.postMessage(JSON.stringify(data));
        }
        /* browser */
        return top.postMessage(
          JSON.stringify(data),
          (window.location != window.parent.location) ? document.referrer: document.location,
        );
      }
  
      var handler = new WyrePmWidget({
        env: "{{{env}}}",
        onLoad: function() {
          handler.open();
        },
        onSuccess: function(result) {
          return post({ type: "plaid/result", publicToken: result.publicToken });
        },
        onExit: function() {
          return post({ type: "plaid/exit" });
        }
      });
    </script>
  </head>
  <body></body>
</html>
      `.trim();
    return res.status(OK).send(
      compile(html)({ ...options })
    );
  } catch (e) {
    return next(e);
  }
};

export const wyre = (options) => {
  if (options === undefined) {
    throw new Error(`You've forgotten to provide the options argument for your call to wyre(). To replicate older behaviour, you can use wyre({ env: \"test\" }).`);
  }
  // XXX: Force the caller to explicitly define the environment.
  if (!typeCheck("{env:String,...}", options)) {
    throw new Error(`Expected {env:String,...} options, encountered ${options}.`);
  }
  return express()
    .get("/verify", verifyMiddleware({ ...defaultOptions, ...options }));
};
