const { ServerConfig  , Logger} = require('./config');

const express = require('express');
const app = express();
const apiRoutes = require('./routes');

app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.use('/api',apiRoutes);

app.listen(ServerConfig.PORT,()=>{
    console.log(`Server is running on port ${ServerConfig.PORT}`);
    Logger.info(`Server is running on port ${ServerConfig.PORT}`,{});/*ctrl+s to save and check the logs*/ 
})


/*
the flow is 
/api routes  -> /v1 routes - > /airplanes routes ->
 controllers -> services(business logic) -> 
 repositories(generally they only interact with the DBs) -> models
*/