export const handler = async(event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Function executed successfully!",
        input: event,
      },
      null,
      2
    ),
  };
};