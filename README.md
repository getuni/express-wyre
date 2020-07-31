# express-sendwyre
[express](https://github.com/expressjs/express) middleware for hosting [**Wyre**](https://www.sendwyre.com/) verification.

## 🚀 Installing

Using [**yarn**](https://yarnpkg.com):

```bash
yarn add express-sendwyre
```

## ✍️ Usage

Once installed, insert the middleware into your existing [`express`](https://github.com/expressjs/express) app at an appropriate path:

```javascript
import express from "express";
import { verify } from "express-sendwyre";

express()
  .use("/wyre/verify", verify({ env: "test" })) // sandbox mode
  .listen(3000, () => null);
```

In this example, your clients may then make [`HTTP GET`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) requests to [`http://localhost:3000/wyre/verify`](http://localhost:3000/wyre/verify).

### 🦮 Retrieving the Access Token
The verification process served by [**Wyre**](https://www.sendwyre.com/) returns an [**access token**](https://docs.sendwyre.com/docs/authentication) which is used to enumerate your authenticated user, which can be returned back to the frontend by specifying a [base-64 encoded](https://github.com/mathiasbynens/base64) `redirect` URL query parameter:

```javascript
const addressToReturnTokenTo = "myapp://";
const requestUri = `http://localhost:3000/wyre/verify?redirect=${btoa(addressToReturnTokenTo)}`;
``` 

Upon successful verification, the browser will be redirected to the supplied `redirect` URI with the base-64 encoded `wyreToken`:

```javascript
const successRedirectUrl = `myapp://?wyreToken=${btoa(wyreAccessToken)}`;
```

On error, the browser will redirect to the specified URI and provide the base-64 encoded `wyreError` message as a URL parameter:

```javascript
const errorRedirectUrl = `myapp://?wyreError=${btoa(errorMessage)}`;
```

## ✌️ Licence
[**MIT**](./LICENSE)
