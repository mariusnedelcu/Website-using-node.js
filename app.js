'use strict';
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const cookieParser=require('cookie-parser');
const app = express();
var mysql = require('mysql2');
const port = 6789;


// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');
// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-ului este views/layout.ejs
app.use(expressLayouts);
// directorul 'public' va conține toate resursele accesibile direct de către client (e.g., fișiere css, javascript, imagini)
app.use(express.static('public'))
// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în format json în req.body
app.use(bodyParser.json());
// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'Hello World'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res
app.get('/', (req, res) => {
	let msgLog="";
	var listaProd={};
	if(req.cookies!=null && req.cookies.utiliz!=null)
	{
		msgLog="Bine ai venit "+req.cookies.utiliz;
	}
	var con = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "marius"
	  });
	con.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
		con.query("USE Cumparaturi",function(err){
			if (err) {
				console.log("Nu Exista Baza de date");
				res.render('index',{msgLog:msgLog,listProd:listaProd});
			}else{
				console.log("use databases");
				con.query("SELECT * FROM Produse;",function(err,result){
					if (err){
						console.log("Nu exista tabela");
						res.render('index',{msgLog:msgLog,listProd:listaProd});
					}else{
						listaProd=result;
						res.render('index',{msgLog:msgLog,listProd:listaProd});
					}	
				});
			}
		});
	});
});

'use strict'; 
const fs = require('fs');

//citire json 
let intrebari; 
fs.readFile('intrebari.json',(err,data) => { 
	if(err) throw err; 
	intrebari = JSON.parse(data); 
});

let utilizatori;
fs.readFile('utilizatori.json',(err,data) => { 
	if(err) throw err; 
	utilizatori = JSON.parse(data); 
});
// la accesarea din browser adresei http://localhost:6789/chestionar se va apela funcția specificată
app.get('/chestionar', (req, res) => {
	// în fișierul views/chestionar.ejs este accesibilă variabila 'intrebari' care conține vectorul de întrebări
	res.render('chestionar', {intrebari: intrebari});
});

app.post('/rezultat-chestionar', (req, res) => {
	var nrIntrebariCorecte = 0; 
	var nrIntrebarigresite =0;
	for(var i = 0 ; i < intrebari.length ; i++)
	{ 
		if(req.body['intrebare'+i] == intrebari[i].corect)
		{ 
			nrIntrebariCorecte ++; 
		}
		else{
			nrIntrebarigresite ++;
		}
	}
	if(nrIntrebarigresite <= 4){
		res.render('rezultat-chestionar',{nrIntrebariCorecte, nrIntrebarigresite});
	}
});


app.get('/autentificare',(req,res)=>{
	let msgEr="";
	
	if(req.cookies!=null && req.cookies.mesajEr!=null)
	{
		msgEr=req.cookies.mesajEr;
		console.log(req.cookies.mesajEr);
		res.cookie("mesajEr","",{maxAge: 0});
	}
	res.render('autentificare',{msgEr:msgEr});
});

app.post('/verificare-autentificare',(req,res)=>{
	console.log(req.body);
	
	let u=req.body.name;
	let p=req.body.pass;
	var flag=0;
	for(var i=0;i<utilizatori.length;i++)
	{
		if(u==utilizatori[i].name && p==utilizatori[i].password)
			flag=1
	}
	if(flag==1){
		res.cookie("utiliz",u);
		res.redirect('/');
	}else{
		res.cookie("mesajEr","Date invalide");
		console.log(req.cookies.mesajEr);
		res.redirect('/autentificare');
	}
});




app.get('/de-logare',(req,res)=>{
	res.cookie("mesajEr","",{maxAge: 0});
	res.cookie("utiliz","",{maxAge: 0});
	res.redirect('/');
});

app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:`));