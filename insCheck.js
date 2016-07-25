'use strict'
const express = require('express'),
	  bodyParser = require('body-parser'),
	  app = express(),
	  port = 3000,
	  Authorization = 'Basic VsJX0LSys1UJvblOz5W2',
	  MongoClient = require('mongodb').MongoClient,
	  url = 'mongodb://mickeymac.local:27017/test';
	  MongoClient.connect(url, function(err, db) {
		 if(!err){
		 	new Server(db,app).init();
		 }
	  });

class Server{

	constructor(db){

		this.db = db;
		this.app = app;
	}

	init(){

		this.config();
		
		app.listen(3000);
	}

	config(){

		var self = this;
		this.app.use(bodyParser.json()); // support json encoded bodies
		this.app.use(bodyParser.urlencoded({ extended: true }));
		this.app.get('/getGeoCode/:geoId', (req,res)=>{
			if(req.header('Authorization') != Authorization){
				res.status(400);
				res.end('BAD Authorization');
			}else{
				console.log(req.params.geoId);
				self.db.collection('insGeoId').findOne({_id:req.params.geoId},(err,ele)=>{
					if(!err && !ele){
						res.json({result: "NOT_FOUND", op: "NONE"});
					}else if(!err && ele){
						res.json({result: "FOUND", op: "NONE"});
					}else{
						res.json({result: "", op: "UNKNOW_ERROR"})
					}
				})
			}
		});//get 



		this.app.post('/getGeoCode', (req,res)=>{
			if(req.header("Authorization") != Authorization){
				res.status(400);
				res.end('Bad Authorization')
			}else{
				console.log("POST: ");
				console.log(req.body);
				self.db.collection('insGeoId').findOne({_id:req.body.location}, (err,ele)=>{
					if(!err && !ele){
						self.db.collection('insGeoId').insertOne({
							_id: req.body.location,
							lat: req.body.lat,
							lon: req.body.lon,
						}, (err)=>{

							if(!err){

								res.json({result: "NEW_GEO", op:"ADDED"})
							}
						})
					}else if(!err && ele){

						res.json({result: "DUPLICATE_GEO", op: "NONE"})

					}else{

						res.json({result: "", op: "UNKNOW_ERROR"})
					}				
				})
				
			}
		});

		this.app.get('/verifyMediaId/:mediaId',(req,res)=>{
			if(req.header('Authorization') != Authorization){

				res.status(400);
				res.end('Bad Authorization')

			}else{

			self.db.collection('insMediaId').findOne({_id:req.params.mediaId},(err,ele)=>{

				if(!err && !ele){

					self.db.collection('insMediaId').insertOne({

						_id:req.params.mediaId

					},(err)=>{

						if(!err){

							res.json({result:'NEW',op:'ADDED'})
						}
					})
				}else if(!err && ele){

					res.json({result:'DUPLICATE',op:'NONE'})

				}else{

					res.json({result:'',op:'UNKNOW_ERROR'})
				}
			})
		  }
		})
	}

}



