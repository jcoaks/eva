import getClientTurso from "./turso.mjs";

export const handler = async(event) => {

  
  const turso = await getClientTurso();

  const result = await turso.execute("SELECT * FROM products");
  var csv_text = convertToCsv(result);

  return {
    statusCode: 200,
    body: csv_text
  };
};

function convertToCsv(data) {
  const headers = data.columns;
  const raw_data = data.rows;
  let csv = "";
  for (let i = 0; i < headers.length; i++) {
    csv += headers[i]+";";
  }
  csv += "\n";
  raw_data.forEach(d => {
    for (let i = 0; i < headers.length; i++) {
      csv += d[i] + ";";
    }
    csv += "\n";
  });
  return csv;
}