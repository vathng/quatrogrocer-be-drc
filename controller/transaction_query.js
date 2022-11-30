require("dotenv").config();

const Pool = require("pg").Pool;
const pool = new Pool({
  user: `${process.env.PGUSERNAME}`,
  database: `${process.env.DATABASE_URL}`,
  password: `${process.env.PGPASSWORD}`,
  port: process.env.PGPORT,
});

const getTransaction = async function (user_id) {
  let query_1 = {
    text: "select user_id from quatro_transaction where user_id=$1",
    values: [user_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let userTransaction = resultQuery_1.rows;

  if (userTransaction.length === 0) {
    throw Error("User doesn't exist");
  }

  let query = {
    text: "select * from quatro_transaction where user_id=$1 and payment_status=true",
    values: [user_id],
  };

  let resultQuery = await pool.query(query);
  let transactionSearch = resultQuery.rows;

  if (transactionSearch.length === 0) {
    throw Error("Transaction doesnt exist");
  }
  return transactionSearch;
};

const getTransactionAPI = async (request, response) => {
  // const { user_id } = request.body;
  let user_id = request.params.id;

  try {
    let transactionSearch = await getTransaction(user_id);
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
    // response.status(200).json({ result: "newTransaction", message: "Success" });
    response.status(200).json({ result: newTransaction, message: "Success" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const updateTransaction = async function (user_id) {
  let transaction_timestamp = new Date();

  let query_1 = {
    text: "select user_id from quatro_user where user_id=$1",
    values: [user_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let user = resultQuery_1.rows;

  if (user.length === 0) {
    throw Error("User doesnt exist");
  }

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
            , 
            product_image=
            (select quatro_product.product_image 
                from quatro_product 
              where quatro_transaction.product_id = quatro_product.product_id)
            ,
            payment_status = false, transaction_timestamp=$1 where user_id=$2;`,
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

  let query_1 = {
    text: "select user_id from quatro_user where user_id=$1",
    values: [user_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let user = resultQuery_1.rows;

  if (uuser.length === 0) {
    throw Error("User doesnt exist");
  }

  let query = {
    text: `update quatro_transaction 
            set 
          product_name=
            (select quatro_product_discount.discount_product_name 
                from quatro_product_discount 
              where quatro_transaction.discount_product_id = quatro_product_discount.discount_product_id)
            , product_price=
              (select quatro_product_discount.discount_product_price
                from quatro_product_discount 
              where quatro_transaction.discount_product_id = quatro_product_discount.discount_product_id)
            , 
            product_image=
            (select quatro_product_discount.discount_product_image 
                from quatro_product_discount 
              where quatro_transaction.discount_product_id = quatro_product_discount.discount_product_id)
            ,
            payment_status = false, transaction_timestamp=$1 where user_id=$2;`,
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

const updatePaymentStatus = async function (user_id) {
  let query_1 = {
    text: "select user_id from quatro_transaction where user_id=$1",
    values: [user_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let user = resultQuery_1.rows;

  if (user.length === 0) {
    throw Error("User doesnt exist");
  }

  let query = {
    text: `update quatro_transaction set payment_status = true where user_id = $1 and product_id = $2`,
    values: [user_id, product_id],
  };

  let resultQuery = await pool.query(query);
  let paymentUpdate = resultQuery.rows;

  return paymentUpdate;
};

const updatePaymentAPI = async (request, response) => {
  const { user_id, product_id } = request.body;
  try {
    let paymentUpdate = await updatePaymentStatus(user_id, product_id);
    response.status(200).json({
      result: paymentUpdate,
      message: "Payment status updated successfully",
    });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

module.exports = {
  getTransactionAPI,
  createTransactionAPI,
  updateTransactionAPI,
  updateTransactionDiscountAPI,
  updatePaymentAPI,
};
