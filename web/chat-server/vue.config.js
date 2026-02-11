const { defineConfig } = require('@vue/cli-service')
const fs = require('fs')
const path = require('path')

const certPath = '/etc/ssl/certs/server.crt'
const keyPath = '/etc/ssl/private/server.key'
const hasSslCerts = fs.existsSync(certPath) && fs.existsSync(keyPath)

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: hasSslCerts
    ? {
        host: '0.0.0.0',
        // 此处开启 https,并加载本地证书（否则浏览器左上角会提示不安全）
        https: {
          // Win10本地部署
          // cert: fs.readFileSync(path.join(__dirname, 'src/assets/cert/127.0.0.1+2.pem')),
          // key: fs.readFileSync(path.join(__dirname, 'src/assets/cert/127.0.0.1+2-key.pem')),
          // Ubuntu22.04云服务器部署
          cert: fs.readFileSync(path.join(certPath)),
          key: fs.readFileSync(path.join(keyPath))
        },
        // 注意： https的端口必须是443
        port: 443
      }
    : {
        host: '0.0.0.0',
        // 端口设为常见的开发用端口，避免与服务器默认的 HTTPS 端口冲突
        port: 8080
      }
})
