function euclideanDistance(emb1, emb2) {
  let sum = 0;
  for (let i = 0; i < emb1.length; i++) {
    sum += Math.pow(emb1[i] - emb2[i], 2);
  }
  return Math.sqrt(sum);
}

const mongoose = require('mongoose');
const User = require('./models/User');

async function checkDistance() {
  await mongoose.connect('mongodb://127.0.0.1:27017/trustlink');
  const user = await User.findOne().sort({ createdAt: -1 });
  
  if(user) {
    const emb1 = user.faceEmbedding;
    // create a fake embedding with same numbers to check 0 distance
    const fake1 = Array.from(emb1).map(x => x);
    console.log('Distance to itself:', euclideanDistance(emb1, fake1));
    
    // create a totally different embedding (e.g. random numbers or large difference)
    const fake2 = Array.from(emb1).map(x => x + 0.1); // Add 0.1 to 128 elements. 128 * 0.01 = 1.28. sqrt(1.28) > 1!
    console.log('Distance to +0.1 shift:', euclideanDistance(emb1, fake2));
    
    // create random face embedding
    const randomEmb = Array.from({length:128}, () => (Math.random() - 0.5) * 0.2);
    console.log('Distance to random face:', euclideanDistance(emb1, randomEmb));
  }
  process.exit();
}

checkDistance();
