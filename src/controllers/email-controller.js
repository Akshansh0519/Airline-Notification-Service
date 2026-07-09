const  { EmailService }  = require('../services');
const { StatusCodes } = require('http-status-codes');
/*
    POST : /tickets
    req-body {subject:'Ticket Subject', content:'Ticket Content', recepientEmail:'recipient@example.com'}
*/
async function create(req,res){
    try{
        const ticket = await EmailService.createTicket({
            subject : req.body.subject,
            content : req.body.content,
            recepientEmail : req.body.recepientEmail
        });
        return res.status(StatusCodes.CREATED).json({   
            success: true,
            data: ticket, 
            message: 'Successfully created a ticket',
            error: {}
        });
    }
    catch(error){
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            data: {},
            message: 'Something went wrong while creating a ticket',
            error: error 
        });
    }
}

module.exports = {
    create
}