var mysql = require('mysql2');
require("dotenv").config();


const config={
connectionLimit:4,
<<<<<<< HEAD
  host:'localhost',//"localhost"
  user: 'root',//"root"
  password: "oRifadida100",
  database:"world"
=======
  // host:'localhost',//"localhost"
  // user: 'root',//"root"
  host: process.env.host,//"localhost"
  user: process.env.user,//"root"
  password: process.env.password,
  database:process.env.database
>>>>>>> 9c226d25ebe8ebf3b94156e72ef3690fb5fb2f3f
}
const pool = new mysql.createPool(config);

const connection =  () => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) reject(err);
   // console.log("MySQL pool connected: threadId " + connection.threadId);
    const query = (sql, binding) => {
      return new Promise((resolve, reject) => {
         connection.query(sql, binding, (err, result) => {
           if (err) reject(err);
           resolve(result);
           });
         });
       };
       const release = () => {
         return new Promise((resolve, reject) => {
           if (err) reject(err);
     //      console.log("MySQL pool released: threadId " + connection.threadId);
           resolve(connection.release());
         });
       };
       resolve({ query, release });
     });
   });
 };
const query = (sql, binding) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, binding, (err, result, fields) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};
module.exports = { pool, connection, query };







