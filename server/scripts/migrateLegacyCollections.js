'use strict';
require('dotenv').config();
const mongoose=require('mongoose');
const {MONGO_URI}=require('../src/config/env');
const News=require('../src/models/News'); const NewsLike=require('../src/models/NewsLike'); const Comment=require('../src/models/Comment'); const Report=require('../src/models/Report'); const User=require('../src/models/User');
async function run(){
  await mongoose.connect(MONGO_URI); let migratedNews=0,likes=0,comments=0,reports=0;
  const cursor=News.find({$or:[{likes:{$exists:true,$not:{$size:0}}},{comments:{$exists:true,$not:{$size:0}}},{reports:{$exists:true,$not:{$size:0}}}]}).select('+likes +comments +reports submittedBy').cursor();
  for await(const news of cursor){
    const likeOps=(news.likes||[]).filter(Boolean).map(user=>({updateOne:{filter:{news:news._id,user},update:{$setOnInsert:{news:news._id,user}},upsert:true}}));
    const commentOps=(news.comments||[]).filter(c=>c?.user&&c?.text).map(c=>({updateOne:{filter:{news:news._id,user:c.user,text:c.text},update:{$setOnInsert:{news:news._id,user:c.user,text:String(c.text).slice(0,1000),createdAt:c.createdAt||news.createdAt}},upsert:true}}));
    const reportOps=(news.reports||[]).filter(r=>r?.user).map(r=>({updateOne:{filter:{news:news._id,reportedBy:r.user},update:{$setOnInsert:{news:news._id,reportedBy:r.user,reason:String(r.reason||'Inappropriate content').slice(0,500),createdAt:r.createdAt||news.createdAt}},upsert:true}}));
    if(likeOps.length)likes+=(await NewsLike.bulkWrite(likeOps,{ordered:false})).upsertedCount||0;
    if(commentOps.length)comments+=(await Comment.bulkWrite(commentOps,{ordered:false})).upsertedCount||0;
    if(reportOps.length)reports+=(await Report.bulkWrite(reportOps,{ordered:false})).upsertedCount||0;
    migratedNews++;
  }
  await User.updateMany({},{$set:{storiesCount:0,likesReceived:0}});
  const stories=await News.aggregate([{$match:{status:'published',deletedAt:null,submittedBy:{$ne:null}}},{$group:{_id:'$submittedBy',count:{$sum:1}}}]);
  if(stories.length) await User.bulkWrite(stories.map(x=>({updateOne:{filter:{_id:x._id},update:{$set:{storiesCount:x.count}}}})),{ordered:false});
  const likeAgg=await NewsLike.aggregate([{$lookup:{from:'news',localField:'news',foreignField:'_id',as:'news'}},{$unwind:'$news'},{$match:{'news.status':'published'}},{$match:{$expr:{$ne:['$news.submittedBy','$user']}}},{$group:{_id:'$news.submittedBy',count:{$sum:1}}}]);
  if(likeAgg.length) await User.bulkWrite(likeAgg.map(x=>({updateOne:{filter:{_id:x._id},update:{$set:{likesReceived:x.count}}}})),{ordered:false});
  await mongoose.disconnect(); console.log(JSON.stringify({migratedNews,likes,comments,reports},null,2));
}
run().catch(async e=>{console.error(e);await mongoose.disconnect().catch(()=>{});process.exit(1)});
