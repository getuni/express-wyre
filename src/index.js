import express from "express";
import { OK } from "http-status-codes";
import { compile } from "handlebars";
import { decode as atob } from "base-64";
import { typeCheck } from "type-check";

const defaultOptions = Object.freeze({
  env: "test",
});

const maybeRedirect = (redirect) => {
  if (redirect === undefined) {
    return "null";
  } else if (typeCheck("String", redirect)) {
    return `"${atob(redirect)}"`;
  }
  throw new Error(`Encountered invalid redirect.`);
};

const verifyMiddleware = ({ ...options }) => async (req, res, next) => {
  try {
    const { query } = req;
    const html = `
<!DOCTYPE html>
  <html>
  <head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.3/jquery.min.js"></script>
  <script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"></script>
  <script src="https://verify.sendwyre.com/js/pm-widget-init.js"></script>
  <script type="text/javascript">
    var redirect = {{{redirect}}}; 
    function shouldRedirect(results) {
      var q = redirect.includes("?") ? "&" : "?";
      window.location.href = redirect + q + results;
    }
    var handler = new WyrePmWidget({
      env: "{{{env}}}",
      onLoad: function() {
        handler.open();
      },
      onSuccess: function(result) {
        if (redirect) {
          shouldRedirect("wyreToken=" + btoa(result.publicToken));
        }
      },
      onExit: function(err) {
        if (redirect) {
          shouldRedirect("wyreError=" + btoa(err.toString()));
        }
      }
    });
    </script>
  </head>
  <body></body>
</html>
      `.trim();
    return res.status(OK).send(
      compile(html)({
        ...options,
        redirect: maybeRedirect(query.redirect),
      })
    );
  } catch (e) {
    return next(e);
  }
};

export const verify = (options = defaultOptions) =>
  express().get("/", verifyMiddleware({ ...defaultOptions, ...options }));
