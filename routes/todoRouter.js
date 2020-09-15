var express = require('express')
var mysql = require('mysql')
var todoRouter = express.Router()

var db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '9425815951',
  database: 'todo_db',
  insecureAuth: true
})

db.connect(err => {
  if (err) throw err
  console.log('Connection successful')
})

//http://localhost:3000/todo
todoRouter
  .route('/')
  .get((req, res) => {
    db.query('select * from user_' + req.query.userid + ';', (err, results) => {
      if (err) throw err
      console.log('Fetching data from todo_db')
      res
        .status(200)
        .send({ err: false, data: results, message: 'Database results' })
    })
  })
  .post((req, res) => {
    db.query(
      'insert into user_' +
        req.body.userid +
        " (title, body, time_rem) values ('" +
        req.body.title +
        "','" +
        req.body.body +
        "','" +
        req.body.time_rem +
        "');",
      (err, results) => {
        if (err) throw err
        else {
          res.status(200).send({
            err: false,
            data: results,
            message: 'Inserted into the table successfully'
          })
          console.log('Inserted into the table successfully')
        }
      }
    )
  })
  .put((req, res) => {
    db.query(
      'update user_' +
        req.body.userid +
        " set title='" +
        req.body.title +
        "', body='" +
        req.body.body +
        "', time_rem = " +
        req.body.time_rem +
        ', status = ' +
        req.body.status +
        ' where assign_id	=	' +
        req.body.assign_id +
        ';',
      (err, results) => {
        if (err) throw err
        else {
          res.status(200).send({
            err: false,
            data: results,
            message: 'Updated the table successfully'
          })
          console.log('Updated the table successfully')
        }
      }
    )
  })
  .delete((req, res) => {
    db.query(
      'delete from user_' +
        req.query.userid +
        ' where assign_id	=	' +
        req.query.assign_id +
        ';',
      (err, results) => {
        if (err) throw err
        else {
          res.status(200).send({
            err: false,
            data: results,
            message: 'Delete from the table successfully'
          })
          console.log('Delete from the table successfully')
        }
      }
    )
  })
//This is the stupidest code Ive ever written
//http://localhost:3000/todo/org
todoRouter
  .route('/org')
  .get((req, res) => {
    if (req.query.isadmin == 0) {
      res.status(400).send({ message: 'Request Denied' })
    } else {
      //Select all the tables from all the users in the organisation
      /*
delimiter $$
create procedure get_details (IN org_mem varchar(20))
Begin
declare done int default 0;

declare tbl_nm varchar(20);
declare fname varchar(20);
declare lname varchar(20);
declare uid int;

declare curs cursor for select table_name,firstname,lastname,userid from user_table where member_of_org=org_mem;
declare continue handler for not found set done = 1;

open curs;
repeat fetch curs into tbl_nm,fname,lname,uid;
if done=0 then
select uid,fname,lname;
set @sql_stmt = concat('select * from ',tbl_nm,';');
prepare stmt1 from @sql_stmt;
execute stmt1;
deallocate prepare stmt1;
end if;
until done end repeat;
close curs;

End $$
delimiter ;
		*/
      db.query(
        "call get_details('" + req.query.member_of_org + "');",
        (err, results) => {
          if (err) throw err
          res.status(200).send({
            err: false,
            data: results,
            message: 'Organisation DB Results'
          })
        }
      )
    }
  })
  .put((req, res) => {
    if (req.body.isadmin == 0) {
      res.status(400).send({ message: 'Request Denied' })
    } else {
      //Update request for a given user
      db.query(
        'update user_' +
          req.body.userid +
          " set title='" +
          req.body.title +
          "', body='" +
          req.body.body +
          "', time_rem = " +
          req.body.time_rem +
          ', status = ' +
          req.body.status +
          ' where assign_id	=	' +
          req.body.assign_id +
          ';',
        (err, results) => {
          if (err) throw err
          res.status(200).send({
            err: false,
            data: results,
            message: 'Updated Member Assignment'
          })
        }
      )
    }
  })
  .post((req, res) => {
    if (req.body.isadmin == 0) {
      res.status(400).send({ message: 'Request Denied' })
    } else {
      //Create a new task for a member of an organisation
      db.query(
        'insert into user_' +
          req.body.userid +
          " (title, body, time_rem) values ('" +
          req.body.title +
          "','" +
          req.body.body +
          "','" +
          req.body.time_rem +
          "');",
        (err, results) => {
          if (err) throw err
          res.status(200).send({
            err: false,
            data: results,
            message: 'Created New Assignment For Member'
          })
        }
      )
    }
  })
  .delete((req, res) => {
    if (req.body.isadmin == 0) {
      res.status(400).send({ message: 'Request Denied' })
    } else {
      //Delete the task for a given user
      db.query(
        'delete from user_' +
          req.query.userid +
          ' where assign_id=' +
          req.query.assign_id +
          ';',
        (err, results) => {
          if (err) throw err
          res.status(200).send({
            err: false,
            data: results,
            message: 'Deleted the Assignment'
          })
        }
      )
    }
  })

module.exports = todoRouter
