import * as functions from "firebase-functions";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

export const shorten = functions.https.onRequest((request, response) => {
  console.log("request: %o", request);
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send({token: "1", shortenUrl: "something"});
});


export const expand = functions.https.onRequest((request, response) => {
  console.log("request: %o", request);
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send({token: "2", shortenUrl: "something", url: "original url"});
});

