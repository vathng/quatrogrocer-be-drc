require("dotenv").config();

const Pool = require("pg").Pool;
const pool = new Pool({
  user: `${process.env.PGUSERNAME}`,
  database: `${process.env.DATABASE_URL}`,
  password: `${process.env.PGPASSWORD}`,
  port: process.env.PGPORT,
});

const searchTransaction = async function (user_id, transaction_timestamp) {
  let query = {
    text: "select * from quatro_transaction where user_id=$1 and transaction_timestamp=$2",
    values: [user_id, transaction_timestamp],
  };

  let resultQuery = await pool.query(query);
  let transactionSearch = resultQuery.rows;

  if (transactionSearch.length === 0) {
    throw Error("Transaction doesnt exist");
  }
  return transactionSearch;
};

const searchTransactionAPI = async (request, response) => {
  const { user_id, transaction_timestamp } = request.body;

  try {
    let transactionSearch = await searchTransaction(
      user_id,
      transaction_timestamp
    );
    response.status(200).json({ result: transactionSearch });
  } catch (error) {
    response.status(404).json({ error: error.message });
  }
};

const createTransaction = async function (
  transaction_id,
  product_id,
  user_id,
  product_name,
  product_quantity,
  product_price
  // transaction_timestamp
) {
  let transaction_timestamp = new Date();
  let query = {
    text: "insert into quatro_transaction(transaction_id, product_id, user_id, product_name, product_quantity, product_price, transaction_timestamp) values($1,$2,$3,$4,$5,$6,$7) returning transaction_id",
    values: [
      transaction_id,
      product_id,
      user_id,
      product_name,
      product_quantity,
      product_price,
      transaction_timestamp,
    ],
  };

  let resultQuery = await pool.query(query);
  let newTransaction = resultQuery.rows;

  return newTransaction;
};

const createTransactionAPI = async (request, response) => {
  const {
    transaction_id,
    product_id,
    user_id,
    product_name,
    product_quantity,
    product_price,
    // transaction_timestamp,
  } = request.body;
  try {
    let newTransaction = await createTransaction(
      transaction_id,
      product_id,
      user_id,
      product_name,
      product_quantity,
      product_price
      // transaction_timestamp
    );
    response.status(200).json({ result: newTransaction, message: "Success" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const updateTransaction = async function (user_id) {
  let transaction_timestamp = new Date();
  let query = {
    text: `update quatro_transaction 
            set 
          product_name=
            (select quatro_product.product_name 
                from quatro_product 
              where quatro_transaction.product_id = quatro_product.product_id)
            , product_price=
              (select quatro_product.product_price
                from quatro_product 
              where quatro_transaction.product_id = quatro_product.product_id)
            , transaction_timestamp=$1 where user_id=$2;`,
    values: [transaction_timestamp, user_id],
  };

  let resultQuery = await pool.query(query);
  let transactionUpdate = resultQuery.rows;

  return transactionUpdate;
};

const updateTransactionAPI = async (request, response) => {
  const { user_id } = request.body;
  try {
    let transactionUpdate = await updateTransaction(user_id);
    response.status(200).json({
      result: transactionUpdate,
      message: "Successfully update in transaction",
    });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const updateTransactionDiscount = async function (user_id) {
  let transaction_timestamp = new Date();
  let query = {
    text: `update quatro_transaction 
            set 
          product_name=
            (select quatro_product_discount.discount_product_name 
                from quatro_product_discount 
              where quatro_transaction.product_id = quatro_product_discount.discount_product_id)
            , product_price=
              (select quatro_product_discount.discount_product_price
                from quatro_product_discount 
              where quatro_transaction.product_id = quatro_product_discount.discount_product_id)
            , transaction_timestamp=$1 where user_id=$2;`,
    values: [transaction_timestamp, user_id],
  };

  let resultQuery = await pool.query(query);
  let transactionDiscountUpdate = resultQuery.rows;

  return transactionDiscountUpdate;
};

const updateTransactionDiscountAPI = async (request, response) => {
  const { user_id } = request.body;
  try {
    let transactionDiscountUpdate = await updateTransactionDiscount(user_id);
    response.status(200).json({
      result: transactionDiscountUpdate,
      message: "Successfully update in transaction",
    });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

module.exports = {
  searchTransactionAPI,
  createTransactionAPI,
  updateTransactionAPI,
  updateTransactionDiscountAPI,
};
