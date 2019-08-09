const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require("body-parser");
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const selectAll = 'SELECT * FROM courseware_studentmodule';
const user_name_withGrade = 'SELECT student_id , module_id as moduleName,count(grade) as marks, email ,username from edxapp.courseware_studentmodule,edxapp.auth_user where grade = 1 && edxapp.auth_user.id = courseware_studentmodule.student_id group by student_id, username;'
const allUsers = 'select username, email from edxapp.auth_user';


// const insertData = "INSERT INTO edxapp.auth_user (password,last_login,is_superuser,username,email,is_staff,is_active,date_joined) VALUES %L returning *"
// const insertDataArray=[];

// insertDataArray.push([password,last_login,is_superuser,username,email,is_staff,is_active,date_joined]);

// creating connection
const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database: 'edxapp'
});

// checking for connection
connection.connect(err=>{
    if(err){
        console.log("connection error");
        return err
    }
});
// getting response for connection
console.log(connection);

//insert data to the table
app.post('/insertUserData',(req,res)=>{    
    console.log("req body",req.body);   
    var d2= req.body;
    letLocalArray = [];
    // letLocalArray.push(slice);
    console.log("kush",d2);
})


// default to get all the data 
app.get('/',(req,res)=>{
    connection.query(selectAll,(err,result)=>{
if(err){
    return res.send(err);
}
else{
    return res.json({
        result
    });
}
    });
});

// get all user data
app.get('/allUsers',(req,res)=>{
    connection.query(allUsers,(err,result)=>{
if(err){
    return res.send(err);
}
else{
    return res.json({
        result
    });
}
    });
});

// get user grade with name , email 
app.get('/user_name_withGrade',(req,res)=>{
    connection.query(user_name_withGrade,(err,result)=>{
if(err){
    return res.send("error in fetching data",err);
}
else{
    const userDataArray=[];
    result.map((data)=>{
        const userData ={
            moduleName :  (data.moduleName.split(':'))[1].split('+type')[0],            
            username : data.username.toUpperCase(),
            email : data.email.toUpperCase(),
            marks: data.marks
        }        
        userDataArray.push(userData);
    })
    console.log(userDataArray);
    return res.json({        
        userDataArray
    });
}
    });
});



app.listen(4000,()=>{

    console.log("Server is Running at port 4000")
})