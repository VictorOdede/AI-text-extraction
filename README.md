# Document AI REST API
This is a REST API for processing PDF documents built on Google Document-AI.

## Why?
Many businesses have a large amount of dark data stored in PDF files and physical documents. This data contains a gold mine of insights that can be used by
the business to inform trends, patterns and key business decisions. In order to use this dark data, we need to extract it from the documents in a structured manner
then store the data in a secure database or data warehouse. This structured data can then be analyzed to generate new insights and business analytics. All this
can be done using Google's pre-trained text extraction model known as Document-AI.

## How it works
The process of extracting and storing the data involves the following steps:
* User uploads documents in PDF format and sends it to the server as a Buffer
* Server endpoint receives PDF, confirms the correct format
* Encode file to Base64 
* The file is then forwarded to a specified Document AI parser e.g. document-ocr, form-parser, etc
* Document AI returns a response with the extracted text data
* Confirm the returned data complies with your database Schema
* If the data matches the schema then we can safely store the data on our Postgres db

## Bonus
If the extracted data does not match your schema, you can use the Document AI Human-In-The-Loop feature to manually edit and store the extracted data.
You can use this feature to automatically flag documents below a specified threshold. Flagged documents will be automatically forwarded to a human for review. 
I have also included the app.yaml file to automatically deploy to Google App Engine and CloudSQL.  

## Languages + Frameworks
* JavaScript
* NodeJS
* Express
* Postgres
* GraphQL
* Prisma
* Google Cloud Platform
