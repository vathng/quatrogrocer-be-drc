const bcrypt = require("bcrypt");
const { Query } = require("pg");

const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  host: "postgres",
  database: "my_db",
  password: "postgres", //find how to hide/encrypt the password
  port: 5432,
});

const searchUser = async function (first_name, last_name) {
  let query = {
    text: "select * from quatro_user where first_name=$1 and last_name=$2",
    values: [first_name, last_name],
  };

  let resultQuery = await pool.query(query);
  let fl_name = resultQuery.rows;

  if (fl_name.length === 0) {
    throw Error("User doesnt exist");
  }
  return fl_name[0];
};

const searchUserAPI = async (request, response) => {
  const { first_name, last_name } = request.body;

  try {
    let fl_name = await searchUser(first_name, last_name);
    response.status(200).json({ result: fl_name });
  } catch (error) {
    response.status(404).json({ error: error.message });
  }
};

const loginUser = async function (email, password) {
  let query = {
    text: "select * from quatro_user where email=$1",
    values: [email],
  };

  let resultQuery = await pool.query(query);
  let user = resultQuery.rows;

  if (user.length === 0) {
    throw Error("Email doesnt exist");
  }

  console.log(user);
  let validPassword = await bcrypt.compare(password, user[0]["password"]);

  if (!validPassword) {
    throw Error("Invalid Password");
  }
  return user[0];
};

const loginAPI = async (request, response) => {
  const { email, password } = request.body;
  try {
    let user = await loginUser(email, password);
    response.status(200).json({ result: user });
  } catch (error) {
    response.status(404).json({ error: error.message });
  }
};

const createUser = async function (email, password) {
  let query_1 = {
    text: "select * from quatro_user where email=$1",
    values: [email],
  };

  let resultQuery_1 = await pool.query(query_1);
  let user = resultQuery_1.rows;

  if (user.length !== 0) {
    throw Error("Email exist");
  }

  const salt = await bcrypt.genSalt(10);
  const passHash = await bcrypt.hash(password, salt);

  let query = {
    text: "insert into quatro_user(email,password,user_credit) values ($1,$2,100) returning user_id",
    values: [email, passHash],
  };

  let resultQuery = await pool.query(query);
  let newUser = resultQuery.rows;

  return newUser;
};

const createUserAPI = async (request, response) => {
  const { email, password } = request.body;
  try {
    let newUser = await createUser(email, password);
    response.status(200).json({ result: newUser });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const updateUser = async function (
  first_name,
  last_name,
  date_of_birth,
  phone_number,
  email,
  password,
  user_id
) {
  const salt = await bcrypt.genSalt(10);
  const passHash = await bcrypt.hash(password, salt);
  if (isNaN(phone_number)) {
    throw error("Invalid phone number");
  }
  let query = {
    text: `update quatro_user set first_name = coalesce(nullif($1,''), first_name),
           last_name = coalesce(nullif($2,''), last_name),
           date_of_birth = coalesce(nullif($3,''), date_of_birth),
           phone_number = coalesce(nullif($4,''), phone_number),
           email = coalesce(nullif($5,''), email),
           password = coalesce(nullif($6,''), password)
           where user_id = $7`,
    values: [
      first_name,
      last_name,
      date_of_birth,
      phone_number,
      email,
      passHash,
      user_id,
    ],
  };

  let resultQuery = await pool.query(query);
  let userUpdate = resultQuery.rows;

  return userUpdate[0];
};

const updateUserAPI = async (request, response) => {
  const {
    first_name,
    last_name,
    date_of_birth,
    phone_number,
    email,
    password,
    user_id,
  } = request.body;
  try {
    let updateUserDB = await updateUser(
      first_name,
      last_name,
      date_of_birth,
      phone_number,
      email,
      password,
      user_id
    );
    response
      .status(200)
      .json({ result: updateUserDB, message: "User updated" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const deleteUser = async function (user_id) {
  let query = {
    text: "delete from quatro_user where user_id = $1",
    values: [user_id],
  };

  let resultQuery = await pool.query(query);
  let deletedUser = resultQuery.rows;
  return deletedUser;
};

const deleteUserAPI = async (request, response) => {
  const { user_id } = request.body;
  try {
    let userDelete = await deleteUser(user_id);
    response.status(200).json({ result: userDelete });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

module.exports = {
  searchUserAPI,
  loginAPI,
  createUserAPI,
  updateUserAPI,
  deleteUserAPI,
};
