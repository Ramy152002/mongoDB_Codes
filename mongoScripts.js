// ====== CREATE / DROP ======
use myDatabase; // Create or switch to database
db.createCollection("myCollection");
db.myCollection.drop();

// ====== INSERT ======
db.posts.insertOne({
  title: "Post Title 1",
  body: "Body of post.",
  category: "News",
  likes: 1,
  tags: ["news", "events"],
  date: Date()
});

db.posts.insertMany([
  {
    title: "Post Title 2",
    body: "Body of post.",
    category: "Event",
    likes: 2,
    tags: ["news", "events"],
    date: Date()
  },
  {
    title: "Post Title 3",
    body: "Body of post.",
    category: "Technology",
    likes: 3,
    tags: ["news", "events"],
    date: Date()
  },
  {
    title: "Post Title 4",
    body: "Body of post.",
    category: "Event",
    likes: 4,
    tags: ["news", "events"],
    date: Date()
  }
]);

// ====== FIND ======
db.posts.find(); // All documents
db.posts.find({ category: "News" }); // With condition
db.posts.find({}, { title: 1, date: 1 }); // Projection
db.posts.find({}, { _id: 0, title: 1, date: 1 }); // Exclude _id
db.posts.find({}, { category: 0 }); // Exclude category
db.posts.find({ title: { $regex: "Post", $options: "i" } }); // Regex case-insensitive

// ====== FIND ONE ======
db.posts.findOne();
db.posts.findOne({ title: "Post Title 1" });

// ====== UPDATE ======
db.posts.updateOne(
  { title: "Post Title 1" },
  { $set: { likes: 2 } }
);

db.posts.updateOne(
  { title: "Post Title 5" },
  {
    $set: {
      title: "Post Title 5",
      body: "Body of post.",
      category: "Event",
      likes: 5,
      tags: ["news", "events"],
      date: Date()
    }
  },
  { upsert: true }
);

db.posts.updateMany({}, { $inc: { likes: 1 } });

// ====== DELETE ======
db.posts.deleteOne({ title: "Post Title 5" });
db.posts.deleteMany({ category: "Technology" });

// ====== QUERY OPERATORS ======
// Comparison
db.inventory.find({ price: { $gt: 10 } });
db.inventory.find({ quantity: { $lte: 20 } });
db.inventory.find({ price: { $in: [5.99, 9.99] } });

// Logical
db.inventory.find({ $and: [{ price: { $ne: 1.99 } }, { price: { $exists: true } }] });
db.inventory.find({ price: { $ne: 1.99, $exists: true } });
db.inventory.find({ $or: [{ quantity: { $lt: 20 } }, { price: 10 }] });
db.inventory.find({ $nor: [{ price: 1.99 }, { sale: true }] });
db.inventory.find({ price: { $not: { $gt: 1.99 } } });

// Evaluation
db.inventory.find({ item: { $regex: "p." } });
db.articles.find({ $text: { $search: "coffee" } });

// ====== UPDATE OPERATORS ======
// Fields
db.products.updateOne({ name: "abc123" }, { $inc: { quantity: -2, "metrics.orders": 1 } });
db.students.updateMany({ nmae: { $ne: null } }, { $rename: { nmae: "name" } });
db.products.updateOne({ _id: 100 }, { $set: { quantity: 500 } });
db.products.updateOne({ sku: "unknown" }, { $unset: { quantity: "", instock: "" } });

// Arrays
db.pigments.updateOne({ _id: 1 }, { $addToSet: { colors: "mauve" } });
db.students.updateOne({ _id: 1 }, { $pop: { scores: -1 } }); // Remove first
db.students.updateOne({ _id: 10 }, { $pop: { scores: 1 } }); // Remove last
db.stores.updateMany({}, { $pull: { fruits: { $in: ["apples", "oranges"] }, vegetables: "carrots" } });
db.students.updateOne({ _id: 1 }, { $push: { scores: 89 } });
db.students.updateOne({ name: "joe" }, { $push: { scores: { $each: [90, 92, 85] } } });

// 4 & 5


// MongoDB Aggregation Pipeline Examples from "ERP-lab4.pptx"

// Example 1: $sort, $project, $limit
db.listingsAndReviews.aggregate([
  {$sort: { "accommodates": -1 }}, // Sort by accommodates descending [cite: 3, 4]
  {$project: { "name": 1, "accommodates": 1 }}, // Project name and accommodates [cite: 4]
  {$limit: 5} // Limit to 5 documents [cite: 4]
])

// Example 2: $addFields, $project, $limit
db.restaurants.aggregate([
  {$addFields: { avgGrade: { $avg: "$grades.score" } }}, // Add avgGrade field [cite: 5, 6]
  {$project: { "name": 1, "avgGrade": 1 }}, // Project name and avgGrade [cite: 6]
  {$limit: 5} // Limit to 5 documents [cite: 6]
])

