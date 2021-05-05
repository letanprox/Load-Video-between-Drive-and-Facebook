const http      = require('http'),
      https     = require('https');
const path = require("path");
const fs = require("fs");
let fetch = require("node-fetch");
const { exec } = require("child_process");
const {google} = require('googleapis');
var MongoClient = require('mongodb').MongoClient;
var urli = "mongodb://localhost:27017/";
let timepk = 0;

let code = 6;
let namevideo = 'boruto_tap_';
let xmax = 1;
let xmin = 50;

let pagefb = '102415588672684';
let tokenfb = 'EAAKTA9ealX8BAAOxz73lLRiNUQEyZBZCADh8egq1Me44HRXZCgOCIm92FoKRnHZADFZAnT7ybpoVjdfYzbJDcWxtO1wY81opmghK6MevF1r2U9a3c31QqrJzZCLZAILc3cZA1mdjxqi4vgCixicCm4FR45ZCiKZBVIgGTQPuUwAnianCQRp9urxKRnp0yVIPVFKqcZD';

let xcode = 20;


MongoClient.connect(urli , { useUnifiedTopology: true } ,async function(err, db) {
    if (err) throw err;
    var dbo = await db.db("aidb");
    var dbo = await dbo.collection("danh_sach_driveapi");

    let query = { index: Number(code)};
    let select = await dbo.find(query).toArray();
    select = JSON.parse(JSON.stringify(select[0]));
    key_api = select.key_api; 
    access_token = select.access_token; 
    console.log("KeyAPI="+key_api);
    let oAuth2Client = new google.auth.OAuth2();
    oAuth2Client.setCredentials({
      access_token:access_token,
      scope: 'https://www.googleapis.com/auth/drive',
    });
    let drive = google.drive({version: 'v3', auth:oAuth2Client});


async function loadurl(url,id,name){
    let fetchs = await fetch(url, {"method": "GET",});
    fetchs = await fetchs.json();
    data_array = JSON.parse(JSON.stringify(fetchs,null,2));
    const file = fs.createWriteStream('Cache/'+name);
    let pkx = 0;
    const request = https.get(data_array.source, function(response) {
        response.pipe(file);
        response.on('data',(da)=>{
            pkx = pkx + 1;
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write('load number data '+name+' : ' + pkx)
        })  
        response.on('end',async ()=>{
            process.stdout.write("\n");
            console.log('Done!');

            let xquery = { index: Number(xcode)};
            let xselect = await dbo.find(xquery).toArray();
            xselect = JSON.parse(JSON.stringify(xselect[0]));
            xaccess_token = xselect.access_token; 
            let xoAuth2Client = new google.auth.OAuth2();
            xoAuth2Client.setCredentials({
              access_token:xaccess_token,
              scope: 'https://www.googleapis.com/auth/drive',
            });
            let xdrive = google.drive({version: 'v3', auth:xoAuth2Client});
            let fileMetadata = {
                'name': name
              };
              var media = {
                mimeType: 'video/mp4',
                body: fs.createReadStream('Cache/'+name)
              };
              xdrive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id'
              }, function (err, file) {
                if (err) {
                  console.log("bi loi file:" + err)
                } else {
                  console.log('Thành công'+ name);
                }
              });
        })
    });
}


function AsyncDow(str,name){
    let ls = exec(str);
    ls.stdout.on("data", data => {
        console.log("end="+String(data).replace('{"id":"','').replace('"}',''))
        let idvideox = String(String(data).replace('{"id":"','').replace('"}',''));
        setTimeout(function(){ 
            loadurl('https://graph.facebook.com/'+ idvideox + '?access_token=' + tokenfb + '&fields=source',idvideox,name)
        }, 60000*20);
    });
    ls.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });
    ls.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });
    ls.on("close", code => {
        console.log(`child process exited with code ${code}`);
    });
}


function upFacebook(str,time,name){
    setTimeout(function(){                
        AsyncDow(str,name);
    }, 50000*time);
}

let pageToken = '';
function loadDrive(){

    drive.files.list({
          pageSize: 100,
          fields: 'nextPageToken, files(*)',
          pageToken: pageToken
          }, async (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const files = res.data.files;

            if(String(res.data.nextPageToken) === "undefined") pageToken = 'het';
            else {
              pageToken = res.data.nextPageToken;
              loadDrive();
            }

            if (files.length) {
              console.log('Files:' + files.length);
              for(let i = 0; i < files.length; i++){
                if(String(files[i].name).includes(".mp4") && String(files[i].name).includes(namevideo)){
                    let nametempx = String(files[i].name).replace(String(namevideo),'').replace('.mp4','');
                    if(Number(nametempx) >= xmin && Number(nametempx) <= xmax){
                        upFacebook(' curl  \ '+
                                    ' -X POST  \ '+
                                    ' "https://graph-video.facebook.com/v10.0/'+pagefb+'/videos"  \ '+
                                    ' -F  "access_token='+tokenfb+'"  \ '+
                                    ' -F  "description='+String(files[i].name)+'" '+
                                    ' -F  "file_url=https://www.googleapis.com/drive/v3/files/'+files[i].id+'?alt=media&key='+key_api+' " '
                        ,timepk,String(files[i].name))
                        timepk = timepk + 1;
                    }
                }
              }
            } else {
              console.log('No files found.');
            }
          });
        }
        loadDrive();
});