import express from "express";
import { wyre } from "express-wyre";

express()
  .use("/wyre", wyre({ env: "test" }))
  .listen(3000, () => null);