// Example 3: $match, $count
db.restaurants.aggregate([
  {$match: { "cuisine": "Chinese" }}, // Filter by cuisine [cite: 8]
  {$count: "totalChinese"} // Count matching documents [cite: 8]
])

// Example 4: $lookup, $limit
db.comments.aggregate([
  {$lookup: { 
    from: "movies", // Join with movies collection [cite: 12]
    localField: "movie_id", // Field in comments collection [cite: 12]
    foreignField: "_id", // Field in movies collection [cite: 12]
    as: "movie_details" // Alias for joined data [cite: 12]
  }},
  {$limit: 1} // Limit to 1 document [cite: 12]
])

// Example 5: $group, $out
db.listingsAndReviews.aggregate([
  {$group: {
    _id: "$property_type", // Group by property_type [cite: 15]
    properties: { 
      $push: { // Create array of properties [cite: 15]
        name: "$name",
        accommodates: "$accommodates",
        price: "$price"
      }
    }
  }},
  { $out: "properties_by_type" } // Output to new collection [cite: 15, 16]
])

// Example 6: $match, $group (from slide 22)
db.posts.aggregate([
  { $match: { likes: { $gt: 1 } } }, // Filter posts with more than 1 like [cite: 22]
  { $group: { _id: "$category", totalLikes: { $sum: "$likes" } } } // Group by category and sum likes [cite: 22]
])

// Example 7: $limit
db.movies.aggregate([ { $limit: 1 } ]) // Limit to 1 movie [cite: 23]

// Example 8: $project, $limit
db.restaurants.aggregate([
  {$project: { "name": 1, "cuisine": 1, "address": 1 }}, // Project specific fields [cite: 26]
  {$limit: 5} // Limit to 5 documents [cite: 26]
])

// Example 9: $match, $limit, $project
db.listingsAndReviews.aggregate([
  { $match: { property_type: "House" } }, // Filter by property_type [cite: 30]
  { $limit: 2 }, // Limit to 2 documents [cite: 30]
  { $project: { "name": 1, "bedrooms": 1, "price": 1 } } // Project specific fields [cite: 30]
])

// Example 10: $group
db.listingsAndReviews.aggregate([
  { $group: { _id: "$property_type" } }  // Group by property_type [cite: 33]
])

// Example 11: $match, $group (from slide 33)
db.orders.aggregate([
  { $match: { status: "A" } }, // Match orders with status "A"
  { $group: { _id: "$cust_id", total: { $sum: "$amount" } } } // Group by cust_id and sum amount
])

// MongoDB Data API examples from "ERP-Lab5.pptx"

// Example 1:  Data API request (requires App ID, API Key, Cluster name)
/*
curl --location --request POST 'https://data.mongodb-api.com/app/<Data API App ID>/endpoint/data/v1/action/findOne' \
--header 'Content-Type: application/json' \
--header 'Access-Control-Request-Headers: *' \
--header 'api-key: <API_KEY>' \
--data-raw '{
    "collection": "<COLLECTION_NAME>",
    "database": "<DATABASE_NAME>",
    "dataSource": "<CLUSTER_NAME>",
    "projection": {"_id": 1}
}'
*/

// Example 2: Data API findOne (from slide 42)
/*
{
  "dataSource": "<data source name>",
  "database": "<database name>",
  "collection": "<collection name>",
  "filter": <query filter>,
  "projection": <projection>
}
*/

// Example 3:  Schema Validation
db.createCollection("posts", {
  validator: {
    $jsonSchema: {
      bsonType: "object", required: [ "title", "body" ],
      properties: {
        title: { bsonType: "string", description: "Title of post - Required." },
        body: { bsonType: "string", description: "Body of post - Required." },
        category: { bsonType: "string", description: "Category of post - Optional." },
        likes: { bsonType: "int", description: "Post like count. Must be an integer - Optional." },
        tags: { bsonType: ["string"], description: "Must be an array of strings - Optional." },
        date: { bsonType: "date", description: "Must be a date - Optional." }
      }
    }
  }
})


db.comments.aggregate([
{$lookup: {from: "movies", localField: "movie_id", foreignField: "_id",as: "movie_details",},},
{$limit: 1}])

db.createCollection("validschemaa",{
validator:{
$jsonSchema:{
bsonType:'object',required:['title','price'],
properties:{
title:{bsonType:"string",description:"description"}
}
}
}

})
//search index
db.movies.aggregate([
{$search: {index: "default", 
// optional unless you named your index something other than "default"
text: {query: "star wars",path: "title"},},},
  {$project: {title: 1,year: 1,}}])
