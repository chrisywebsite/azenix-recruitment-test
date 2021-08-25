import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();
const baseUrl = "https://base.com/";

interface ShortenUrl {
  token: string;
  shortenUrl: string
}

const shortenUrlsCollection = db.collection("shortenUrls");

const log = (...args: Array<any>): void => {
  functions.logger.info(...args, {structuredData: true});
};

const generateShortenUrl = (url: string): Promise<ShortenUrl> =>
  shortenUrlsCollection.add({url}).then((result) => {
    const token = result.id;
    const shortenUrl = `${baseUrl}${token}`;
    return {token, shortenUrl};
  });

const getOriginalUrl = (token: string): Promise<string | undefined> =>
  shortenUrlsCollection.doc(token).get().then((result) => result.get("url"));

const httpErrorBody = (status: number, detail: string): {
  type: string,
  title: string,
  status: number,
  detail: string,
  instance: string
} => ({
  type: "error",
  title: detail,
  status,
  detail,
  instance: "",
});
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
export const helloWorld = functions.https.onRequest((request, response) => {
  log("Hello logs!");
  response.send("Hello from Firebase!");
});

export const shorten = functions.https.onRequest(async (request, response) => {
  log("request", request.body);

  if (!request?.body?.url) {
    response.status(400).send(httpErrorBody(400, "url is not provided"));
    return;
  }

  try {
    response.send(await generateShortenUrl(request.body.url));
  } catch (e) {
    log("error: ", e);
    response.status(500).send(httpErrorBody(500, "something wrong"));
  }
});


export const expand = functions.https.onRequest(async (request, response) => {
  log("request", request.path);

  if (!request?.path) {
    response.status(400).send(httpErrorBody(400, "data is not provided"));
    return;
  }

  const [token] = request.path.split("/").filter((_) => !!_);

  log("token:", token);
  const url = await getOriginalUrl(token);
  log("url:", url);
  if (url) {
    response.send({url});
    return;
  }

  response.status(500).send(httpErrorBody(500, "something wrong"));
});

