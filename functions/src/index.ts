import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();
const baseUrl = "https://base.com/";

interface ShortenUrl {
  token: string;
  shortenUrl: string
}

const hashCode = (s: string): string => {
  let hash = 0;
  let i;
  let chr;
  if (s.length === 0) return `${hash}`;
  for (i = 0; i < s.length; i++) {
    chr = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return `${hash}`;
};

const shortenUrlsCollection = db.collection("shortenUrls");
const urlsCollection = db.collection("urls");

const log = (...args: Array<any>): void => {
  functions.logger.info(...args, {structuredData: true});
};

const shortenUrlFromToken = (token: string): ShortenUrl =>
  ({token, shortenUrl: `${baseUrl}${token}`});

const generateShortenUrl = (url: string): Promise<ShortenUrl> =>
  urlsCollection.doc(hashCode(url)).get().then((snapshot) => {
    log("snapshot:", snapshot);
    return snapshot && snapshot.get("token") as string;
  }).then((existingDoc) =>
    existingDoc ||
    shortenUrlsCollection.add({url}).then((result) => {
      const token = result.id;
      return urlsCollection.doc(hashCode(url)).set({token}).then(() => token);
    })).then((token) => shortenUrlFromToken(token));

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
  instance: "something",
});

const sendError = (resp: any, status: number, error: string): void => {
  resp.set("Content-Type", "application/json");
  resp.status(status).send(httpErrorBody(status, error));
};

const sentResponse = (resp: any, obj: any): void => {
  resp.set("Content-Type", "application/json");
  resp.send(obj);
};
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
export const helloWorld = functions.https.onRequest((request, response) => {
  log("Hello logs!");
  response.send("Hello from Firebase!");
});

export const shorten = functions.https.onRequest(async (request, response) => {
  log("request", request.path, ",headers:", request.headers);
  const key = request.headers["x-user-key"];

  if (!key) {
    sendError(response, 401, "Not authorized!");
    return;
  }

  if (!request?.body?.url) {
    sendError(response, 400, "url is not provided");
    return;
  }

  try {
    sentResponse(response, await generateShortenUrl(request.body.url));
  } catch (e) {
    log("error: ", e);
    response.status(500).send();
  }
});


export const expand = functions.https.onRequest(async (request, response) => {
  log("request", request.path, ",headers:", request.headers);
  const key = request.headers["x-user-key"];

  if (!key) {
    sendError(response, 401, "Not authorized!");
    return;
  }

  if (!request?.path) {
    sendError(response, 400, "data is not provided");
    return;
  }

  const [token] = request.path.split("/").filter((_) => !!_);

  if (!token) {
    sendError(response, 401, "token is not provided");
    return;
  }

  log("token:", token);
  const expandedUrl = await getOriginalUrl(token);
  log("url:", expandedUrl);
  if (expandedUrl) {
    sentResponse(response, {expandedUrl});
    return;
  }

  response.status(500).send();
});

