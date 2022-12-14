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
          response.statusCode = 301; //3XX ???????????????
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
//??????express ??????json??????
app.use(express.json());
//??????post json???????????? ??????json??????
app.post("/handle", function (req, res) {
  console.log(req.body);
  res.json(req.body);
});
//???????name=xxx???json?????? ./??????????????????,???server.js????????????
app.get("/json_file", (req, res) => {
  try {
    let data = fs.readFileSync(`./${req.query.name}.json`);
    res.json(JSON.parse(data));
  } catch (err) {
    console.error(err);
    res.send({ error: err.toString() });
  }
});
//????????????json??????,??????????????????
app.post("/json_file", (req, res) => {
  try {
    const fileName = "./" + req.query.name + ".json";
    bodyData = req.body;
    fs.open(fileName, "r", (err, fd) => {
      //r ???????????????????????????????????????????????????????????????
      if (err) {
        fs.writeFile(fileName, JSON.stringify(bodyData), (err) => {
          //???????????????err ???????????????
          if (err) console.log(err);
        }); // Create new file
      } else {
        let fileContent = JSON.parse(fs.readFileSync(fileName, "utf8")); // ???json????????????
        Object.keys(bodyData).forEach((key) => {
          //key = title,id... ???key????????????
          console.log(key);
          console.log(fileContent[key]);
          console.log(bodyData[key]);
          fileContent[key] = bodyData[key];
        });
        fs.writeFileSync(fileName, JSON.stringify(fileContent)); // ???fileContent????????????
      }
    });
    res.send({ success: "File successfully updated." });
  } catch (err) {
    console.log(err);
    res.send({ error: "Update json file failed." });
  }
});
//????????????json??????
app.delete("/json_file", (req, res) => {
  try {
    fs.unlinkSync("./" + req.query.name + ".json");
    res.send({ success: "File deleted." });
  } catch (err) {
    console.log(err);
    res.send({ error: "Delete file failed." });
  }
});
//??????8080port
app.listen(8080, () => {
  console.log(`server is running at http://localhost:8080`);
});
