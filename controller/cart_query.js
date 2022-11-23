require("dotenv").config();

const Pool = require("pg").Pool;
const pool = new Pool({
  user: `${process.env.PGUSERNAME}`,
  database: `${process.env.DATABASE_URL}`,
  password: `${process.env.PGPASSWORD}`,
  port: process.env.PGPORT,
});

const createCart = async function (
  cart_id,
  user_id,
  product_id,
  product_quantity
) {
  let query = {
    text: "insert into quatro_cart(cart_id, user_id, product_id, product_quantity) values($1,$2,$3,$4) returning cart_id",
    values: [cart_id, user_id, product_id, product_quantity],
  };

  let resultQuery = await pool.query(query);
  let newCart = resultQuery.rows;

  return newCart;
};

const createCartAPI = async (request, response) => {
  const { cart_id, user_id, product_id, product_quantity } = request.body;
  try {
    let newCart = await createCart(
      cart_id,
      user_id,
      product_id,
      product_quantity
    );
    response
      .status(200)
      .json({ result: newCart, message: "Successfully added to cart" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const deleteCart = async function (cart_id) {
  let query = {
    text: "delete from quatro_cart where cart_id = $1 ",
    values: [cart_id],
  };

  let resultQuery = await pool.query(query);
  let cartDelete = resultQuery.rows;

  return cartDelete;
};

const deleteCartAPI = async (request, response) => {
  const { cart_id } = request.body;
  try {
    let cartDelete = await deleteCart(cart_id);
    response
      .status(200)
      .json({ result: deleteCart, message: "Successfully delete from cart" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const pushCart = async function (cart_id) {
  let query = {
    text: "insert into quatro_transaction(user_id, product_id, product_quantity) select user_id, product_id, product_quantity from quatro_cart where cart_id = $1;",
    values: [cart_id],
  };

  let resultQuery = await pool.query(query);
  let cartPush = resultQuery.rows;

  return cartPush;
};

const pushCartAPI = async (request, response) => {
  const { cart_id } = request.body;
  try {
    let cartPush = await pushCart(cart_id);
    response
      .status(200)
      .json({ result: cartPush, message: "Successfully push from cart" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

module.exports = {
  deleteCartAPI,
  createCartAPI,
  pushCartAPI,
};
