import dotenv from "dotenv";

dotenv.config();

const config = {
  //Port to run the server
  port: process.env.PORT || 5000,

  //Connection to the database
  mongooseConnection: process.env.DATABASE,

  //Secret key for the JWT
  secretKey: process.env.SECRET_KEY,

  //Salt rounds for the bcrypt
  saltRounds: Number(process.env.SALT_ROUNDS),

  //Expiration time for the JWT
  expiresIn: Number(process.env.EXPIRES_IN),
};

export default config;