var express = require('express');
var router = express.Router();
var mysql_odbc = require('../../db/db_conn')();
var conn = mysql_odbc.init();
/*
CREATE TABLE `user` (
  `uid` bigint(20) NOT NULL AUTO_INCREMENT,
  `uname` varchar(50) NOT NULL,
  `umail` varchar(50) NOT NULL,
  `upasswd` varchar(100) NOT NULL, 
  `regdate` datetime NOT NULL,
  `modidate` datetime NOT NULL,
  PRIMARY KEY (`uid`)
);
*/

//회원가입
//POST : api/user/join
router.post("/join", function(req,res,next){
    var uname = req.body.uname;
    var umail = req.body.umail;
    var upasswd = req.body.upasswd;

    var datas = [uname,umail,upasswd];
    var sql = "insert into user(uname, umail, upasswd, regdate, modidate) values(?,?,?,now(),now())";

    //비밀번호 유효성 검사 - 영어 대소문자,숫자,특수문자 10자 이상

    // 정규식 정의해서 변수로 갖고있고,
    // 정규식.test(비밀번호)

    //var valid_upasswd = upasswd.search()
    var chk_num = upasswd.search(/[0-9]/);
    var chk_englow = upasswd.search(/[a-zA-Z]/);
    var chk_engupp = upasswd.search(/[A-Z]/);
    var chk_pat = upasswd.search(/[~!@#$%^&*()_+]/);
    // if(chk_num < 0 || chk_eng < 0 || chk_pat < 0){
    //     res.json({
    //         msg:'비밀번호는 숫자와 영문자를 혼용해야한다'
    //     });
    //     return;
    // }
    if (chk_num <0||chk_englow<0||chk_engupp <0 || chk_pat<0 || upasswd.length<10){
        if(chk_num <0){
            res.json({
                msg : "숫자를 넣어주세요"
            });
            return;
        }
        else if(chk_englow <0){
            res.json({
                msg : "영어소문자를 넣어주세요"
            });
            return;
        }
        else if(chk_engupp<0){
            res.json({
                msg:"영어대문자를 넣어주세요"
            });
        }
        else if(chk_pat <0){
            res.json({
                msg : "특수문자를 넣어주세요"
            });
            return;
        }
        else if(upasswd.length < 10){
            res.json({
                msg : "비밀번호는 10자 이상입니다."
            });
            return;
        }
    return;
}
  
    //아이디 유효성 검사 - 중복 아이디 검사
    var idValidSql = "select count(*) as cnt from user where uname = ?"
    
    conn.query(idValidSql , [uname] , (validErr,validResult)=>{
        // 에러가 없음
        // 결과도 정상인 경우 
        // 삭제시에도
        if(validErr){
            // res.json()
            return;
        }

        if(validResult[0].cnt > 0){
            // 중복인 경우 
            res.json({
                status : "아이디 중복-fail"

            });
            return;
        }

        conn.query(sql,datas,function(err,result){
            //에러가 난 경우
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

})

//로그인 
//POST : api/user/login
router.post("/login", function(req,res,next){
    var umail = req.body.umail;
    var upasswd = req.body.upasswd;
    var datas = [umail,upasswd];
    var sql = "select * from user where umail= ? and upasswd = ? ";
    var emailValid = 'select * from user where email=?';
    conn.query(emailValid, [umail],function(err,result){
        if(result.length <= 0){
            res.send({
                status: "존재하지 않는 아이디 - fail"
            });
        }
        conn.query(sql, datas, function(err,result){
            //에러 발생
            if (err){
                res.json({
                    statusCode : -1,
                    status : "fail",
                    err : err
                });
            }
            //존재하지 않는 회원정보
            
        
            //로그인 실패
            if(result.length === 0){
                res.json({
                    status : "login fail"
                });
            }
        

            //로그인 성공!
            else{
                res.json({
                    status : "login success"
                });
            }
        });
    });
})

//회원 정보 수정 (비밀번호 수정)
//PUT : /user/mypage/:uid
router.put("/mypage/:uid",function(req,res,next){
    var uid = req.params.uid;
    var uname = req.body.uname;
    var umail = req.body.umail;
    var upasswd = req.body.upasswd;
    var prevUpasswd = req.body.upasswd;

    var datas = [upasswd,uid];
    var sql = "update user set upasswd=? ,modidate = now() where uid=? and upasswd = ?";

    conn.query(sql,datas,function(err,result){
        if(err){
            res.json({
                statusCode : -1,
                status : "fail",
                err : err
            });
        }
        //성공시
        if(result.affectedRows > 0){
            res.json({
                statusCode : result.affectedRows,
                status : "성공"
            })
        }
        //실패시
        else{
            res.json({
                statusCode : result.affectedRows,
                status : "실패!"
            })
        }
    });
});

//회원탈퇴 - 비밀번호가 일치할시 탈퇴
//DELETE : api/user/withdrawal/:uid
router.delete("/withdrawal/:uid" ,function(req,res,next){
    var uid = req.params.uid;
    var umail = req.body.umail;
    var upasswd = req.body.upasswd;
    var datas = [uid,umail,upasswd]; 
    var sql = "delete from user where uid =? and umail = ? and upasswd =?"
    
    conn.query(sql,datas, function(err,result){
        if(err){
            res.json({
                statusCode : -1,
                status : "withdrawl fail",
                err : err
            });
        }

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
})

module.exports = router;
