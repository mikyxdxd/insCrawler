'use strict'
const express = require('express'),
	  app = express(),
	  port = 3000,
	  Authorization = 'Basic VsJX0LSys1UJvblOz5W2',
	  MongoClient = require('mongodb').MongoClient,
	  url = 'mongodb://localhost:27017/test';
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


		this.app.get('/verifyMediaId/:mediaId',(req,res)=>{

			if(req.header('Authorization') != Authorization){

				res.status(400);
				res.end('Bad Authorizattion')

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



