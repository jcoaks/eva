import getClientTurso from "./turso.mjs";

export const handler = async(event) => {

  var API_URL = "https://script.google.com/macros/s/AKfycbwID9vxABVdUJP4JgWuK-ov-FcKZsicrJ8Gx99pa0Zzl0OmFt4RqRf00m_9Yw82DBNh/exec?path=EDITAR&action=json";
  //var API_URL = "https://824b2ebf-9f0d-4348-8226-3df1ffc2db77.mock.pstmn.io/detal";

  fetch(`${API_URL}`)
    .then((response) => response.json())
    .then(function (list) {
      var itemsProcessed = 0;
      list.data.forEach(async function(product) {
        if(product.DETAL != "")
          await updateProduct(product);
      });
    }).catch(function(err) {
        console.log(err);
    });

  return {
    statusCode: 200,
    body: "products updated successfully",
  };
};


async function updateProduct(product) {
  const turso = await getClientTurso();

  var code = product.CODIGO;
  var wholesale_price = product.MAYOR;
  var detailed_price = product.DETAL;
  var price_per_unit_pound = product.DETALLIBRAS;
  var type_boolean = product.UNIDADLIBRA;
  var type = 'lb'
  if(type_boolean)
    type = 'ud'


  // const db_product = await turso.execute({
  //   sql: "SELECT * FROM products WHERE code=?;",
  //   args: [code],
  // });
  // if(!db_product) {
  //   const result = await turso.execute({
  //     sql: "SELECT * FROM products WHERE wholesale_price=? AND detailed_price=? AND price_per_unit_pound=? AND code=?;",
  //     args: [wholesale_price, detailed_price, price_per_unit_pound, code],
  //   });
  //   if(result) {
      const result1 = await turso.execute({
        sql: "UPDATE products SET wholesale_price=?, detailed_price=?, price_per_unit_pound=?, type=? WHERE code=?;",
        args: [wholesale_price, detailed_price, price_per_unit_pound, type, code],
      });
      console.log(result1)
      // const result2 = await turso.execute({
      //   sql: "INSERT INTO product_price_history SET product_id=?, effective_date=date(datetime('now')), detailed_price=?, wholesale_price=?, unit_pound_indicator='lb';",
      //   args: [db_product['id'], detailed_price, price_per_unit_pound, code],
      // });
      // console.log(result2)
      console.log("Updated!")
  //   }
  // }
  return code;
}