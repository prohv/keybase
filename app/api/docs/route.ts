// Swagger UI HTML template
const swaggerHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>KeyBase API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
    <script>
        window.onload = () => {
            window.ui = SwaggerUIBundle({
                url: '/api/openapi.json',
                dom_id: '#swagger-ui',
            });
        };
    </script>
</body>
</html>
`;

export async function GET() {
  return new Response(swaggerHtml, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}