# 手动安装

## 一键启动（推荐）

双击 `start.bat`

然后访问 http://localhost:3000

## 手动启动

如果一键启动有问题：

```bash
cd backend
npm install
npm start
```

然后访问 http://localhost:3000

## 故障排除

**端口被占用**

编辑 `backend/.env`：
```
PORT=3001
```

**缺少 Node.js**

访问 https://nodejs.org/ 下载安装
