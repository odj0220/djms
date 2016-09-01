var fs = require('fs'),
    btoa = require('btoa'),
    jsmediatags = require("jsmediatags"),
    app = this;

exports.pipe = function(req, res, path){
    fs.exists(path, function(exists){
        if(!exists){
            res.sendStatus(404);
        }else{
            fs.stat(path, function(err, stats) {
                if (err) {
                    if (err.code === 'ENOENT') {
                        // 404 Error if file not found
                        return res.sendStatus(404);
                    }
                    res.end(err);
                }

                var stat = fs.statSync(path);
                var total = stat.size;
                var agent = req.headers['user-agent'];
                if ((req.headers['range']) || (agent.search('Trident') != -1) || (agent.toLowerCase().indexOf('msie') != -1)) {
                    var range = req.headers.range || 'bytes=0-';
                    var parts = range.replace(/bytes=/, "").split("-");
                    var partialstart = parts[0];
                    var partialend = parts[1];

                    var start = parseInt(partialstart, 10);
                    var end = partialend ? parseInt(partialend, 10) : total-1;
                    var chunksize = (end-start)+1;

                    var file = fs.createReadStream(path, {start: start, end: end});
                    if(app.getType(path) === 'video'){
                        res.writeHead(206, {
                            "Content-Range": "bytes " + start + "-" + end + "/" + total,
                            "Accept-Ranges": "bytes",
                            "Content-Length": chunksize,
                            "Content-Type": "video/mp4"
                        });
                    }else if(app.getType(path) === 'audio'){
                        res.writeHead(206, {
                            "Content-Range": "bytes " + start + "-" + end + "/" + total,
                            "Accept-Ranges": "bytes",
                            'Content-Type': 'audio/mpeg',
                            'Content-Length': chunksize
                        });
                    }else {
                        res.writeHead(500, {
                            "Content-Type": "text/html",
                            "Message" : "it's not media file"
                        });
                    }
                    file.pipe(res);
                } else {
                    res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
                    fs.createReadStream(path).pipe(res);
                }
            });
        }
    });
};

exports.getType = function(path){
    var ext = path.split('.')[path.split('.').length-1];
    var mime = {
        // plain formats
        "html": "text","css": "text","js": "text","txt": "text","aip": "text","asm": "text",
        // custom
        "pdf": "custom","woff": "custom","ttf": "custom","svg": "custom","otf": "custom","eot": "custom","ai": "custom","zip": "custom","rar": "custom","7z": "custom","gz": "custom","tar": "custom",
        // media formats
        "aif": "audio","aifc": "audio","aiff": "audio","au": "audio","gsd": "audio","funk": "audio","gsm": "audio","it": "audio","jam": "audio","m3u": "audio","mid": "audio","mp3": "audio","mod": "audio","pfunk": "audio","qcp": "audio","ra": "audio","ram": "audio","rm": "audio","rmi": "audio","rmm": "audio","rmp": "audio","rpm": "audio","s3m": "audio","sid": "audio","snd": "audio","tsi": "audio","tsp": "audio","voc": "audio","vox": "audio","vqe": "audio","vqf": "audio","vql": "audio","wav": "audio","xm": "audio","ogg": "audio","mpa": "audio","mpga": "audio","my": "audio","midi": "audio","mjf": "audio","kar": "audio","la": "audio","lam": "audio","m2a": "audio","lma": "audio",
        "afl": "video","asf": "video","asx": "video","avi": "video","mjpg": "video","moov": "video","mov": "video","movie": "video","mp2": "video","avs": "video","dif": "video","dl": "video","m2v": "video","qt": "video","qtc": "video","rv": "video","scm": "video","vdo": "video","viv": "video","vivo": "video","vos": "video","xdr": "video","xsr": "video","mpe": "video","mpeg": "video","mp4": "video","mpg": "video","mv": "video","dv": "video","fli": "video","gl": "video","fmf": "video","isu": "video","m1v": "video",
        "art": "image","bm": "image","bmp": "image","dwg": "image","dxf": "image","wbmp": "image","xbm": "image","xif": "image","xpm": "image","x-png": "image","flo": "image","fpx": "image","g3": "image","gif": "image","jfif": "image","jfif-tbnl": "image","jpe": "image","jpeg": "image","jpg": "image","jps": "image","jut": "image","mcf": "image","nap": "image","naplps": "image","nif": "image","niff": "image","pbm": "image","pct": "image","pcx": "image","pgm": "image","pic": "image","pict": "image","pm": "image","png": "image","pnm": "image","ppm": "image","ras": "image","rast": "image","rf": "image","rgb": "image","svf": "image","tif": "image","tiff": "image","qif": "image","qti": "image","qtif": "image","rp": "image"
    };

    return mime[ext] || "custom";
};

exports.getTag = function(path, callback){
    try{
        jsmediatags.read(path, {
            onSuccess: function(tags){
                var tags = tags.tags;
                if( "picture" in tags ) {
                    var image = tags.picture;
                    var base64String = "";
                    for (var i = 0; i < image.data.length; i++) {
                        base64String += String.fromCharCode(image.data[i]);
                    }
                    tags.picture = "data:" + image.format + ";base64," + btoa(base64String);
                }
                callback(null, tags);
            },
            onError: function(error){
                callback(error, null)
            }
        })
    }catch (e){
        callback(e, null);
    }
};