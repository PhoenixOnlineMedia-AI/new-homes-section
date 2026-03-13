const http = require('http');

const TOKEN = "NHS_bfc77e064c9218461d93b818815a99bb";

function fetchAPI(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });
  });
}

async function run() {
  console.log("1. Get builders with name ILIKE 'homes'");
  let r = await fetchAPI('/api/v1/data/builders?name__ilike=homes');
  console.log(`Status: ${r.status}, Found: ${r.data.data ? r.data.data.length : 'Error'} records`);

  console.log("\n2. Get communities by builder_slug=bellaire-homes");
  r = await fetchAPI('/api/v1/data/communities?builder_slug=bellaire-homes');
  console.log(`Status: ${r.status}, Found: ${r.data.data ? r.data.data.length : 'Error'} records`);

  console.log("\n3. Invalid field rejection");
  r = await fetchAPI('/api/v1/data/builders?invalid_col=123');
  console.log(`Status: ${r.status}, error:`, r.data.error);
}

run();
