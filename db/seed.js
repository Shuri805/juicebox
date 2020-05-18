const {
  client,
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser,
  createTags,
  addTagsToPost,
  getPostById,
  getPostsByTagName
 } = require('./index');

 //calls a query which drops all tables from our database
async function dropTables() {
  try {
    console.log("Starting to drop tables...");
    await client.query(`
      DROP TABLE IF EXISTS post_tags;
      DROP TABLE IF EXISTS tags;
      DROP TABLE IF EXISTS posts;
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
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        active BOOLEAN DEFAULT true
      );
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        "authorId" INTEGER REFERENCES users(id),
        title varchar(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
      );
      CREATE TABLE tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );
      CREATE TABLE post_tags (
        "postId" INTEGER REFERENCES posts(id),
        "tagId" INTEGER REFERENCES tags(id), UNIQUE ("postId", "tagId")
      );
    `);
    console.log("Finished building tables!");

  } catch (error) {
    console.error("Error building tables!");

    //pass the error up to the function that calls createTables
    throw error;
  }
}

async function createInitalUsers() {
  try{
    console.log("Starting to create users...");

    const albert = await createUser({ username: 'albert', password: 'bertie99', name: 'albert', location: 'San Diego' });

    const sandra = await createUser({ username: 'sandra', password: '2sandy4me', name: 'sandra', location: 'Sacramento' });

    const glamgal = await createUser({ username: 'glamgal', password: 'soglam', name: 'glamgal', location: 'Los Angeles' });


    console.log(albert);

    console.log("Finished creating users!");
  } catch(error) {
    console.log("Error creating users!");
    throw error;
  }
}

async function createInitialPosts() {
  try {
    const [albert, sandra, glamgal] = await getAllUsers();

    console.log("Starting to create posts...");
    await createPost({
      authorId: albert.id,
      title: "First Post",
      content: "This is my first post. I hope I love writing blogs as much as I love writing them."
    });

    await createPost({
      authorId: sandra.id,
      title: "How does this work?",
      content: "Seriously, does this even do anything?"
    });

    await createPost({
      authorId: glamgal.id,
      title: "Living the Glam Life",
      content: "Do you even? I swear that half of you are posing."
    });
    console.log("Finished creating posts!");
  } catch (error) {
    console.log("Error creating posts!");
    throw error;
  }
}

// async function createInitialTags() {
//   try {
//     console.log("Starting to create tags...");

//     const [happy, sad, inspo, catman] = await createTags([
//       '#happy',
//       '#worst-day-ever',
//       '#youcandoanything',
//       '#catmandoeverything'
//     ]);

//     const [postOne, postTwo, postThree] = await getAllPosts();

//     await addTagsToPost(postOne.id, [happy, inspo]);
//     await addTagsToPost(postTwo.id, [sad, inspo]);
//     await addTagsToPost(postThree.id, [happy, catman, inspo]);

//     console.log("Finished creating tags!");
//   } catch (error) {
//     console.log("Error creating tags!");
//     throw error;
//   }
// }

async function testDB(){
  try{
    console.log("Starting to test database...");

    // client.connect();     // connect the client to the database
    // const result = await client.query(`SELECT * FROM users;`);
    // console.log(result);
    const users = await getAllUsers();
    console.log("getAllUsers:", users);

    console.log("Calling updateUser on users[0]")
    const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY"
    });


    console.log("Result", updateUserResult);

    console.log("Calling getAllPosts");
    const posts = await getAllPosts();
    console.log("Result:", posts);

    // console.log("Calling updatePost on posts[0]");
    // const updatePostResult = await updatePost(posts[0].id, {
    //   title: "New Title",
    //   content: "Updated Content"
    // });
    // console.log("Result:", updatePostResult);

    // console.log("Calling updatePost on posts[1], only updating tags");
    // const updatePostTagsResult = await updatePost(posts[1].id, {
    //   tags: ["#youcandoanything", "#redfish", "#bluefish"]
    // });

    // console.log("Calling getPostsByUser on user 1");
    // const postsForUser = await getPostsByUser(1);
    // console.log("UER 1'S POSTS", postsForUser)

    // console.log("Calling getUserById with 1");
    // const albert = await getUserById(1);
    // console.log("Result:", albert);

    console.log("Calling updatePost on posts[1], only updating tags");
    const updatePostTagsResult = await updatePost(posts[1].id, {
      tags: ["#youcandoanything", "#redfish", "#bluefish"]
    });
    console.log("Result:", updatePostTagsResult);

    console.log("Calling getPostsByTagName with #happy");
    const postsWithHappy = await getPostsByTagName("#happy");
    console.log("Result:", postsWithHappy);

    console.log("Finished database tests!");

  } catch(error ) {
    console.error("Error testing database!")
    throw error;
  }
}
//run testDB to connect to the database and return results


async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitalUsers();
    await createInitialPosts();
    // await createInitialTags();
  } catch (error) {
    console.log("Error during rebuildDB")
    throw error;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
