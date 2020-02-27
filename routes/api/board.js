var express = require('express');
var router = express.Router();
var mysql_odbc = require('../../db/db_conn')();
var conn = mysql_odbc.init();

function validate (req, res, next , keys) {
    let isValidated = true;
    
    for(let key of keys)
    {
        let val = req.body[key];
        if(!val){
            isValidated = false;
            // 없는 경우
            res.json({
                status : 'fail',
                mesg : '\''+key+'\'가 존재하지 않습니다'
            });
            break;
        }
        else{
            if(key === 'title'){
                if(val.length >= 100){
                    isValidated = false;
                    res.json({
                        status : 'fail',
                        mesg : '\''+key+'\'는 100자가 넘을 수 없습니다'
                    });
                    break;
                }
                else if(val.length <= 0){
                    isValidated = false;
                    res.json({
                        status : 'fail',
                        mesg : '\''+key+'\'는 공백일 수 없습니다'
                    });
                    break;
                }
            }
            else if(key === 'content'){
                if(val.length >= 1000){
                    isValidated = false;
                    
                    res.json({
                        status : 'fail',
                        mesg : '\''+key+'\'는 1000자가 넘을 수 없습니다'
                    });
                    break;
                }
                else if(val.length <= 0){
                    isValidated = false;
                    
                    res.json({
                        status : 'fail',
                        mesg : '\''+key+'\'는 공백일 수 없습니다'
                    });
                    break;
                }
            }
            else if(key === 'passwd'){
                if(val.length >= 10){
                    isValidated = false;
                    res.json({
                        status : 'fail',
                        mesg : '\''+key+'\'는 10자가 넘을 수 없습니다'
                    });
                    break;
                }
                else if(val.length <= 0){
                    isValidated = false;
                    res.json({
                        status : 'fail',
                        mesg : '\''+key+'\'는 공백일 수 없습니다'
                    });
                    break;
                }
                else if(isNaN(val)){
                    isValidated = false;
                    res.json({
                        status : 'fail',
                        mesg : '\''+key+'\'는 숫자여야합니다.'
                    });
                    break;
                }
            }
        }
    };

    if(isValidated){
        next();
    }
}

// router.use(validate);

// GET : api/board/
// 전체 목록 가져오기
router.get('/'  ,  (req,res,next)=>{
    // 모든 글을 json 형태로 반환
    // 글 내용은 보여주지 않음 
    
    var page = req.params.page;
    var sql = "select idx, name, title, date_format(modidate,'%Y-%m-%d %H:%i:%s') modidate, " +
        "date_format(regdate,'%Y-%m-%d %H:%i:%s') regdate from board";
    conn.query(sql, function (err, rows) {
        if (err) console.error("err : " + err);
        // res.render('list', {title: '게시판 리스트', rows: rows});
        res.json(rows);
    });
});

// POST : api/board
// 글 새로 쓰기
router.post("/" , (req,res,next)=>{
    validate(req,res,next,['name' , 'title' , 'content' , 'passwd']);
} , (req,res,next)=>{
    console.log('validated!');
    // 글을 새로 등록
    var name = req.body.name;
    var title = req.body.title;
    var content = req.body.content;
    var passwd = req.body.passwd;
    var datas = [name,title,content,passwd];
    
    var sql = "insert into board(name, title, content, regdate, modidate, passwd,hit) values(?,?,?,now(),now(),?,0)";
    conn.query(sql,datas, function (err, result) {
        // 성공했을 경우 
        if(result.affectedRows > 0 ){
            res.json({
                statusCode : result.affectedRows,
                status : "성공했습니다."
            });
        }
        else{
            res.json({
                statusCode : result.affectedRows,
                status : "실패했습니다."
            });
        }
    });
});

// GET : api/board/3
// 특정 글만 가져오기
router.get('/:idx', function(req, res, next) {
    // 특정 글만 검색해서 json으로 반환
    var hit = req.body.hit;
    var idx = req.params.idx;
    var sql = "select idx, name, title, content, date_format(modidate,'%Y-%m-%d %H:%i:%s') modidate, " +
        "date_format(regdate,'%Y-%m-%d %H:%i:%s') regdate,hit from board where idx=?";
    conn.query(sql,[idx], function(err,row){
        if(err) console.error(err);
        else{
        "UPDATE board SET hit = hit + 1 WHERE idx = ?";
        res.json(row);}
    });
});

// PUT : api/board/:id
// 이미 있는 글을 수정 
router.put("/:page" ,(req,res,next)=>{
    validate(req,res,next,['name' , 'title' , 'content' , 'passwd']);
} , (req,res,next)=>{
    var name = req.body.name;
    var title = req.body.title;
    var content = req.body.content;
    var passwd = req.body.passwd;
    
    var datas = [name,title,content,req.params.page,passwd];
    
    var sql = "update board set name=? , title=?,content=?, modidate=now() where idx=? and passwd=?";
    
    // if (passwd != ){
    //     res.json({
    //         status : "비밀번호가 틀렸습니다!"
    //     });
    //     return;
    // }
    conn.query(sql,datas,function(err,result){
        // 에러가 생긴 경우
        if (err){
            res.json({
                statusCode : -1,
                status : "fail",
                err : err
            });
        }
        
           

        // 성공했을 경우 
        if(result.affectedRows > 0 ){
            res.json({
                statusCode : result.affectedRows,
                status : "성공했습니다."
            });
        }
        else{
            res.json({
                statusCode : result.affectedRows,
                status : "실패했습니다."
            });
        }
    });

});

// DELETE : api/board/:id
// 이미 있는 글을 삭제 
router.delete("/:page" ,(req,res,next)=>{
    validate(req,res,next,['passwd']);
} , (req,res,next)=>{
    // var idx = req.params.idx;
    var passwd = req.body.passwd;
    var page = req.params.page;
    var datas = [page,passwd];
    var sql = "delete from board where idx=? and passwd=?";
    conn.query(sql,datas,function(err,result){
        // 에러가 생긴 경우
        if (err){
            res.json({
                statusCode : -1,
                status : "fail",
                err : err
            });
        }

        // 성공했을 경우 
        if(result.affectedRows > 0 ){
            res.json({
                statusCode : result.affectedRows,
                status : "성공했습니다."
            });
            
        }
        else{
            console.log(sql , page , passwd);
            res.json({
                statusCode : result.affectedRows,
                status : "실패했습니다."
            });
        }
    });
});


module.exports = router;
