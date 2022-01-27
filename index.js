const express = require("express");
const http = require("http");

app = express();
console.log(__dirname);

app.set("view engine", "ejs");

app.use("/resources", express.static(__dirname + "/resources"));

app.get("/ /index", function (req, res) {
  console.log(req.url);
  // res.sendFile(__dirname + "/index.html");
  res.render("pages/index.ejs");
});
// pt a merge pe alta pagina
app.get("/pagina", function (req, res) {
  console.log(req.url);
  res.write("pag2");
  res.end();
});
// conteaza ordinea
app.get("/*.ejs", function (req, res) {
  res.status(403);
  res.render("pages/403.ejs");
  res.send();
});
app.get("/*", function (req, res) {
  console.log(req.url);
  var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  console.log(ip);
  res.render("pages" + req.url, { ip: ip }, function (err, rezRender) {
    console.log(err);
    if (err) {
      res.status(404);
      res.render("pages/404.ejs");
      res.send();
    } else {
      console.log(rezRender);
      res.send(rezRender);
    }
  });
});

app.listen(8080); //asta ultima linie

console.log("Serverul a pornit");
