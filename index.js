const express = require("express");
const http = require("http");
const fs = require('fs');
const { Client } = require("pg");
const helmet = require('helmet');

const sharp = require('sharp');

var client = new Client({
  user: 'snoujzykwadyvi',
  password: '6ca023c82ccceb8d2da62c763a73076af89b5ef427a4a7efb953aba11c670fca',
  database: 'db6pb86l1dqtom', host: 'ec2-54-75-184-144.eu-west-1.compute.amazonaws.com', port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});
client.connect();

var listaImagini;
var anotimpuri;

const getSeason = (d) => Math.floor((d.getMonth() / 12) * 4) % 4;

function genereazaGalerie() {
  var buf = fs.readFileSync(__dirname + "/resources/json/imagini.json").toString("utf-8");
  listaImagini = JSON.parse(buf);

  var buf = fs.readFileSync(__dirname + "/resources/json/anotimpuri.json").toString("utf-8");
  anotimpuri = JSON.parse(buf);
  var galerie = { cale_galerie: "/resources/images", imagini: [] };
  var anotimp = anotimpuri[getSeason(new Date())];

  for (var i = 0; i < listaImagini.length; i++) {
    if (listaImagini[i].anotimp == anotimp) {
      galerie.imagini.push(listaImagini[i]);
      sharp('./resources/images' + listaImagini[i].cale_fisier)
        .resize((anotimp === "toamna" && i == 1) ? 200 : 350, (anotimp === "toamna" && i == 1) ? 300 : 262)
        .toFile(__dirname + ('/resources/images/' + listaImagini[i].cale_fisier).replace('.jpg', 'mediu.jpg'))
      sharp('./resources/images' + listaImagini[i].cale_fisier)
        .resize((anotimp === "toamna" && i == 1) ? 150 : 250, (anotimp === "toamna" && i == 1) ? 225 : 187)
        .toFile(__dirname + ('/resources/images/' + listaImagini[i].cale_fisier).replace('.jpg', 'mic.jpg'))
    }
  }
  //this is done to fill in the grid. 
  while (galerie.imagini.length < 10) {
    galerie.imagini.push(galerie.imagini[galerie.imagini.length % 3])
  }
  if (galerie.imagini.length > 10) {
    galerie.imagini = galerie.imagini.splice(10);
  }
  return galerie;
}

app = express();

app.set("view engine", "ejs");

app.use(helmet.frameguard());//pentru a nu se deschide paginile site-ului in frame-uri

var client; //folosit pentru conexiunea la baza de date
if (process.env.SITE_ONLINE) {
  protocol = "https://";
  numeDomeniu = "dealer-auto-project.herokuapp.com/"//atentie, acesta e domeniul pentru aplicatia mea; voi trebuie sa completati cu datele voastre
  client = new Client({
    user: 'snoujzykwadyvi',
    password: '6ca023c82ccceb8d2da62c763a73076af89b5ef427a4a7efb953aba11c670fca',
    database: 'db6pb86l1dqtom', host: 'ec2-54-75-184-144.eu-west-1.compute.amazonaws.com', port: 5432,
    ssl: {
      rejectUnauthorized: false
    }
  });

}
else {
  client = new Client({
    user: 'snoujzykwadyvi',
    password: '6ca023c82ccceb8d2da62c763a73076af89b5ef427a4a7efb953aba11c670fca',
    database: 'db6pb86l1dqtom', host: 'ec2-54-75-184-144.eu-west-1.compute.amazonaws.com', port: 5432,
    ssl: {
      rejectUnauthorized: false
    }
  });
  protocol = "http://";
  numeDomeniu = "localhost:8080";
}

client.connect();

app.use("/resources", express.static(__dirname + "/resources"));

app.get("/ /index", function (req, res) {
  // res.sendFile(__dirname + "/index.html");
  res.render("pages/index.ejs");
});

// pt a merge pe alta pagina
app.get("/pagina", function (req, res) {
  res.write("pag2");
  res.end();
});
// conteaza ordinea
app.get("/*.ejs", function (req, res) {
  res.status(403);
  res.render("pages/403.ejs");
  res.send();
});

app.get("/produse", function (req, res) {
  var conditie = ""
  if (req.query.tip)
    conditie += ` and combustibil_folosit='${req.query.combustibil}'`;
  client.query(`select * from produse where 1=1 ${conditie}`, function (err, rez) {
    if (!err) {
      client.query("select * from unnest(enum_range(null::combustibil))", function (errCateg, rezCateg) {
        v_optiuni = [];
        for (let elem of rezCateg.rows) {
          v_optiuni.push(elem.unnest);
        }
        res.render("pages/produse", { produse: rez.rows, optiuni: v_optiuni });
      })

    }
    else {//TO DO mavigate to error page
      res.status(403);
      res.render("pages/403.ejs");
      res.send();
    }
  })
})


app.get("/produs/:id", function (req, res) {
  client.query(`select * from produse where id=${req.params.id}`, function (err, rez) {
    if (!err) {
      res.render("pages/produs", { prod: rez.rows[0] });
    }
    else {//TO DO curs
    }
  })
})

app.get("/*", function (req, res) {
  var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  res.render(
    "pages" + req.url,
    { ip: ip, galerie: genereazaGalerie() },
    function (err, rezRender) {
      if (err) {
        console.log(err)
        res.status(404);
        res.render("pages/404.ejs");
        res.send();
      } else {
        res.send(rezRender);
      }
    }
  );
});

var port = process.env.PORT || 8080;
var server = app.listen(port, function () {
  console.log("app running on port 8080");
});
