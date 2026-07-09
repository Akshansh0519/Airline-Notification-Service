const  { AirplaneService }  = require('../services');
const { StatusCodes } = require('http-status-codes');
/*
    POST : /airplanes
    req-body {modelNumber:'airbus-320', capacity:200}
*/
async function createAirplane(req,res){
    try{
        const airplane = await AirplaneService.createAirplane({
            modelNumber : req.body.modelNumber, 
            capacity : req.body.capacity
        });
        return res.status(StatusCodes.CREATED).json({   
            success: true,
            data: airplane, 
            message: 'Successfully created an airplane',
            error: {}
        });
    }
    catch(error){
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            data: {},
            message: 'Something went wrong while creating an airplane',
            error: error 
        });
    }
}

module.exports = {
    createAirplane
}