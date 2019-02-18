const withCSS = require('@zeit/next-css')
module.exports =  withCSS({
  assetPrefix: '/plugins/',
  exportPathMap: function () {
    return {
      "/": { page: "/" }
    }
  }
})
