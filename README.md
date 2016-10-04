# Dj Media Streaming

media 파일을 스트리밍해주는 모듈 입니다. 서버에 있는 video 파일이나 audio 파일을 실행 가능한 형태로 response 합니다.
또 audio 파일의 태그정보등을 가져올 수 있습니다.

## Installation

```
npm install djms --save
```

### pipe

서버에 있는 미디어 파일을 스트리밍 합니다.

```js
var djms = require('djms');
djms.pipe(req, res, filePath);
```

### getTag

audio 파일의 태그 정보를 반환합니다.

```js
var djms = require('djms');
djms.getTag(filePath, function(err, tag){
    console.log(tag);
});
```