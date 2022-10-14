const http = require("http");
const fs = require("fs");
const qs = require("querystring");
const express = require("express");
let app = express();
const port = 3000;
const ip = "127.0.0.1";
const sendResponse = (filename, statusCode, response) => {
  fs.readFile(`./html/${filename}`, (error, data) => {
    if (error) {
      response.statusCode = 500;
      response.setHeader("Content-Type", "text/plain");
      response.end("Sorry internal error");
    } else {
      response.statusCode = statusCode;
      response.setHeader("Content-Type", "text/html");
      response.end(data);
    }
  });
};
const server = http.createServer((request, response) => {
  const method = request.method;
  let url = request.url;

  if (method === "GET") {
    const requestUrl = new URL(url, `http://${ip}:${port}`);
    url = requestUrl.pathname;
    const lang = requestUrl.searchParams.get("lang");
    let selector;
    if (lang === null || lang === "en") {
      selector = "";
    } else if (lang === "zh") {
      selector = "-zh";
    } else {
      selector = "";
    }

    if (url === "/") {
      sendResponse(`index${selector}.html`, 200, response);
    } else if (url === "/about.html") {
      sendResponse(`about${selector}.html`, 200, response);
    } else if (url === "/login.html") {
      sendResponse(`login${selector}.html`, 200, response);
    } else if (url === "/login-success.html") {
      sendResponse(`login-success${selector}.html`, 200, response);
    } else if (url === "/login-fail.html") {
      sendResponse(`login-fail${selector}.html`, 200, response);
    } else {
      sendResponse(`404${selector}.html`, 404, response);
    }
  } else {
    if (url === "/process-login") {
      let body = [];

      request.on("data", (chunk) => {
        body.push(chunk);
      });
      request.on("end", (chunk) => {
        body = Buffer.concat(body).toString();
        body = qs.parse(body);
        console.log(body);
        if (body.username === "john" && body.password === "john123") {
          response.statusCode = 301;
          response.setHeader("Location", "/login-success.html");
        } else {
          response.statusCode = 301;
          response.setHeader("Location", "/login-fail.html");
        }
        response.end();
      });
    }
  }
});

server.listen(port, ip, () => {
  console.log("server is running at http://" + ip + ":" + port);
});

//api
//const port2 = 8080;
app.get("/json_data", function (req, res) {
  const data = require("./data.json");
  res.json(data);
});
//api http://127.0.0.1:8080/parameters?head=Head&para=paragraph
app.get("/parameters", function (req, res) {
  const head_info = req.query.head;
  const para_info = req.query.para;
  head_html = `<h1>` + head_info + `</h1>`;
  paragraph_html = `<p>` + para_info + `</p>`;
  res.send(head_html + paragraph_html);
});
//使用express 解析json文件
app.use(express.json());
//接收post json格式請求 返回json格式
app.post("/handle", function (req, res) {
  console.log(req.body);
  res.json(req.body);
});
//監聽8080port
app.listen(8080, () => {
  console.log(`server is running at http://localhost:8080`);
});
