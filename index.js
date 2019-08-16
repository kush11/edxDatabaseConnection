const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require("body-parser");
const app = express();
const today = new Date();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const selectAll = 'SELECT * FROM courseware_studentmodule';

const user_name_with_Grade = 'SELECT module_id as moduleName,count(grade) as marks, email ,username from edxapp.courseware_studentmodule,edxapp.auth_user where grade = 1 && edxapp.auth_user.id = courseware_studentmodule.student_id group by username;'

const user_name_with_Grade_and_CodeScore = 'SELECT module_id as moduleName,count(grade) as marks,student_code_grade, email ,username from edxapp.courseware_studentmodule,edxapp.auth_user,edxapp.courseware_studentmodule_code where grade = 1 && edxapp.auth_user.id = courseware_studentmodule.student_id && edxapp.auth_user.id = edxapp.courseware_studentmodule_code.student_id group by username;'

const allUsers = 'select username, email from edxapp.auth_user';

const getUserId = `SELECT id from edxapp.auth_user WHERE userName = ?;`;
const postUserCodeOutput = `Update edxapp.courseware_studentmodule_code,edxapp.auth_user set edxapp.courseware_studentmodule_code.student_id = ?,edxapp.courseware_studentmodule_code.student_code_module_id = ?,edxapp.courseware_studentmodule_code.student_code_language = ?,edxapp.courseware_studentmodule_code.student_code = ?,edxapp.courseware_studentmodule_code.student_code_output = ?,edxapp.courseware_studentmodule_code.student_code_test_cases_passed = ?,edxapp.courseware_studentmodule_code.code_total_test_cases = ?,edxapp.courseware_studentmodule_code.student_code_max_grade = 5 * ?,edxapp.courseware_studentmodule_code.student_code_grade = 5 * ? WHERE edxapp.courseware_studentmodule_code.student_name = ? && edxapp.auth_user.userName = ?;`

const insertUserCodeOutput = `INSERT INTO edxapp.courseware_studentmodule_code (student_id,student_code_module_id,student_code_language,student_code,student_code_output,
student_code_test_cases_passed,code_total_test_cases,student_code_max_grade,student_code_grade) 
VALUES (?,?,?,?,?,?,?,5*?,5*?)`

const insertUsers = `INSERT INTO edxapp.auth_user (password,last_login,is_superuser,username,email,is_staff,is_active,date_joined) VALUES (?,?,?,?,?,?,?,?)`


// const insertData = "INSERT INTO edxapp.auth_user (password,last_login,is_superuser,username,email,is_staff,is_active,date_joined) VALUES %L returning *"
// const insertDataArray=[];

// insertDataArray.push([password,last_login,is_superuser,username,email,is_staff,is_active,date_joined]);

// creating connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'edxapp'
});

// checking for connection
connection.connect(err => {
    if (err) {
        console.log("connection error");
        return err
    }
});
// getting response for connection
console.log(connection);

//insert data to the table
app.post('/insertUserData', (req, res) => {
    var users = req.body;
    for (var i = 1; i < users.length; i++) {
        let user = [];
        user = users[i];
        connection.query(insertUsers, ['pbkdf2_sha256$36000$cNeRLNb60DGR$X/q14LslEgPooqjS1oGXyUIY1yHhbWlutbieWvy9BLc=', today, 0, user[1], user[2], 0, 1, today], (err, result) => {
            if (err) {
                return res.send(err);
            }
            else {
                return res.json({
                    result
                });
            }
        });
    }
})

app.post('/postUserCodeOutput', (req, res) => {
    let userId = null;
    const body = req.body;
    const userName = 'edx' //req.body.userName;
    const userCodeModule = 'edx' //req.body.moduleId;
    const userCodeLanguage = 'edx' //req.body.language;
    const userCode = 'edx' //req.body.code;
    const userCodeOutput = 'edx' //req.body.output;
    const userCodePassedTestCases = 1//req.body.passedTestCases;
    const codeTestCases = 3//req.body.testCases;
    connection.query(getUserId, [userName], (err, result) => {
        if (err) {
            return res.send(err);
        } else {
            userId = result[0].id;
            connection.query(insertUserCodeOutput, [userId, userCodeModule, userCodeLanguage, userCode, userCodeOutput, userCodePassedTestCases, codeTestCases, codeTestCases, userCodePassedTestCases, userName, userName], (err, result) => {
                if (err) {
                    return res.send(err);
                }
                else {
                    return res.json({
                        result
                    });
                }
            });
        }
    });
})


// default to get all the data 
app.get('/', (req, res) => {
    connection.query(selectAll, (err, result) => {
        if (err) {
            return res.send(err);
        }
        else {
            return res.json({
                result
            });
        }
    });
});

// get all user data
app.get('/allUsers', (req, res) => {
    connection.query(allUsers, (err, result) => {
        if (err) {
            return res.send(err);
        }
        else {
            return res.json({
                result
            });
        }
    });
});

// get user grade with name , email 
app.get('/user_name_withGrade', (req, res) => {
    const userDataArray = [];
    connection.query(user_name_with_Grade, (err, result) => {
        if (err) {
            return res.send("error in fetching data", err);
        }
        else {
            result.map((data) => {
                var userData = {
                    moduleName: (data.moduleName.split(':'))[1].split('+type')[0],
                    username: data.username.toUpperCase(),
                    email: data.email.toUpperCase(),
                    marks: data.marks,
                    codeScore: 0
                }
                userDataArray.push(userData);
            })
            connection.query(user_name_with_Grade_and_CodeScore, (err, result) => {
                if (err) {
                    return res.send("error in fetching data", err);
                }
                else {
                    result.map((data) => {
                        var found = 0;
                        var userData = {
                            moduleName: (data.moduleName.split(':'))[1].split('+type')[0],
                            username: data.username.toUpperCase(),
                            email: data.email.toUpperCase(),
                            marks: data.marks,
                            codeScore: data.student_code_grade
                        }
                        userDataArray.filter(function (user) {
                            if (user.username == data.username.toUpperCase()) {
                                user.codeScore = data.student_code_grade;
                                found = 1;
                            }
                        })
                        if (!found) {
                            userDataArray.push(userData);
                        }
                    })
                }
                return res.json({
                    userDataArray
                });
            });
        }
    });
});



app.listen(4000, () => {

    console.log("Server is Running at port 4000")
})