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
  var database_product = null;
  try {
    var db_product = await turso.execute({
      sql: "SELECT * FROM products WHERE code=?;",
      args: [code],
    });
    database_product = db_product.rows[0];
    var id = db_product.rows[0].id;
  }
  catch (exceptionVar) {
    await turso.execute({
      sql: "INSERT INTO products (name, code, profit_percentage, wholesale_price, detailed_price, price_per_unit_pound, type, show_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [product_name, code, profit_percentage, wholesale_price, detailed_price, price_per_unit_pound, type, 1],
    });
    db_product = await turso.execute({
      sql: "SELECT * FROM products WHERE code=?;",
      args: [code]
    });
    database_product = db_product.rows[0];
    console.log(`${database_product.id} ${code} new product added!`);
  }

  try {
    if(database_product.image_url != ""){
      var image_url = await getProductImage(database_product.name);
      console.log(image_url);
      if(image_url != null && image_url != ""){
        const result1 = await turso.execute({
          sql: "UPDATE products SET image_url=? WHERE code=?;",
          args: [image_url, code],
        });
        console.log(`${database_product.id} ${code} image updated!`);
      }
    }
  }
  catch (exceptionVar) {
    console.error(exceptionVar);
  }
  
  try {
    const result = await turso.execute({
      sql: "SELECT id FROM products WHERE name=? AND profit_percentage=? AND wholesale_price=? AND detailed_price=? AND price_per_unit_pound=? AND code=?;",
      args: [product_name, profit_percentage, wholesale_price, detailed_price, price_per_unit_pound, code],
    });
    var id = result.rows[0].id;
    console.log(`${database_product.id} ${code} already has the price updated!`);
  }
  catch (exceptionVar) {
    const result1 = await turso.execute({
      sql: "UPDATE products SET name=?, profit_percentage=?, wholesale_price=?, detailed_price=?, price_per_unit_pound=?, type=? WHERE code=?;",
      args: [product_name, profit_percentage, wholesale_price, detailed_price, price_per_unit_pound, type, code],
    });
    const result2 = await turso.execute({
      sql: "INSERT INTO product_price_history (product_id, effective_date, detailed_price, wholesale_price, price_per_unit_pound) VALUES (?, date(datetime('now')), ?, ?, ?)",
      args: [database_product.id, detailed_price, wholesale_price, price_per_unit_pound],
    });
    console.log(`${database_product.id} ${code} price updated!`);
  }
  return code;
}

async function getProductImage(query){
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  console.log(accessKey);
  var url = `https://api.unsplash.com/search/photos?query=${query}%20fruta&orientation=squarish&client_id=${accessKey}&page=1&per_page=1&lang=es`;
  fetch(url)
      .then(response => response.json())
      .then(data => {
          console.log(data);
          try{
            return data.results[0].urls.thumb;
          }catch(exc){
            console.log(exc);
            return null;
          }
      })
      .catch(error => {
        console.error('Error al obtener imágenes:', error);
        return null;
      });
}