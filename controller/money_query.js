require("dotenv").config();

const Pool = require("pg").Pool;
const pool = new Pool({
  user: `${process.env.PGUSERNAME}`,
  database: `${process.env.DATABASE_URL}`,
  password: `${process.env.PGPASSWORD}`,
  port: process.env.PGPORT,
});

const minusCreditUpdate = async function (user_credit, user_id) {
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
    text: `update quatro_user set user_credit = user_credit - $1 where user_id = $2;`,
    values: [user_credit, user_id],
  };

  let resultQuery = await pool.query(query);
  let minusCredit = resultQuery.rows;

  return minusCredit;
};

const minusCreditUpdateAPI = async (request, response) => {
  const { user_credit, user_id } = request.body;

  try {
    let minusCredit = await minusCreditUpdate(user_credit, user_id);

    response.status(200).json({
      result: minusCredit,
      message: "User credit updated",
    });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const addCreditUpdate = async function (user_credit, user_id) {
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
    text: `update quatro_user set user_credit = user_credit + $1 where user_id = $2;`,
    values: [user_credit, user_id],
  };

  let resultQuery = await pool.query(query);
  let plusCredit = resultQuery.rows;

  return plusCredit;
};

const addCreditUpdateAPI = async (request, response) => {
  const { user_credit, user_id } = request.body;

  try {
    let plusCredit = await addCreditUpdate(user_credit, user_id);

    response.status(200).json({
      result: plusCredit,
      message: "User credit added",
    });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

module.exports = {
  minusCreditUpdateAPI,
  addCreditUpdateAPI,
};
