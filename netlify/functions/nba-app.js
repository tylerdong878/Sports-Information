// Static information page for NBA Player Consistency Analyzer
exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html"
    },
    body: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NBA Player Consistency Analyzer</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
      </head>
      <body>
          <div class="container mt-5">
              <div class="row">
                  <div class="col-md-12 text-center">
                      <h1 class="mb-4">NBA Player Consistency Analyzer</h1>
                      <p class="lead">This application identifies NBA players with consistent performance.</p>
                      <div class="alert alert-info">
                          <h4><i class="bi bi-info-circle"></i> Netlify Deployment Status</h4>
                          <p>Flask applications require a server to run Python code.</p>
                          <p>While Netlify can serve static files, it's not ideal for running Flask apps directly.</p>
                      </div>
                      
                      <div class="card mt-5">
                          <div class="card-header bg-primary text-white">
                              <h3>Deployment Options</h3>
                          </div>
                          <div class="card-body">
                              <div class="row">
                                  <div class="col-md-6">
                                      <div class="card mb-3">
                                          <div class="card-header">Option 1: Run Locally</div>
                                          <div class="card-body">
                                              <p>Run the application on your local machine:</p>
                                              <pre class="bg-dark text-light p-3">python app.py</pre>
                                          </div>
                                      </div>
                                  </div>
                                  <div class="col-md-6">
                                      <div class="card mb-3">
                                          <div class="card-header">Option 2: Python-Friendly Host</div>
                                          <div class="card-body">
                                              <p>Deploy to a platform that supports Flask:</p>
                                              <ul class="list-group list-group-flush">
                                                  <li class="list-group-item">Heroku</li>
                                                  <li class="list-group-item">PythonAnywhere</li>
                                                  <li class="list-group-item">AWS Elastic Beanstalk</li>
                                                  <li class="list-group-item">Google App Engine</li>
                                              </ul>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                      
                      <div class="alert alert-success mt-4">
                          <p><i class="bi bi-github"></i> <a href="https://github.com/tylerdong878/Sports-Information">View the source code on GitHub</a></p>
                      </div>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `
  };
}
