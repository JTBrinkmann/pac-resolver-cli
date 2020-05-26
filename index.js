#!/usr/bin/env node
const pac = require('pac-resolver')

const pacUrl = process.argv[2]
const url = process.argv[3]

const get = (url) => {
  return new Promise((resolve, reject) => {
    let client
    if (url.startsWith('http://')) {
      client = require('http')
    } else if (url.startsWith('https://')) {
      client = require('https')
    }
    
    if (!client) {
      reject(new Error('unsupported protocol! only http and https are supported'))

    } else {
      client.get(url, (res) => {
        if (res.statusCode !== 200) {
          res.resume() // Consume response data to free up memory
          reject(new Error(`Request Failed.\nStatus Code: ${res.statusCode}`))
        } else {      
          let data = ''
          res.setEncoding('utf8')
          res.on('data', (chunk) => { data += chunk })
          res.on('end', () => {
            resolve(data)
          })
        }
      }).on('error', reject)
    }
  })
}

get(pacUrl)
  .then((pacStr) => {
    var findProxyForURL = pac(pacStr)
    return findProxyForURL(url)
  })
  .then(console.log)
  .catch(console.error)