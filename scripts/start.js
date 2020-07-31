import express from "express";
import { verify } from "../src";

express().use("/wyre/verify", verify()).listen(3000, console.log);
