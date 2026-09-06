const https = require('https');

https.get('https://abdelrahman-el-bahnsy.vercel.app/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Find the main js bundle
    const matches = data.match(/src="(\/assets\/index-.*?\.js)"/);
    if(matches && matches[1]) {
      const bundleUrl = 'https://abdelrahman-el-bahnsy.vercel.app' + matches[1];
      console.log('Bundle URL:', bundleUrl);
      https.get(bundleUrl, (res2) => {
        let bundleData = '';
        res2.on('data', chunk => bundleData += chunk);
        res2.on('end', () => {
          const projectIdMatch = bundleData.match(/projectId:[\"']([^\"']+)[\"']/g);
          console.log('Project IDs found in index bundle:', projectIdMatch);

          const apiKeyMatch = bundleData.match(/apiKey:[\"']([^\"']+)[\"']/g);
          console.log('API Keys found in index bundle:', apiKeyMatch);
          
          // There might be another chunk for firebase
          const fbMatches = data.match(/src="(\/assets\/firebase.*?\.js)"/g);
          console.log('Firebase chunks found in HTML:', fbMatches);
          if (fbMatches) {
            fbMatches.forEach(m => {
                const chunkUrl = 'https://abdelrahman-el-bahnsy.vercel.app' + m.match(/src="([^"]+)"/)[1];
                console.log('Fetching', chunkUrl);
                https.get(chunkUrl, (res3) => {
                    let chunkData = '';
                    res3.on('data', c => chunkData += c);
                    res3.on('end', () => {
                        const pidMatch = chunkData.match(/projectId:[\"']([^\"']+)[\"']/g);
                        console.log(`Project IDs in ${chunkUrl}:`, pidMatch);
                        const aKeyMatch = chunkData.match(/apiKey:[\"']([^\"']+)[\"']/g);
                        console.log(`API Keys in ${chunkUrl}:`, aKeyMatch);
                    });
                });
            });
          }
        });
      });
    } else {
      console.log('Bundle not found in HTML');
    }
  });
});
