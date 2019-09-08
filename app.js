const Express = require('express');
const bodyParser = require('body-parser');
const Mongoose = require('mongoose');
const request = require('request');
const nodemailer = require('nodemailer');

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
    comobile:String
});

const IssueModel = Mongoose.model("issues",{
    idate:String,
    itime:String,
    ireadings:Number,
    icomments:String,
    icarid:{type:Mongoose.Types.ObjectId,ref:'cars'},
    istaffid:{type:Mongoose.Types.ObjectId,ref:'users'}
});

const AssignModel = Mongoose.model("assigns",{
    astatus:{
        type:Number,
        default:null
    },
    cdate:String,
    acarid:{type:Mongoose.Types.ObjectId,ref:'cars'},
    astaffid:{type:Mongoose.Types.ObjectId,ref:'users'},
    aissueid:{type:Mongoose.Types.ObjectId,ref:'issues'}
});

var parray = [];

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
    var carregno = car.cregno;
    var carchasssisno = car.ccno;
    CarModel.findOne({$or:[{cregno:carregno},{ccno:carchasssisno}]},(error,data)=>{
        if(!data)
        {
            car.save((error,data)=>{
                if(error)
                {
                    throw error;
                    res.send(error);
                }
                else
                {
                    res.send(data);
                    console.log(data);
                }
            });
        }
        else
        {
            var mydata = null;
            res.send(mydata);
            console.log(mydata);
        }
    });
    
});

app.post('/vjasupdatecar',(req,res)=>{
    
    var carid = req.body._id;
    var ownername = req.body.coname;
    var owneremail = req.body.coemail;
    var ownermobile = req.body.comobile;

    var result = CarModel.updateOne({_id:carid},{$set:{coname:ownername,coemail:owneremail,comobile:ownermobile}},(error,data)=>{
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

app.post('/vjasinsertissue',(req,res)=>{
    var issue = new IssueModel(req.body);
    console.log(issue);

    var result = issue.save((error,data)=>{
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

app.get('/vjaspendingcar',(req,res)=>{

            IssueModel.aggregate([
                { $lookup:
                    {
                        from: "assigns", // collection to join
                        localField: "_id",//field from the input documents
                        foreignField: "aissueid",//field from the documents of the "from" collection
                        as: "assigns"// output array field
                    }
                },
                { $lookup:
                    {
                        from: "cars", // collection to join
                        localField: "icarid",//field from the input documents
                        foreignField: "_id",//field from the documents of the "from" collection
                        as: "cars"// output array field
                    }
                },
                {
                    $match:{assigns:[]}
                }
            ],(error,data)=>{
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

app.post('/vjasviewmechanictask',(req,res)=>{
    console.log(req.body);
    AssignModel.aggregate([
        { $lookup:
            {
                from: "issues", // collection to join
                localField: "aissueid",//field from the input documents
                foreignField: "_id",//field from the documents of the "from" collection
                as: "issues"// output array field
            }
            
        },
        { $lookup:
            {
                from: "cars", // collection to join
                localField: "acarid",//field from the input documents
                foreignField: "_id",//field from the documents of the "from" collection
                as: "cars"// output array field
            }
            
        },
        {
            $match:{astaffid:{$eq:Mongoose.Types.ObjectId(req.body.myuserid)},$or:[{astatus:{$eq:0}},{astatus:{$eq:1}}]}
        }
    ],(error,data)=>{
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

app.get('/vjasviewmechanic',(req,res)=>{
    UserModel.find({$and:[{urole:2},{jstatus:0}]},(error,data)=>{
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

app.post('/vjasviewcarassign',(req,res)=>{
    AssignModel.find({$and:[{acarid:req.body.acarid},{astatus:0}]},(error,data)=>{
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

app.post('/vjasinsertcarassign',(req,res)=>{
    var assign = new AssignModel(req.body);
    console.log(assign);
    console.log(req.body);
    assign.save((error,data)=>{
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

app.post('/vjasupdatejstatus',(req,res)=>{
    UserModel.updateOne({_id:req.body.astaffid},{$set:{jstatus:1}},(error,data)=>{
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

app.post('/vjasupdateastatus',(req,res)=>{
    AssignModel.updateOne({_id:req.body.aid},{$set:{astatus:req.body.astatus}},(error,data)=>{
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

app.post('/vjasrevokejstatus',(req,res)=>{
    UserModel.updateOne({_id:req.body.astaffid},{$set:{jstatus:0}},(error,data)=>{
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

app.post('/vjascownersendemail', (req, res) => {
    let user = req.body;
    sendMail(user, info => {
      console.log('The mail has been send...');
      res.send(info);
    });
  });

  async function sendMail(user, callback) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "guser7283@gmail.com",
        pass: "Neywll@123"
      }
    });
  
    let mailOptions = {
      from: '"VJAS-Car Service"<vjas@gmail.com>', // sender address
      to: user.coemail, // list of receivers
      subject: "Car Service Completed", // Subject line
      html: `<h1>Hi ${user.coname}</h1><br>
      <h4>Your vehicle service has been completed. Please come for pickup by 5:00pm</h4>`
    };
  
    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions);
  
    callback(info);
  }

app.listen(process.env.PORT || 5566,()=>{
    console.log("Server Running on PORT:5566...");
});