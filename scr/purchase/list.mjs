import { createClient } from "@libsql/client";

export const handler = async(event) => {

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const result = await client.execute("SELECT * FROM purchases");

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v3.0! Your function executed successfully!",
        input: result,
      },
      null,
      2
    ),
  };
};