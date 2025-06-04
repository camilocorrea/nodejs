const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// URLs
const appLinkUrl = "https://nodejs-psi-five.vercel.app/open"; // App Link común iOS y Android

// URLs
const UriLink = "wpy://nodejs-psi-five.vercel.app/open"; // App Link común iOS y Android

// Android
const playStoreUrl = "https://play.google.com/store/apps/details?id=cl.transbank.onepay"; 

// iOS - URL HTTPS para App Store (no usar itms-apps:// por restricciones WKWebView)
const appStoreUrl = "https://apps.apple.com/cl/app/onepay-paga-fácil-y-rápido/id1432114499";

// Android Intent URL con fallback
const androidIntentUrl = `intent://nodejs-psi-five.vercel.app/open#Intent;scheme=https;package=com.example.myapp;S.browser_fallback_url=${playStoreUrl};end`;

// iOS custom URI scheme con fallback (ajusta el scheme según tu app)
const iosUriScheme = "wpy://nodejs-psi-five.vercel.app/open";

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/redirect", (req, res) => {
  const type = req.query.type;
  const userAgent = req.headers["user-agent"] || "";
  const uaLower = userAgent.toLowerCase();
  const isWebView = /wv|webview/.test(uaLower);
  const isAndroid = /android/.test(uaLower);
  const isIOS = /iphone|ipad|ipod/.test(uaLower);

  console.log("Redirección solicitada:", type);
  console.log("User-Agent:", userAgent);
  console.log("Plataforma detectada - iOS:", isIOS, "Android:", isAndroid, "WebView:", isWebView);

  if (isAndroid) {
    if (type === "applink") {
      if (isWebView) {
        console.log("Android WEBVIEW: redirigiendo a Android Intent URL");
        res.redirect(androidIntentUrl);
      } else {
        console.log("Android NAVEGADOR: redirigiendo a App Link");
        res.redirect(appLinkUrl);
      }
    } else if (type === "intent") {
      console.log("Android redirección tipo intent");
      res.redirect(androidIntentUrl);
    } else if (type === "uri") {
      console.log("Android redirección tipo uri");
      res.redirect(UriLink);
    } else {
      res.status(400).send("Tipo de redirección no soportado para Android.");
    }
  } else if (isIOS) {
    if (type === "applink") {
      if (isWebView) {
        console.log("iOS WEBVIEW: redirigiendo a iOS URI Scheme");
        res.redirect(iosUriScheme);
      } else {
        console.log("iOS NAVEGADOR: redirigiendo a App Link");
        res.redirect(appLinkUrl);
      }
    } else if (type === "intent") {
      console.log("iOS redirección tipo intent: URI scheme con fallback a App Store");
      // iOS no tiene intent, redirigimos a scheme; el fallback lo debe manejar la app o el navegador
      res.redirect(iosUriScheme);
    } else if (type === "uri") {
      console.log("iOS redirección tipo uri");
      res.redirect(UriLink);
    } else {
      res.status(400).send("Tipo de redirección no soportado para iOS.");
    }
  } else {
    res.status(400).send("Plataforma no soportada.");
  }
});

app.get("/open", (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  const uaLower = userAgent.toLowerCase();
  const isWebView = /wv|webview/.test(uaLower);
  const isAndroid = /android/.test(uaLower);
  const isIOS = /iphone|ipad|ipod/.test(uaLower);

  console.log("Ruta /open llamada");
  console.log("User-Agent:", userAgent);
  console.log("Detectado iOS:", isIOS);
  console.log("Detectado Android:", isAndroid);
  console.log("Detectado WebView:", isWebView);

  if (isAndroid && isWebView) {
    console.log("Android WebView detectado: redirigiendo a Android Intent URL");
    res.redirect(androidIntentUrl);
  } else if (isIOS && isWebView) {
    console.log("iOS WebView detectado: redirigiendo a iOS URI Scheme");
    res.redirect(iosUriScheme);
  } else if (isIOS) {
    console.log("iOS navegador detectado: redirigiendo a App Store HTTPS");
    res.redirect(playStoreUrl);
  } else if (isAndroid) {
    console.log("Android navegador detectado: redirigiendo a Play Store");
    res.redirect(playStoreUrl);
  } else {
    console.log("Plataforma no soportada en /open");
    res.status(400).send("Plataforma no soportada en /open.");
  }
});

const aasa = {
  applinks: {
    apps: [],
    details: [
      {
        appID: "FUW94HY3E6.transbank.walletlinkqr",
        paths: ["/open/*"]
      }
    ]
  }
};

app.get("/.well-known/apple-app-site-association", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(aasa)); // No indentación, sin pretty-print
});

// 👇 ESTE ES EL CAMBIO CLAVE
module.exports = serverless(app);

