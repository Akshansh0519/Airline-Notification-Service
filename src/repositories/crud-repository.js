const { Logger } = require("../config");

class CrudRepository {
    constructor(model) {
        this.model = model;
    }

    async create(data){
        try{
            const response = await this.model.create(data);
            return response;
        }   
        catch (error){
            Logger.error('Error in Crud Repository create method', {error});
            throw error;
        }
    }

    async destroy(data){
        try{
            const response = await this.model.destroy({
                where : {
                    id : data.id
                }
            });
            return response;
        }   
        catch (error){
            Logger.error('Error in Crud Repository create method', {error});
            throw error;
        }
    }

    async get(data){
        try{
            const response = await this.model.findByPk(data.id);
            return response;
        }   
        catch (error){
            Logger.error('Error in Crud Repository create method', {error});
            throw error;
        }
    }

    async getAll(data){
        try{
            const response = await this.model.findAll();
            return response;
        }   
        catch (error){
            Logger.error('Error in Crud Repository create method', {error});
            throw error;
        }
    }

    async update(id,model){
        try{
            const response = await this.model.update(model,{
                where : {
                    id: id
                }
            })
            return response;
        }
        catch(error){
            Logger.error('Error in Crud Repository create method', {error});
            throw error;
        }
    }
}

module.exports = CrudRepository;