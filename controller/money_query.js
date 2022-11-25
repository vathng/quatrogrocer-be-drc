require("dotenv").config();

const Pool = require("pg").Pool;
const pool = new Pool({
  user: `${process.env.PGUSERNAME}`,
  database: `${process.env.DATABASE_URL}`,
  password: `${process.env.PGPASSWORD}`,
  port: process.env.PGPORT,
});

const minusCreditUpdate = async function (user_id, user_credit) {
  let query = {
    text: `update quatro_user set user_credit = user_credit - $1 where user_id = $2;`,
    values: [user_id, user_credit],
  };

  let resultQuery = await pool.query(query);
  let minusCredit = resultQuery.rows;

  return minusCredit;
};

const minusCreditUpdateAPI = async (request, response) => {
  const { user_id, user_credit } = request.body;

  try {
    let minusCredit = await minusCreditUpdate(user_id, user_credit);

    response.status(200).json({
      result: minusCredit,
      message: "User credit updated",
    });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const addCreditUpdate = async function (user_id, user_credit) {
  let query = {
    text: `update quatro_user set user_credit = user_credit + $1 where user_id = $2;`,
    values: [user_id, user_credit],
  };

  let resultQuery = await pool.query(query);
  let plusCredit = resultQuery.rows;

  return plusCredit;
};

const addCreditUpdateAPI = async (request, response) => {
  const { user_id, user_credit } = request.body;

  try {
    let plusCredit = await addCreditUpdate(user_id, user_credit);

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
