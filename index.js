const express = require('express')
const fileUpload = require('express-fileupload');
const { DocumentProcessorServiceClient } =
  require('@google-cloud/documentai').v1;
const { PrismaClient } = require('@prisma/client')



const app = express()
const client = new DocumentProcessorServiceClient()
const prisma = new PrismaClient()

app.set('trust proxy', true);

app.post('/document-ocr', fileUpload(), async (req, res) => {
  console.log("-----------request received------------")
  // obtain file from request data
  let myDoc = req.files.uploadedFile[0];
  console.log(myDoc)

  // set document-ai API key in environment variables
  const mySecret = process.env['GOOGLE_APPLICATION_CREDENTIALS']

  // send encoded file to google API endpoint
  const projectId = 'test-project-360020';
  const location = 'us';
  const processorId = 'f3a61ce838f7b0a4';

  if (myDoc) {

    try {
      // The full resource name of the processor, e.g.:
      // projects/project-id/locations/location/processor/processor-id
      // You must create new processors in the Cloud Console first
      const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;


      // The file data is already stored as a buffer so we only need to base64 encode it.
      const encodedFile = myDoc.data.toString('base64');

      const request = {
        name,
        rawDocument: {
          content: encodedFile,
          mimeType: 'application/pdf',
        },
      };

      // Recognizes text entities in the PDF document
      const [result] = await client.processDocument(request);
      const newDoc = result.document;
      const myText = newDoc.pages.text;
      // log response object
      console.log(myText);

    } catch (err) {
      console.log(err)
    }
  }
})


// -----------------FORM PROCESSOR-----------------------


app.post('/document-form', fileUpload(), async (req, res) => {
  console.log("-----------request received------------")
  // obtain file from request data
  let myDoc = req.files.uploadedFile[0];
  console.log(myDoc)

  // set google-cloud API key in environment variables

  // send encoded file to google API endpoint
  const projectId = 'doc-scanner-360618';
  const location = 'us';
  const processorId = '98e68bd987140a3a';

  if (myDoc) {

    try {
      // The full resource name of the processor, e.g.:
      // projects/project-id/locations/location/processor/processor-id
      // You must create new processors in the Cloud Console first
      const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;


      // The file data is already stored as a buffer so we only need to base64 encode it.
      const encodedFile = myDoc.data.toString('base64');

      const request = {
        name,
        rawDocument: {
          content: encodedFile,
          mimeType: 'application/pdf',
        },
      };

      // Recognizes text entities in the PDF document
      const [result] = await client.processDocument(request);
      const { document } = result;
      const { text } = document;

      if (!document) {
        console.log("No document found")
      }
      // console.log(`Full document text: ${JSON.stringify(text)}`);
      // console.log(`There are ${document.pages.length} page(s) in this                    document.`);

      const saveTableInfo = async (table, text) => {
        // ensure table headers are the same as schema
        let headerRowText = '';
        for (const headerCell of table.headerRows[0].cells) {
          const headerCellText = getText(headerCell.layout.textAnchor, text);
          headerRowText += `${JSON.stringify(headerCellText.trim())} | `;
        }

        // extract first 3 column headers
        const TbHeader = `${headerRowText.substring(0, 44)}`

        // check if headerRowText the same as schema
        const mySchema = `"Receipt No" | "Completion Time" | "Details"`
        if (TbHeader === mySchema) {
          console.log("--------IT MATCHES--------")
        } else {
          console.log("--------IT DOES NOT MATCH--------")
        }

        // create loop to save each row to db
        let bodyArr = [];
        for (const bodyCell of table.bodyRows[2].cells) {
          const bodyCellText = getText(bodyCell.layout.textAnchor, text);
          bodyArr.push(bodyCellText.trim())
          console.log(
            `First row data: ${bodyRowText.substring(0, bodyRowText.length - 3)}`
          );

          const [receipt, time, details, status, moneyIn, moneyOut, balance] = bodyArr;


          const dataObj = {
            receipt: receipt,
            time: time,
            details: details,
            status: status,
            moneyIn: moneyIn,
            moneyOut: moneyOut,
            balance: balance,
          }

          const createRow = await prisma.mpesaStatements.create({
            data: dataObj,
          })

        }
      }



      const printTableInfo = (table, text) => {
        // Print header row
        let headerRowText = '';
        for (const headerCell of table.headerRows[0].cells) {
          const headerCellText = getText(headerCell.layout.textAnchor, text);
          headerRowText += `${JSON.stringify(headerCellText.trim())} | `;
        }
        console.log(
          `Collumns: ${headerRowText.substring(0, headerRowText.length - 3)}`
        );
        const TbHeader = `${headerRowText.substring(0, 44)}`

        const mySchema = `"Receipt No" | "Completion Time" | "Details"`
        if (TbHeader === mySchema) {
          console.log("--------IT MATCHES--------")
        } else {
          console.log("--------IT DOES NOT MATCH--------")
        }

        // Print first body row
        let bodyRowText = '';
        let bodyArr = [];
        for (const bodyCell of table.bodyRows[2].cells) {
          const bodyCellText = getText(bodyCell.layout.textAnchor, text);
          bodyRowText += `${JSON.stringify(bodyCellText.trim())} | `;
          bodyArr.push(bodyCellText.trim())
        }
        console.log(
          `First row data: ${bodyRowText.substring(0, bodyRowText.length - 3)} ARRAY: ${bodyArr}`
        );
      };

      // Extract shards from the text field
      const getText = (textAnchor, text) => {
        if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
          return '';
        }

        // First shard in document doesn't have startIndex property
        const startIndex = textAnchor.textSegments[0].startIndex || 0;
        const endIndex = textAnchor.textSegments[0].endIndex;

        return text.substring(startIndex, endIndex);
      };

      // extract tables data
      for (const page of document.pages) {
        console.log(`\n\n**** Page ${page.pageNumber} ****`);

        console.log(`Found ${page.tables.length} table(s):`);
        for (const table of page.tables) {
          const numCollumns = table.headerRows[0].cells.length;
          const numRows = table.bodyRows.length;
          console.log(`Table with ${numCollumns} columns and ${numRows}   
          rows:`);
          printTableInfo(table, text);
        }
        console.log(`Found ${page.formFields.length} form field(s):`);
        for (const field of page.formFields) {
          const fieldName = getText(field.fieldName.textAnchor, text);
          const fieldValue = getText(field.fieldValue.textAnchor, text);
          console.log(
            `\t* ${JSON.stringify(fieldName)}: ${JSON.stringify(fieldValue)}`
          );
        }

      }


    }
    catch (err) {
      console.log(err)
    }

  }

})

app.listen("8081", () => {
  console.log(`The DB is at: ${process.env.DATABASE_URL}`)
})