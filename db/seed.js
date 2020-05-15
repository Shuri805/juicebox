const {
  client,
  getAllUsers,
  createUser
 } = require('./index');

async function createInitalUsers() {
  try{
    console.log("Starting to create users...");

    const albert = await createUser({ username: 'albert', password: 'bertie99' });
    const albertTwo = await createUser({ username: 'sandra', password: 'glamgal' });


    console.log(albert);

    console.log("Finished creating users!");
  } catch(error) {
    console.log("Error creating users!");
    throw error;
  }
}

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitalUsers();
  } catch (error) {
    throw error;
  }
}

//calls a query which drops all tables from our database
async function dropTables() {
  try {
    console.log("Starting to drop tables...");
    await client.query(`
      DROP TABLE IF EXISTS users;
    `);
    console.log("Finished dropping table!");
  } catch (error) {
    console.error("Error dropping tables!");
    //pass the error up to the function that calls dropTables
    throw error;
  }
}

//calls a query which creates all tables for our database
async function createTables(){
  try {
    console.log("Starting to build tables...");

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL
      );
    `);
    console.log("Finished building tables!");

  } catch (error) {
    console.error("Error building tables!");

    //pass the error up to the function that calls createTables
    throw error;
  }
}


async function testDB(){
  try{
    console.log("Starting to test database...");

    // client.connect();     // connect the client to the database
    // const result = await client.query(`SELECT * FROM users;`);
    // console.log(result);
    const users = await getAllUsers();
    console.log("getAllUsers:", users);

    console.log("Finished database tests!");

  } catch(error ) {
    console.error("Error testing database!")
    throw error;
  }
}
//run testDB to connect to the database and return results

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
