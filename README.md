English | [日本語](README_jp.md)

# HTTP (a library for Suru)

The HTTP library for [Suru (「する」)](https://github.com/suru-lang/suru), a programming language in Japanese. Writing a function that takes a request and returns a response is all it takes to make an HTTP server, and it can also serve a whole folder of static files. It is written entirely in Suru (on top of the core's 「通信」, 「スレッド」 and 「ファイル」), and behaves the same in the interpreter and in compiled binaries.

## Installing

In a [kumu](https://github.com/suru-lang/suru#building-projects-kumu) project:

```sh
kumu 追加 github.com/suru-lang/http
```

Suru 0.9.1 or later is required (the library and the examples write procedures with 「以下の手順です … 以上です」, and the library writes its C functions with 「以下は外部の入出力動作です … 以上です」).

On Windows, use the MSYS2 UCRT64 shell with clang, lld and pkgconf (`pacman -S mingw-w64-ucrt-x86_64-clang mingw-w64-ucrt-x86_64-lld mingw-w64-ucrt-x86_64-pkgconf`) and Suru 0.8.0 or later (the first release with Windows support).

Type declarations of functions in `例/` end with 「を 返す」, as in `… は 文字列 を 返す`. Running the examples needs a version of Suru that can read this (one including suru-lang/suru#108).

## Usage

```
「HTTP」 を 読み込む

要求 を 案内する とは
  もし 要求 の 道 が
    「/」 ならば 「こんにちは」 を HTTP内の本文応答する
    そうでなければ 404 で 「見つかりません: 」 + 要求 の 道 を HTTP内の状態応答する

8080 を 案内すること で HTTP内の待受する
```

(要求 = request, 道 = path, 案内する = "guide", the handler; 本文応答する makes a 200 text response, 状態応答する one with a given status.)

To serve the files under a folder:

```
「HTTP」 を 読み込む

8080 を （「public」 を HTTP内の配信すること） で HTTP内の動作待受する
```

To combine it with your own function: 配信する returns a response action, so answer the other paths yourself.

```
「標準」 を 読み込んで 使う
「HTTP」 を 読み込む

要求 を 案内する とは
  もし 要求 の 道 が 「/api/」 で 先頭一致である ならば （「API です」 を HTTP内の本文応答して 結果にする） そうでなければ 「public」 を 要求 で HTTP内の配信する

8080 を 案内すること で HTTP内の動作待受する
```

To make it reachable only from your own machine, pass 「ADDRESS:PORT」 instead of a port (a numeric port listens on 0.0.0.0, so other machines on the same network can open it too).

```
「127.0.0.1:8080」 を 案内すること で HTTP内の待受する
```

Examples are [例/挨拶.suru](例/挨拶.suru) (a server answering with a function) and [例/サイト.suru](例/サイト.suru) (a site serving 例/公開). In this repository, start it with `suru 例/サイト.suru` and open http://localhost:8080/ in a browser.

## Client

`「HTTP/クライアント」 を 読み込む` lets you send HTTP requests yourself. `http://` and `https://` URLs are supported.

HTTPS uses OpenSSL (libssl and libcrypto, 1.1.1 or later). Programs using the client link with libssl, so install OpenSSL's development files.

- macOS: `brew install openssl@3`, then `export PKG_CONFIG_PATH="$(brew --prefix openssl@3)/lib/pkgconfig"` (the libssl inside macOS can't be used)
- Debian, Ubuntu: `sudo apt install libssl-dev`
- Fedora: `sudo dnf install openssl-devel`
- Windows (MSYS2 UCRT64): `pacman -S mingw-w64-ucrt-x86_64-openssl`

Programs that only use the server don't need it.

```
「HTTP/クライアント」 を 読み込む

始めする とは 以下の入出力手順です
  r とは 「http://localhost:8080/」 を クライアント内の取得した 結果
  r の 状態 を 表示する
  r の 本文 を 表示する
  以上です
始めする
```

For APIs whose answer arrives line by line (such as local LLM streaming), a function can be called for each line as it arrives. The function receives "the value so far" and "one line", and is an action returning the next value.

```
「標準」 を 読み込んで 使う
「HTTP/クライアント」 を 読み込む

数 を 文字列 で 行表示する は 数 を 返す 入出力動作
累 を 行 で 行表示する とは 以下の入出力手順です
  行 を 表示する
  累 + 1 を 結果にする
  以上です

始めする とは 以下の入出力手順です
  本文 とは 「{"model":"llama3.2","messages":[{"role":"user","content":"こんにちは"}]}」
  n とは 「http://localhost:11434/api/chat」 に 本文 を 0 から 行表示すること で クライアント内の逐次投稿した 結果
  （n を 文字列化する） + 「 行」 を 表示する
  以上です
始めする
```

The example [例/チャット.suru](例/チャット.suru) is a chat with a local LLM. Run [Ollama](https://ollama.com/) and start it with `suru 例/チャット.suru llama3.2`. For OpenAI-compatible APIs such as llama.cpp's `llama-server`, pass a URL ending in /v1, as in `suru 例/チャット.suru MODEL http://localhost:8080/v1`.

Images and other binary bodies are received as bytes. `開始送付する` sends the request and reads up to the headers, and `塊受信する` passes the body, a chunk of bytes at a time, to a function.

```
「標準」 を 読み込んで 使う
「ファイル」 を 読み込む
「HTTP/クライアント」 を 読み込む

数 の リスト を バイト列 で 塊集めする は 数 の リスト を 返す 入出力動作
累 を 塊 で 塊集めする とは 累 + （塊 を 数列にする） を 結果にする

始めする とは 以下の入出力手順です
  受 とは 「GET」 で 「https://example.com/印.png」 を クライアント内の要求にして クライアント内の開始送付した 結果
  受 の 頭 の 状態行 を 表示する
  xs とは 受 を 空 から 塊集めすること で クライアント内の塊受信した 結果
  （xs を バイト列組立する） を 「印.png」 へ ファイル内のバイト列書出する
  以上です
始めする
```

## Chat in the browser

[例/ブラウザチャット.suru](例/ブラウザチャット.suru) is a web app for talking with a local LLM from a browser. Both the server and the client are written in Suru, and the page ([例/チャット画面](例/チャット画面)) is HTML and JavaScript. The LLM's answer appears on the page bit by bit as it arrives.

```sh
suru 例/ブラウザチャット.suru llama3.2                              # Ollama
suru 例/ブラウザチャット.suru モデル名 http://localhost:8081/v1 8080  # OpenAI-compatible (llama-server etc.); the third is the port
```

Once started, open http://localhost:8080/. It can also be built into a binary with `suruc 例/ブラウザチャット.suru -o 出力/チャット` (the page files are read from `例/チャット画面` under the current folder).

To send the answer bit by bit, pass `直接並行待受する` a function that receives the request and the connection.

```
「HTTP」 を 読み込む

HTTP内の要求 を 数 で 案内する は 数 を 返す 入出力動作
要求 を 接続 で 案内する とは 以下の入出力手順です
  接続 へ 「text/plain; charset=utf-8」 で HTTP内の逐次開始する
  「1つ目」 を 接続 へ HTTP内の逐次送信する
  「2つ目」 を 接続 へ HTTP内の逐次送信する
  接続 へ HTTP内の逐次終了する
  以上です

8080 を 案内すること で HTTP内の直接並行待受する
```

## WebSocket

`「HTTP/WebSocket」 を 読み込む` lets you write WebSocket servers and clients (`ws://` only; `wss://` not yet). The server shares the port with HTTP and can answer ordinary requests too.

```
「HTTP」 を 読み込む
「HTTP/WebSocket」 を 読み込む

# 文字の伝言には「返事: 」を付けて返す
WebSocket内の伝言 を WebSocket内の相手 で 返答する は 数 を 返す 入出力動作
（文 という WebSocket内の文字伝言） を ws で 返答する とは 「返事: 」 + 文 を ws へ WebSocket内の文字送信する
m を ws で 返答する とは 0 を 結果にする

問い を 接続 で 案内する とは
  もし 問い が WebSocket内の開始要求である ならば 問い を 接続 に 返答すること で WebSocket内の対話する
  そうでなければ （「WebSocket で話してください」 を HTTP内の本文応答する） を 接続 へ 問い の 方法 で HTTP内の応答送信する

8080 を 案内すること で WebSocket内の待受する
```

(The comment says: text messages are answered with 「返事: 」, "reply: ", in front.) From a browser, connect with `new WebSocket("ws://localhost:8080/")`. A client:

```
「HTTP/WebSocket」 を 読み込む

始めする とは 以下の入出力手順です
  ws とは 「ws://localhost:8080/」 を WebSocket内の接続した 結果
  「こんにちは」 を ws へ WebSocket内の文字送信する
  m とは ws から WebSocket内の受信した 結果
  m を 表示する
  ws を WebSocket内の終了する
  以上です
始めする
```

The page of [例/ブラウザチャット.suru](例/ブラウザチャット.suru) connects to the server over WebSocket to talk with the LLM.

Suru must be a version with `ビット積にする`, `Base64符号化する`, 「ハッシュ」, `乱数バイト列取得する` and `通信内の待機時間設定する`.

## Decisions

### Server

1. **Requests and responses are records.** A `要求` (request) has 方法 (method, such as 「GET」), 道 (path, as is, like 「/a?b=1」), 見出し (headers) and 本文 (body); an `応答` (response) has 状態 (status), 見出し and 本文. Headers are a list of 「NAME と VALUE」 lists, and request header names are lowercased (`要求 から 「X-Name」 を HTTP内の見出し値にする` searches case-insensitively and gives 「」 if absent).
2. **Functions that make responses.** `本文 を 本文応答する` (200, text/plain), `本文 を HTML応答する` (200, text/html), `404 で 本文 を 状態応答する`, `バイト列 を 「image/png」 で 種類付応答する`, `「/a/」 を 転送応答する` (301 and Location), and `応答 に 「X-A」 と 「1」 を 見出し追加する`. Content-Length and `Connection: close` are added when sending.
3. **Response bodies are byte sequences.** This is so images and the like can be returned. The functions above put strings in as UTF-8 bytes. A response built by hand, like `状態 は 200 で 見出し は 空 で 本文 は 「あ」 の 応答`, can be sent with a string body as is (the trait 「本文可能」 sends both strings and byte sequences). `応答 を 応答文にする` is the string of headers and body joined.
4. **There are four listening functions.** `待受する` for answering with a pure function, and `動作待受する` for a function returning a response action (printing, reading files, 配信する). `並行待受する` and `動作並行待受する` pass accepted connections through a channel to 16 threads that answer in parallel (a slow client doesn't hold up others).
5. **Answer one request and close. Failures don't stop the server.** Each request is wrapped in `試行する`, so if the function hits a runtime error it returns 500, and broken requests or clients that drop midway close only that connection (the error message goes to standard error). Clients that connect and send nothing are given up on after 5 seconds.
6. **HEAD gets only headers.** For every listener, a HEAD request gets only the headers, with Content-Length set to the body's length.

### Static file serving

1. **`フォルダ を 要求 で 配信する` is the response action for the file matching the path.** Partially apply it, as in `「public」 を HTTP内の配信すること`, and pass it to `動作待受する`. The folder is a path relative to the current folder, or absolute.
2. **With a prefix, use `前置付配信する`.** `「/static」 から 「public」 を 要求 で HTTP内の前置付配信する` serves only paths `/static/…` as under public; paths not starting with the prefix (including `/staticx`) are 404. Just `/static` is redirected with 301 to `/static/`.
3. **Only GET and HEAD are answered.** Other methods get 405 with `Allow: GET, HEAD`.
4. **What follows ? and # is ignored. %XX is decoded before checking.** `%E7%B5%B5` in a path becomes 「絵」. Paths that aren't valid UTF-8, a `%` not followed by two hex digits, and `%00` are 400. `+` is not turned into a space (it stays `+` in paths).
5. **Nothing outside the folder is served.** After decoding %XX, if any part split by 「/」 is `..`, `.` or contains `\`, it is 403 (`%2e%2e` is also refused as `..`). Also, if the file's real location (with symbolic links resolved) isn't under the folder's real location, it is 403. Symbolic links inside the folder pointing outside it are not served.
6. **Names starting with 「.」 are 404.** So that `.git` and `.env` aren't served by mistake.
7. **Missing files are 404, unreadable files 403.** Failures while reading are caught by the server's `試行する` and become 500.
8. **Folders give index.html; no listings.** If the path points to a folder and ends in `/`, its index.html is returned (404 if absent). If it doesn't end in `/`, it is redirected with 301 to the path with `/` added (query unchanged).
9. **Content-Type comes from the extension.** It is decided by `MIME表`, case-insensitively. Text types (html, htm, css, js, mjs, json, txt, md, csv, xml, svg) get `; charset=utf-8`. Anything not in the table, or without an extension, is `application/octet-stream`. `道 を 種類判定する` looks it up.
10. **Files are read whole before sending.** Sending large files in pieces and cache headers are not available yet (future work).

### Sending bit by bit

1. **Listeners where you send the response yourself.** The function passed to `直接待受する` and `直接並行待受する` receives the `要求` and the `接続` (connection) and returns an action that sends the response itself (`（要求 を 数 で 受け取って 甲 の 動作 を 返すこと）`). When the function ends, the connection is closed. On failure, like the other listeners, it tries to send 500 and closes (if sending had already started, the browser sees it as cut off midway).
2. **Ordinary responses can be sent too.** Whether to send bit by bit is decided per path, so ordinary responses are sent with `応答 を 接続 へ 要求 の 方法 で 応答送信する` (responses made by 配信する too).
3. **It is sent chunked.** `接続 へ 種類 で 逐次開始する` sends 200 with Content-Type, `Cache-Control: no-cache`, `Transfer-Encoding: chunked` and `Connection: close`; `文字列 を 接続 へ 逐次送信する` sends each piece as one chunk; and `接続 へ 逐次終了する` sends the end marker (a chunk of length 0). Empty strings are not sent (so they aren't mistaken for the end marker).
4. **A dropped client is a send failure.** If the browser stops midway, the next 逐次送信する becomes a runtime error and only that connection ends (the error message goes to standard error).
5. **The rules of the browser chat.** The page remembers the whole conversation and sends `{"messages":[…]}` to `POST /api/chat` each time. The server passes messages straight to the LLM and streams the answer as one JSON per line (`{"content":"…"}`, or `{"error":"…"}` on failure). The server doesn't remember conversations, so however many people open it, nothing gets mixed. Paths are ASCII only (because `要求 の 道` keeps %XX).

### Client

1. **It is split into `クライアント.suru`.** A separate file in the same repository as the server, used with `「HTTP/クライアント」 を 読み込む` and `クライアント内の…`. Its types have the same names as the server's: `要求` (方法, 宛先 (target), 見出し, 本文) and `応答` (状態, 見出し, 本文). Type names are per file, so they don't clash with the server's `要求` and `応答` (in a file loading both, write them apart as `クライアント内の要求` and so on).
2. **Functions.** `URL を 取得する` (GET), `URL に 本文 を 投稿する` (POST, Content-Type application/json), and `送付する` for a request made with `方法 で URL を 要求にする` plus `要求 に 名前 と 値 を 見出し追加する` and `要求 に 本文 を 本文設定する`. All are response actions. `応答 から 名前 を 見出し値にする` (case-insensitive), and `応答 が 成功状態である` (200 to 299).
3. **Each call connects and closes.** It sends `Connection: close` and closes after reading the response. Bodies are read in all three ways: Content-Length, chunked, and until close. 204, 304 and HEAD have empty bodies.
4. **Receiving line by line.** `要求 を 初期 から 処理 で 逐次送付する` and `URL に 本文 を 初期 から 処理 で 逐次投稿する` pass each complete line, in order, to `処理` (`（甲 を 文字列 で 受け取って 甲 の 動作 を 返すこと）`) as the body arrives, and give the last value as the result. The trailing newline and carriage return of each line are removed. When a chunk is cut in the middle of a line, it is joined with the next chunk before being passed. Both NDJSON (Ollama) and SSE (`data: …` lines and blank lines; OpenAI-compatible) can be read this way.
5. **Failures are runtime errors.** Failing to connect, the server dropping midway, a URL that isn't http:// and so on are runtime errors, catchable with `試行する`. `取得する` and the like return 404 and such as responses, but the line-by-line functions turn a status outside 200 to 299 into a runtime error with the body attached.
6. **Outgoing connections have no wait limit.** This is for servers like local LLMs that take a while to give the first response (the core's `通信内の接続する`).
7. **Receiving the body as bytes.** `要求 を 開始送付する` sends the request, reads up to the end of the headers and gives a `受信口` (路, 頭, 方法). `頭` is an `応答頭`: `状態行` (such as `HTTP/1.1 200 OK`, as received), `状態`, `見出し` (names in lower case) and `元見出し` (names spelled as received). `受信口 を 初期 から 処理 で 塊受信する` passes each non-empty chunk of bytes (64KB at most) to `処理` (`（甲 を バイト列 で 受け取って 甲 の 動作 を 返すこと）`), closes, and gives the last value. `受信口 を 受信中止する` closes without reading the body. The body is read in the same three ways; when the server closes before Content-Length bytes arrive, it is a runtime error.
8. **The request body is bytes.** `要求` keeps its body as `バイト列`. `本文設定する` turns a string into UTF-8, and `要求 に バイト列 を バイト列本文設定する` puts bytes in as they are.
9. **The default headers can be replaced.** The client sends `Host`, `User-Agent: suru-http`, `Accept: */*`, `Connection: close`, `Authorization` (from the URL) and `Content-Length`. A header given with `見出し追加する` under the same name (ignoring case) replaces the default one, and a header whose value is 「」 is not sent (this removes a default). `Content-Length` is sent when the body is not empty, or for POST, PUT and PATCH.
10. **Reading URLs.** Everything from `#` on is not sent. `user:password@` before the host becomes Basic authentication (`%XX` decoded). IPv6 addresses are written in brackets, as in `http://[::1]:8080/`. `http://host?a=1` is the path `/?a=1`.

### WebSocket

1. **It is split into `WebSocket.suru`.** Use it with `「HTTP/WebSocket」 を 読み込む` and `WebSocket内の…`. The server and client are in the same file and share the sending and receiving functions.
2. **The listener makes a thread per connection.** The function passed to `WebSocket内の待受する`, like `直接待受する`, receives the request and connection and is an action that sends the response itself. WebSockets stay connected, so there is no limit of 16 like `並行待受する`; a thread is made for each accepted connection. When the function ends, the connection is closed.
3. **The handshake.** `要求 が WebSocket内の開始要求である` holds for a GET request with websocket in `Upgrade` and upgrade in `Connection` (each one of the 「,」-separated items, case-insensitive), and a `Sec-WebSocket-Key`. `要求 を 接続 で WebSocket内の握手する` sends 101 and `Sec-WebSocket-Accept` (the Base64 of the SHA-1 of the key joined with the fixed string), sets the connection's wait time to 0 (wait forever), and gives the `相手` (peer) as its result. If it isn't an opening request, it sends 400 and is a runtime error. Subprotocols and extensions (compression) are not used.
4. **Messages have a type with alternatives.** `文 の 文字伝言` (text, a string), `データ の バイナリ伝言` (binary, bytes) and `符号 の 終了伝言` (close, when the peer closes; 1005 if there is no code). `ws から WebSocket内の受信する` answers pings with a pong of the same contents and discards them, discards pongs, and joins fragmented messages (continuation frames) before returning them.
5. **`対話する` calls a function for each message until closed.** `要求 を 接続 に 処理 で WebSocket内の対話する` does the handshake, calls `処理` (`（伝言 を 相手 で 受け取って 甲 の 動作 を 返すこと）`) for each text and binary message, and gives the close code as its result when the peer closes.
6. **Sending functions.** `文 を ws へ WebSocket内の文字送信する`, `データ を ws へ WebSocket内のバイナリ送信する`, and `ws を WebSocket内の死活確認する` (ping). Each message is sent as one frame (not fragmented). Sending happens inside a per-peer lock, so sends from several threads to the same peer don't get mixed.
7. **Closing.** When a close notice arrives from the peer, it answers with the same code and returns a `終了伝言`. `ws を WebSocket内の終了する` sends 1000 and waits up to 5 seconds for the answer (messages arriving meanwhile are discarded). A client disconnects after closing; for server connections, the listening side disconnects.
8. **Masking.** Clients mask each frame's contents with a 4-byte key made from OS randomness; servers don't mask. The server also accepts unmasked frames as they are (the RFC allows dropping them).
9. **Size limits.** A message (the whole of a fragmented one) over 16MB is a runtime error and the connection is dropped. Unknown frame types, continuation frames without a start, and another message in the middle of a fragmented one are runtime errors too. So is a text message that isn't valid UTF-8.
10. **Client URLs are `ws://HOST:PORT/PATH`.** Without a port, 80. A handshake response that isn't 101, or a `Sec-WebSocket-Accept` that doesn't match, is a runtime error.
11. **The browser chat connects over WebSocket.** The page keeps one connection to `/ws`, and each time it sends `{"messages":[…]}`, it receives the answer's `{"content":"…"}` (or `{"error":"…"}` on failure) one message at a time, and finally `{"done":true}`. The stop button closes the connection (it reconnects on the next send). If it can't connect over WebSocket, it asks with the old `POST /api/chat`. The server changed from `直接並行待受する` to `WebSocket内の待受する`.

### HTTPS

1. **Connections use OpenSSL's BIO.** `TLS.suru` (`「HTTP/TLS」`) resolves the name and connects over TCP with `BIO_new_ssl_connect`, then does the TLS handshake. Sockets of Suru's 「通信」 are numbers in a table, not OS fds, so connecting is left to OpenSSL from the start. Reading stacks `BIO_f_buffer` on top to read line by line.
2. **Certificates and names are always verified.** The certificate is verified with the OS's default CAs (`SSL_CTX_set_default_verify_paths`; the environment variable `SSL_CERT_FILE` changes it), and `SSL_set1_host` checks that it matches the host name. SNI is sent too. If verification fails, it is the failure 「TLS で『主機』の証明書を確かめられませんでした(理由)」 ("couldn't verify the certificate of 『HOST』 over TLS (reason)"). No argument to turn verification off is provided.
3. **The default port for `https://` is 443.** The client functions take both `http://` and `https://` with the same functions and choose the `経路` (route: a plain or encrypted connection) inside. How you write code doesn't change.
4. **On failure, the connection is closed.** Even if sending or receiving fails midway, the connection (and the TLS context) is closed before the failure is returned.
5. **OpenSSL is needed only when using the client.** `TLS.suru` is loaded by `クライアント.suru`, so server-only programs don't link with libssl.

### Where to listen

1. **The 「を」 of listening functions is a numeric port or an 「ADDRESS:PORT」 string.** Every one of `待受する`, `動作待受する`, `並行待受する`, `動作並行待受する`, `直接待受する`, `直接並行待受する` and `WebSocket内の待受する` accepts `「127.0.0.1:8080」` instead of `8080`. A number listens on 0.0.0.0 (all) as before. To choose without adding more function names, this is the trait 「待受先」 (implemented by numbers and strings).
2. **Strings are split at the last 「:」.** The front is the address, the back the port. Names like `「localhost:8080」` and bracketed IPv6 like `「[::1]:8080」` can be written (the brackets are removed before passing to the core's `ポート を アドレス に 通信内の待受開始する`). Leaving out the address, as in `「:8080」`, gives 0.0.0.0. Without 「:」 it is the failure 「待ち受ける先は 127.0.0.1:8080 のように アドレス:ポート で書いてください(…)」 ("write where to listen as ADDRESS:PORT, like 127.0.0.1:8080").
3. **`先 を 待受口開始する` only opens the listener.** It is the trait function used by the listening functions, an action giving the listener number. Being a trait function, it is written without 「HTTP内の」. It needs Suru 0.2.0 or later (`待受開始する` accepting an address).

## API documentation

The API documentation is made from the comments in `HTTP.suru`, `TLS.suru`, `WebSocket.suru`, `クライアント.suru`: the head comment of the file and the comment right above each public definition, written in English. It is published at https://suru-lang-http.readthedocs.io/en/latest/.

```sh
kumu 文書                                                            # writes docs/api/HTTP.md docs/api/TLS.md docs/api/WebSocket.md docs/api/クライアント.md
pip install -r docs/requirements.txt && sphinx-build docs docs/_build   # HTML in docs/_build
```

`docs/` and `.readthedocs.yaml` were written by `kumu 文書 --雛形` (Suru 0.11.0 or later). On every build, Read the Docs downloads kumu 0.11.0, runs `kumu 文書 --出力 docs/api` and then Sphinx, so the generated pages are not committed. The editor hover shows the same descriptions.

## Tests

```sh
kumu 試験
kumu 点検
```

Tests are in `試験/`, and the site to serve is in `試験/サイト/`. CI builds the example site into a binary, starts it, and checks it with curl. For HTTPS, CI creates a CA and certificate, starts a Python TLS server (`.github/試験/TLS相手.py`), and `.github/試験/https確認.suru` checks GET, a bit-by-bit POST, receiving and sending binary bodies, refusing a certificate for a different name, and refusing when the CA is missing. CI runs `kumu 試験` and `kumu 点検` on Linux, macOS and Windows (MSYS2).

## Future work

- Caching: add `Last-Modified` and `ETag`, and answer `If-Modified-Since` and `If-None-Match` with 304 (the core needs a way to get file modification times)
- Read and send large files bit by bit, answer `Range` with 206
- Let users extend `MIME表` (a version of 配信する that takes a table)
- Compression (`Accept-Encoding: gzip`)
- Answer several requests on one connection (keep-alive)
- A function that parses the query (`?a=1&b=2`)
- HTTPS servers, client certificates (mutual TLS)
- WebSocket: `wss://` (TLS connections now work, so build them into the WebSocket client), subprotocols (`Sec-WebSocket-Protocol`), compression (permessage-deflate), sending large messages fragmented,
  periodic pings from the server to find dropped peers (the wait time is 0 now, so threads of peers that silently vanish remain),
  refusing unmasked frames on the server, and the reason text of close notices

## License

[MIT](LICENSE)
