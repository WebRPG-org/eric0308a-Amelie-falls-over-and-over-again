# Game_karryns_prison

## 程式碼測試

```bash
npm install -g http-server
http-server
```

## 部署

### 測試

```bash
docker build -t over-and-over-again:v1.0 .
docker run -d -p 8080:80 --name over-and-over-again over-and-over-again:v1.0
```

### 推送

```bash
docker login
docker tag over-and-over-again:v1.0 eric0308a/over-and-over-again:v1.0
docker push eric0308a/over-and-over-again:v1.0
```

### 拉取

```bash
docker run -d -p 5548:80 eric0308a/over-and-over-again:v1.0

```