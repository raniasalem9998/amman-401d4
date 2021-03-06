
const users = require('./users');
const superagent = require('superagent');


module.exports = async (req, res, next)=> {
    // 1 - get the code
    // 2- exchange code with token
    // 3- i have the token, exchange token with user
    // 4- save user to my db
    
    console.log("req.query ---> ",req.query);
    let code = req.query.code;
    console.log("code : ",code);

    let token = await exchangeCodeWithToken(code);
    console.log(" token ---> ",token)
    let user = await exchangeTokenWithUser(token);
    
    let [savedUser, serverToken] = await saveUser(user);

    req.user = savedUser; 
    req.token = serverToken;
    next();

};

const CLIENT_ID = '2637fcea3e8883245715';
const CLINET_SECRET = '586cae131b97ba02f8ece3c605195122ce77a417'

async function exchangeCodeWithToken(code) {
    const urlToGetToken = 'https://github.com/login/oauth/access_token';
    const response = await superagent.post(urlToGetToken).send({
        client_id: CLIENT_ID,
        client_secret: CLINET_SECRET,
        code: code,
        redirect_uri: 'http://localhost:3000/oauth'
    });
    console.log("exchangeCodeWithToken response ----> ",response.body);
    return response.body.access_token;
}

async function exchangeTokenWithUser(token) {
    let userResponse = await superagent
            .get('https://api.github.com/user')
            .set('Authorization', `token ${token}`)
            .set('User-Agent', 'user-agent/1.0')
    console.log("userResponse.body: ",userResponse.body)
    return userResponse.body;
}

async function saveUser(user) {
    console.log("user: ", user);
    let record = {
        username: user.login,
        password: 'XXXX'
    }
   
    let saveduser = await users.save(record);
    let myserverToken = users.generateToken(saveduser);
    return [saveduser, myserverToken];
}