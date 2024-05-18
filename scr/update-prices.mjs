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

  var product_name = product.PRODUCTO;
  var profit_percentage = product.GANANCIA;
  var code = product.CODIGO;
  var wholesale_price = product.MAYOR;
  var detailed_price = product.DETAL;
  var price_per_unit_pound = product.DETALLIBRAS;
  var type_boolean = product.UNIDADLIBRA;
  var type = 'lb'
  if(type_boolean)
    type = 'ud'
  var id = 0;
  try {
    var db_product = await turso.execute({
      sql: "SELECT id FROM products WHERE code=?;",
      args: [code],
    });
    id = db_product.rows[0].id;
  }
  catch (exceptionVar) {
    await turso.execute({
      sql: "INSERT INTO products (name, code, profit_percentage, wholesale_price, detailed_price, price_per_unit_pound, type, show_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [product_name, code, profit_percentage, wholesale_price, detailed_price, price_per_unit_pound, type, 1],
    });
    db_product = await turso.execute({
      sql: "SELECT id FROM products WHERE code=?;",
      args: [code]
    });
    id = db_product.rows[0].id;
    console.log(`${id} ${code} new product added!`);
  }
  
  try {
    const result = await turso.execute({
      sql: "SELECT id FROM products WHERE wholesale_price=? AND detailed_price=? AND price_per_unit_pound=? AND code=?;",
      args: [wholesale_price, detailed_price, price_per_unit_pound, code],
    });
    console.log(`${id} ${code} already has the price updated!`);
  }
  catch (exceptionVar) {
    const result1 = await turso.execute({
      sql: "UPDATE products SET wholesale_price=?, detailed_price=?, price_per_unit_pound=?, type=? WHERE code=?;",
      args: [wholesale_price, detailed_price, price_per_unit_pound, type, code],
    });
    const result2 = await turso.execute({
      sql: "INSERT INTO product_price_history (product_id, effective_date, detailed_price, wholesale_price, price_per_unit_pound) VALUES (?, date(datetime('now')), ?, ?, ?)",
      args: [id, detailed_price, wholesale_price, price_per_unit_pound],
    });
    console.log(`${id} ${code} price updated!`);
  }
  return code;
}