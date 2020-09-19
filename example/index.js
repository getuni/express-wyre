import express from "express";
import { verify } from "express-wyre";

express()
  .use("/wyre/verify", verify({ env: "test" })) // sandbox mode
  .listen(3000, () => null);
