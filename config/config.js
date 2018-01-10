module.exports = {
    port : 4000,
    database : "mongodb://root:abc123@ds159776.mlab.com:59776/expense_manager",
    secretKey : "Secret",

    facebook:{
        clientID        : process.env.FACEBOOK_ID || '315654992265549',
        clientSecret    : process.env.FACEBOOK_SECRET || '332a70053b41adb89a46a0269d851e37',
        profileFields   : ['emails','displayName'],
        callbackURL     : '/auth/facebook/callback'
    },

    google: {
        clientID        : "19681958519-j3efc8nrefc8v6sp4dt69usd3atinb4p.apps.googleusercontent.com",
        clientSecret    : "ht4jYHmwu1FRxfm1A0ApSLa6",
        callbackURL     : '/auth/google/callback'
    },

    mailing :{
        from : "<from>",
        password : "<password>"
    }
}