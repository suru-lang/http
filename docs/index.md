# 「HTTP」

An HTTP server for Suru (part of HTTP/1.1; the connection is closed after each answer).
Add it with `kumu 追加 github.com/suru-lang/http`, write `「HTTP」 を 読み込む` in your file and use the names with the `HTTP内の` prefix, like `HTTP内の待受する`.

- `要求 を 案内する とは …`: write a function that takes a request and returns a response.
- `8080 を 案内すること で HTTP内の待受する`: listen on port 8080 and call `案内する` for each request.
- `8080 を 記録すること で HTTP内の動作待受する`: the same, when the function returns an action that gives the response (to print or use files).
- `8080 を 案内すること で HTTP内の並行待受する`: answer in parallel with `同時接続数` (16) threads, so a slow client does not keep the others waiting. `HTTP内の動作並行待受する` is the action version.
- `8080 を 中継すること で HTTP内の直接並行待受する`: the function gets the request and the connection and sends the response itself (to send it bit by bit).
- `「127.0.0.1:8080」 を 案内すること で HTTP内の待受する`: accept only from the same machine (a number means 0.0.0.0). Every listening function takes this.
- `8080 を （「public」 を HTTP内の配信すること） で HTTP内の動作待受する`: serve the files under the folder public.
- `「/static」 から 「public」 を 要求 で HTTP内の前置付配信する`: serve only /static/… from public.

A request is a record of 方法 (such as 「GET」), 道 (「/a?b=1」), 見出し and 本文. A response is a record of 状態, 見出し and 本文.
Headers are a list of name and value pairs. The header names of a request are lower-cased.
The body of a response is a byte sequence (the functions here turn strings into UTF-8 bytes; a response made by hand can have a string body too).
A HEAD request gets only the headers (Content-Length is the length of the body).

```{toctree}
:maxdepth: 2
:caption: API
:glob:

api/*
```
