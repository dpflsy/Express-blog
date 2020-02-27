//접속정보 참조
module.exports = (function () { //모듈로 사용할 수 있도록 만들어줌
    return {
        local: { //배열로 접속 정보 저장
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '0000',
            database: 'nodedb'
        },
        real: {
            host: '',
            port: '',
            user: '',
            password: '',
            database: ''
        },
        staging: {
            host: '',
            port: '',
            user: '',
            password: '',
            database: ''
        },
        dev: {
            host: '',
            port: '',
            user: '',
            password: '',
            database: ''
        }
    }
})();
