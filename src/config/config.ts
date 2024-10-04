export default () => ({
    port: process.env.PORT || 3001,
    
    DB_PORT: process.env.DB_PORT || 5432,
  
    DB_USERNAME: process.env.DB_USERNAME,
  
    DB_HOST: process.env.DB_HOST,
  
    DB_PASSWORD: process.env.DB_PASSWORD,
  
    DB_NAME: process.env.DB_NAME,

    DB_SYNCHRONIZE: process.env.NODE_ENV,
  
  });
  