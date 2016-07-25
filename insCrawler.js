'use strict'
var request =  require('request');
var FormData = require('form-data');

class insUploader{

	constructor(tag){

		this.token = ''
		this.startingCurson = '1302301334460794949';
		this.tagList=[];
		this.searchingTag = tag;
		this.imageList = null;
		this.pageSize = 5;
	}

	retrictImageList(){

		var self = this;

		request.post('https://www.instagram.com/query/', {form:{

			q:`ig_hashtag(${self.searchingTag}) { media.after(${self.startingCursor}, ${self.pageSize}) {  count,  nodes {    caption,    code,    comments {      count    },    date,    dimensions {      height,      width    },    display_src,    id,    is_video,    likes {      count    },    owner {      id    },    thumbnail_src,    video_views  },  page_info} }`,
			ref:'tags::show'
			},
			headers:{

				'Referer':`https://www.instagram.com/explore/tags/${self.searchingTag}/`,
				'X-CSRFToken':'tSzmZWirB0u6E1crxJIjRMVz63nCSD84',
				'cookie':'mid=V5Jr9AAEAAF5E3GqbjhUyjEBetFg; sessionid=IGSC109b21ad272ce8fbd121d2b953ce875e2b851e4ea0c2ef849e06dfb03a1e3259%3AFa1SvbNESHLZyZiZ8JxeJYhUeH6gncoJ%3A%7B%22_token_ver%22%3A2%2C%22_auth_user_id%22%3A3544540982%2C%22_token%22%3A%223544540982%3ApR2LtL549AY8Q3WUnONDLJh2skPULuKt%3A1a5d16e622ba96bec9e7d6d8751c9b365c1e432496b2a43f42879f40d60348aa%22%2C%22asns%22%3A%7B%2250.67.172.56%22%3A6327%2C%22time%22%3A1469213761%7D%2C%22_auth_user_backend%22%3A%22accounts.backends.CaseInsensitiveModelBackend%22%2C%22last_refreshed%22%3A1469214493.103226%2C%22_platform%22%3A4%2C%22_auth_user_hash%22%3A%22%22%7D; ig_pr=2; ig_vw=1440; s_network=; csrftoken=tSzmZWirB0u6E1crxJIjRMVz63nCSD84; ds_user_id=3544540982; 123=; mid=V5Jr9AAEAAF5E3GqbjhUyjEBetFg; sessionid=IGSC109b21ad272ce8fbd121d2b953ce875e2b851e4ea0c2ef849e06dfb03a1e3259%3AFa1SvbNESHLZyZiZ8JxeJYhUeH6gncoJ%3A%7B%22_token_ver%22%3A2%2C%22_auth_user_id%22%3A3544540982%2C%22_token%22%3A%223544540982%3ApR2LtL549AY8Q3WUnONDLJh2skPULuKt%3A1a5d16e622ba96bec9e7d6d8751c9b365c1e432496b2a43f42879f40d60348aa%22%2C%22asns%22%3A%7B%2250.67.172.56%22%3A6327%2C%22time%22%3A1469213761%7D%2C%22_auth_user_backend%22%3A%22accounts.backends.CaseInsensitiveModelBackend%22%2C%22last_refreshed%22%3A1469214493.103226%2C%22_platform%22%3A4%2C%22_auth_user_hash%22%3A%22%22%7D; ig_pr=2; ig_vw=1440; csrftoken=tSzmZWirB0u6E1crxJIjRMVz63nCSD84; s_network=; ds_user_id=3544540982'
			}

		},(err,httpResponse,body)=>{

			body = JSON.parse(body);
			console.log(body);
			let imageList = body.media.nodes;
			self.imageList = imageList;
			self.logIn();
		})
	}

	logIn(){

		let self = this;
		request({
		method:'POST',
		url:'https://api.scopephotos.com/v1/login',
		headers:{
		'Authorization':'Basic c2V5bW91ci13ZWI6YVJiYXoyOWR2aUIlITpxLTBwMTV0'
		},
		form:{
			'grant_type':'password',
			'username':'instagramscope@scopemedia.com',
			'password':'123456'
		}
		},function(err,res){

			console.log(err,res.body)
			res.body  = JSON.parse(res.body);
			if(!err){

				self.token = 'bearer ' + res.body.access_token;
				console.log(self.token);
				self.fetOneImage();
			}
	  })
	}


	fetOneImage(){

		var self = this;
		for(let i in this.imageList){

			setTimeout(()=>{
					console.log(self.imageList[i])
					self.getSingleInfo(self.imageList[i].code,self.imageList[i].thumbnail_src);

			}, i * 0)
		}
	}

	getSingleInfo(code,thumbnail_src){

		var self = this;
		request.get(`https://www.instagram.com/p/${code}/?tagged=${self.searchingTag}&__a=1`,(err,res,body)=>{

			body = JSON.parse(body);
			body.thumbnail_src = thumbnail_src;
			self.uploadToScope(body);

		})

	}

	uploadToScope(body){

		var self = this;


			//body.media.dimensions.width
			//body.media.dimensions.height
			//body.media.owner.username
			//body.media.owner.profile_pic_url
			//body.media.owner.id
			//body.media.caption,
			//body.media.date
			//body.media.display_src
			//body.media.is_ad
			//body.media.is_video
			//body.media.location.name

			let tagList = body.media.caption.split('#');
			let tagListF = [];
			tagListF.push({'text':self.searchingTag,'probability':1});
			for(let t in tagList){

				if(tagList[t].trim().indexOf(' ')<0){

					tagListF.push({'text':tagList[t].trim(),'probability':1});
				}
			}
			let uploadImage = {

				'mediaType':'IMAGE',
				'description':body.media.caption,
				'shotTime':body.media.date * 1000,
				'uploadTime':Date.now(),
				'location':body.media.location?{'text':body.media.location.name}:null,
				'tags':tagListF,
				'mediaData':[

					{'fileName':body.media.display_src,'width':body.media.dimensions.width,'height':body.media.dimensions.height,'resolution':'RTN'},
					{'fileName':body.thumbnail_src,'width':293,'height':293,'resolution':'TMB'}

				],
				sourceOwner:{

					'id':body.media.owner.id,
					'username':body.media.owner.username,
					'profile_picture':body.media.owner.profile_pic_url

				},
				sourceType:'IN'
			}

			console.log('uploadImage')
			console.log(uploadImage);
			console.log(self.token)


			request({
						url:'https://api.scopephotos.com/v1/image',
						method:'POST',
						headers:{

						"Authorization":self.token,
						"Content-Type":"application/json"
						},
						body:JSON.stringify(
							uploadImage
						)
						},function(err,res){
						console.log('upload rsult');
						console.log(err,res.body);
						})
	}

}

new insUploader('china').retrictImageList();