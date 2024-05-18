import getClientTurso from "../turso.mjs";

export const handler = async(event) => {

  const turso = await getClientTurso();
  const result = await turso.execute("SELECT * FROM products ORDER BY name ASC");

  return {
    statusCode: 200,
    body: JSON.stringify(
      result.rows,
      null,
      2
    ),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  };
};