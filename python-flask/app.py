from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

# 创建Flask应用
app = Flask(__name__)
# 允许跨域请求
CORS(app)
# 配置数据库路径
app.config['SQLALCHEMY_DATABASE_URI'] ='sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# 创建数据库对象
db = SQLAlchemy(app)


# 定义用户模型
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)


# 注册API
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # 检查用户名是否存在
    existing_user = User.query.filter_by(username=data['username']).first()
    if existing_user:
        return jsonify({"message": "username_exists"})

    # 创建新用户
    new_user = User(username=data['username'], password=data['password'])

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "success"}), 201
    except Exception as e:
        return jsonify({"message": "fail"}), 400


# 登录API
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    # 查找用户
    user = User.query.filter_by(username=data['username']).first()

    # 验证密码
    if user and user.password == data['password']:
        return jsonify({"message": "success"}), 200
    else:
        # 修改状态码为200，将登录失败信息放在message中
        return jsonify({"message": "fail"}), 200


# 程序入口
if __name__ == '__main__':
    # 创建数据库表
    with app.app_context():
        db.create_all()
    
    # 启动服务器，监听所有IP，端口5000
    app.run(debug=True, host='0.0.0.0', port=5000)