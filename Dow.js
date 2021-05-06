let fetch = require("node-fetch");
let fs = require('fs');
const http      = require('http'),
      https     = require('https');

var id_page = '103083858598351';
var token = 'EAApj1qd5BwYBAPtLSiHdJEZAURjZB3vXbB5MKo0R6YFDYSZASuJpK9XgnCMnMjf4K0EQkVAnSX5UTsTOUTZCpD2eZBaXZC5q8HwjiNKWNHGRu1fJks3tJI3KADVPOk5cDO860ZCXaFJFGk2k6ZCSgQ8fAryGGWSj7pOwZCgiBI4UxhASMF3FOiotd8i6ig11jQTAZD';


let start = 0;
let end = 50;
let namevideo = 'blackclover_tap_';

let i = 1;
let k = 1;

function getLink(id_page,token) {
    let url = 'https://graph.facebook.com/'+ id_page + '/videos?limit=1000&access_token=' + token;
    let client = http;
    if (url.toString().indexOf("https") === 0) {
        client = https;
    }
    let request = client.request(url, function (res) {
        let data = '';
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                let data_array = JSON.parse(data);  
                let json_ray = data_array.data;
                json_ray.forEach(element => {
                    // console.log(Number(element.description))

                    if(Number(String(element.description).replace(namevideo,'').replace('.mp4','')) >= start && Number(String(element.description).replace(namevideo,'').replace('.mp4','')) <= end)
                    if (!fs.existsSync(String('Save/'+element.description))) {
                    if(k == 1){
                        loadurl('https://graph.facebook.com/'+ element.id + '?access_token=' + token + '&fields=source',element.id,element.description)
                        k = k + 1;
                    }else{
                        setTimeout(function(){
                            loadurl('https://graph.facebook.com/'+ element.id + '?access_token=' + token + '&fields=source',element.id,element.description)
                        },60000*k)
                        k = k + 1;
                    }
                    }

                });
            });
        });
        request.on('error', function (e) {
            console.log(e.message);
        });
        request.end();
}
getLink(id_page,token);

async function loadurl(url,id,name){
    let fetchs = await fetch(url, {"method": "GET",});
    fetchs = await fetchs.json();
    data_array = JSON.parse(JSON.stringify(fetchs,null,2));
    console.log(i+'-----------lan')
    console.log(name)
    console.log(id)
    console.log(data_array.source)
    const file = fs.createWriteStream('Save/'+name);
    let pkx = 0;
    const request = https.get(data_array.source, function(response) {
        response.pipe(file);
        response.on('data',(da)=>{
            pkx = pkx + 1;
            
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write('load number data '+name+' : ' + pkx)
        })  
        response.on('end',()=>{
            process.stdout.write("\n");
            console.log('Done!')
        })
    });
    i = i + 1;
}