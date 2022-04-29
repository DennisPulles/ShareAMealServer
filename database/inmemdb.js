const _userdb = []
let id = 0

module.exports = {

    createUser(user, callback){
        console.log('createUser called')
        if (user && user.email && _userdb.filter((item) => item.email === user.email).length > 0){
            const error = 'A user with this email already exists.'
            console.log(error)
            callback(error, undefined)
        } else {
            const userToAdd = {
                id: id++,
                ...user,
            }
            _userdb.push(userToAdd)
            callback(undefined, userToAdd)
        }
    }

    
}