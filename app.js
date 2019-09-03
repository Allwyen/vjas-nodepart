const Express = require('express');
const bodyParser = require('body-parser');
const Mongoose = require('mongoose');
const request = require('request');

var app = new Express();

app.use(Express.static(__dirname+"/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200' );

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//Mongoose.connect("mongodb://localhost:27017/VJAS");
Mongoose.connect("mongodb+srv://mongodb:mongodb@mycluster-ucvz5.mongodb.net/VJAS?retryWrites=true&w=majority");

const UserModel = Mongoose.model("users",{
    fname:String,
    uemail:String,
    uaddress:String,
    umobile:String,
    uname:String,
    upass:String,
    urole:{
        type:Number,
        default:null
    },
    jstatus:{
        type:Number,
        default:0
    }
});

const CarModel = Mongoose.model("cars",{
    cregno:String,
    cmodel:String,
    ccno:String,
    coname:String,
    coemail:String,
    comobile:String,
    cissue:[{
        cissuename:
        { 
            type:Array, 
            "default":[] 
        },
        cissuedate:Date,
        staffid:{type:Mongoose.Types.ObjectId,ref:'users'}
    }]
});

app.post('/vjasregister',(req,res)=>{

    var user = new UserModel(req.body);
    var useremail = user.uemail;

    UserModel.findOne({uemail:useremail},(error,data)=>{
        if(!data)
        {
            user.save((error,data)=>{
                if(error)
                {
                    throw error;
                    res.send(error);
                }
                else
                {
                    res.json("User Registered Successfully!!");
                }
            });
        }
        else
        {
            if(useremail == data.uemail)
            {
                console.log('Email already exists');
                res.json("Email already Exists!!");
            }
        }
    });

});

app.post('/vjasforgotpwd',(req,res)=>{

    var user = new UserModel(req.body);
    var useremail = user.uemail;
    var userpwd = user.upass;

    UserModel.findOne({uemail:useremail},(error,data)=>{
        if(!data)
        {
            res.json("Cannot find Email ID !!");
        }
        else
        {
            UserModel.updateOne({uemail:useremail},{$set:{upass:userpwd}},(error,data)=>{
                if(error)
                {
                    throw error;
                    res.send(error);
                }
                else
                {
                    console.log(data);
                    res.json("Password Updated Successfully!!");
                }
            });
        }
    });

});

app.get('/login',(req,res)=>{
    var x = req.query.uemail;
    var y = req.query.upass;

    var result = UserModel.find({$and:[{uemail:x},{upass:y}]},(error,data)=>{
        if(error)
        {
            throw error;
            res.send(error);
        }
        else
        {
            res.send(data);
        }
    });

});

const APIurl1 = "http://localhost:5566/login";

app.post('/vjaslogin',(req,res)=>{
    var item1 = req.body.uemail;
    var item2 = req.body.upass;

  request(APIurl1+"/?uemail="+item1+"&&upass="+item2,(error,response,body)=>{
    var data = JSON.parse(body);
    res.send(data);
  });
});

app.get('/vjasviewuser',(req,res)=>{
    UserModel.find({urole:{$ne:3}},(error,data)=>{
        if(error)
        {
            throw error;
            res.send(error);
        }
        else
        {
            res.send(data);
        }
    });
});

app.post('/vjasuserstatus',(req,res)=>{

    var userid = req.body.eid;
    var userrole = req.body.uroleset;
    var result = UserModel.updateOne({_id:userid},{$set:{urole:userrole}},(error,data)=>{
        if(error)
        {
            throw error;
            res.send(error);
        }
        else
        {
            res.json("Userrole Updated Successfully!!");
        }
    });
});

app.post('/vjasviewcar',(req,res)=>{
    var car = new CarModel(req.body);
    console.log(req.body);
    var regno = car.cregno;
    CarModel.findOne({cregno:regno},(error,data)=>{
        if(error)
        {
            throw error;
            res.send(error);
        }
        else
        {
            res.send(data);
        }
    });
});

app.post('/vjasinsertcar',(req,res)=>{
    var car = new CarModel(req.body);
    car.save((error,data)=>{
        if(error)
        {
            throw error;
            res.send(error);
        }
        else
        {
            res.json("Car Details Registered!!");
        }
    });
});

app.listen(process.env.PORT || 5566,()=>{
    console.log("Server Running on PORT:5566...");
});