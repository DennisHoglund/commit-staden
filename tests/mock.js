// Mockar all extern trafik så att testerna är stabila och snabba.
// Typsnitt från Google Fonts ersätts med tomma svar, allt annat externt stoppas.
async function mocka(page) {
  const api = { anrop: [] };
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) =>
    route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await page.route((url) => url.hostname !== '127.0.0.1' && !/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname), (route) => {
    api.anrop.push(route.request().url());
    return route.abort();
  });
  return api;
}

module.exports = { mocka };
