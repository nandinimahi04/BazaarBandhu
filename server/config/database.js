const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bazaarbandhu', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes
    await createIndexes();
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // Ensure geospatial indexes are created
    const db = mongoose.connection.db;
    
    // Create compound indexes for better query performance
    await db.collection('users').createIndex({ 
      location: '2dsphere' 
    });
    
    await db.collection('users').createIndex({ 
      userType: 1, 
      isActive: 1, 
      'rating.average': -1 
    });
    
    await db.collection('users').createIndex({ 
      productCategories: 1, 
      'serviceAreas.pincode': 1 
    });
    
    await db.collection('orders').createIndex({ 
      vendor: 1, 
      placedAt: -1 
    });
    
    await db.collection('orders').createIndex({ 
      supplier: 1, 
      status: 1 
    });
    
    console.log('Database indexes created successfully');
    
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

module.exports = connectDB;
