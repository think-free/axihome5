const withCSS = require('@zeit/next-css')
module.exports =  withCSS({
  assetPrefix: '/admin/',
  exportPathMap: function () {
    return {
      "/": { page: "/" }
    }
  }
})
