const express = require("express");
const http = require("http");
var listaImagini = [
  {
    cale_fisier: "/iarna/iarna1.png",
    titlu: "Nume imagine",
    text_descriere: "text descriere",
    anotimp: "iarna",
  },
  {
    cale_fisier: "/iarna/iarna2.png",
    titlu: "Nume imagine",
    text_descriere: "text descriere",
    anotimp: "iarna",
  },
  {
    cale_fisier: "/iarna/iarna3.png",
    titlu: "Nume imagine",
    text_descriere: "text descriere",
    anotimp: "iarna",
  },
  {
    cale_fisier: "/primavara/primavara1.png",
    titlu: "Nume imagine",
    text_descriere: "text descriere",
    anotimp: "primavara",
  },
  {
    cale_fisier: "/primavara/primavara2.png",
    titlu: "Nume imagine",
    text_descriere: "text descriere",
    anotimp: "primavara",
  },
  {
    cale_fisier: "/primavara/primavara3.png",
    titlu: "Nume imagine",
    text_descriere: "text descriere",
    anotimp: "primavara",
  },
  {
    cale_fisier: "/vara/vara1.png",
    titlu: "Nume imagine",
    text_descriere: "text descriere",
    anotimp: "vara",
  },
  {
    cale_fisier: "/vara/vara2.png",
    titlu: "Nume imagine",
    text_descriere: "text descriere",
    anotimp: "vara",
  },
  {
    cale_fisier: "/vara/vara3.png",
    titlu: "Nume imagine",
    text_descriere: "text descriere",
    anotimp: "vara",
  },
  {
    cale_fisier: "/toamna/toamna1.png",
    titlu: "Nume imagine",
    text_descriere: "text descriere",
    anotimp: "toamna",
  },
  {
    cale_fisier: "/toamna/toamna2.png",
    titlu: "Nume imagine",
    text_descriere: "text descriere",
    anotimp: "toamna",
  },
  {
    cale_fisier: "/toamna/toamna3.png",
    titlu: "Nume imagine",
    text_descriere: "text descriere",
    anotimp: "toamna",
  },
];

const getSeason = (d) => Math.floor((d.getMonth() / 12) * 4) % 4;
var anotimpuri = ["iarna", "primavara", "vara", "toamna"];

function genereazaGalerie() {
  var galerie = { cale_galerie: "../images", imagini: [] };
  var anotimp = anotimpuri[getSeason(new Date())];
  for (var i = 0; i < listaImagini.length; i++) {
    if (listaImagini[i].anotimp == anotimp) {
      galerie.imagini.push(listaImagini[i]);
    }
  }
  return galerie;
}

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

  res.render(
    "pages" + req.url,
    { ip: ip, galerie: genereazaGalerie() },
    function (err, rezRender) {
      console.log(err);
      if (err) {
        res.status(404);
        res.render("pages/404.ejs");
        res.send();
      } else {
        console.log(rezRender);
        res.send(rezRender);
      }
    }
  );
});

var port = process.env.PORT || 8080;
var server = app.listen(port, function () {
  console.log("app running on port 8080");
});
