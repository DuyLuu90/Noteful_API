const {API_TOKEN}= require('../config')
const logger= require('../logger')

function requireAuth(req,res,next) {
    const userAuth= req.get('Authorization')
    if(!userAuth || userAuth.split(' ')[1] !== API_TOKEN) {
        logger.error(`Unauthorized request to path: ${req.path}`)
        return res.status(401).json({error: "Unauthorized request"})}
    next();
}

module.exports = {requireAuth}