'use strict'

const fs = require('fs');
var text = fs.readFileSync('tags.txt','utf8');
var childProcess = require('child_process');
var tagList = text.replace(/\s/g, '').split('#')
	tagList.splice(0,1);



class autoScript{

	constructor(tagList){

		this.tagList = tagList;
		this.tagIndex = 0;
		this.insCrawler = null;

	}

	init(){

		this.tagIndex = 0;
		this.createNextCrawler();
	}

	createNextCrawler(){

		var self = this;
		if(self.tagList[self.tagIndex]){


			self.insCrawler = childProcess.fork(`./insCrawler.js`,[(self.tagList[self.tagIndex]).toLowerCase()]);
			self.insCrawler.on('error', function (err) {

				console.log('error');
				self.insCrawler.kill();
			});
			self.insCrawler.on('exit', function (err) {

				console.log('exist')
				self.insCrawler.kill();
				self.tagIndex++;
				self.createNextCrawler();
			});
		}

	}

}

new autoScript(tagList).init();

