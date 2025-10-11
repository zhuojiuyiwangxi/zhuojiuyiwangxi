<!DOCTYPE html>  
<html lang="zh-CN">  
<head>  
    <meta charset="UTF-8">  
    <meta name="viewport" content="width=device-width, initial-scale=1.0">  
    <title>用户登录系统</title>  
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .login-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            padding: 40px;
            width: 100%;
            max-width: 400px;
            transition: transform 0.3s ease;
        }

        .login-container:hover {
            transform: translateY(-5px);
        }

        .login-header {
            text-align: center;
            margin-bottom: 30px;
        }

        .login-header h2 {
            color: #333;
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
        }

        .login-header p {
            color: #666;
            font-size: 14px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
            font-size: 14px;
        }

        input[type="text"],
        input[type="password"] {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 14px;
            transition: all 0.3s ease;
            background-color: #f8f9fa;
        }

        input[type="text"]:focus,
        input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
            background-color: white;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .submit-btn {
            width: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 14px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 10px;
        }

        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:active {
            transform: translateY(0);
        }

        .login-footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }

        .login-footer a {
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
        }

        .login-footer a:hover {
            text-decoration: underline;
        }

        .message {
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            font-size: 14px;
            display: none;
        }

        .message.success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .message.error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .input-icon {
            position: relative;
        }

        .input-icon i {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
        }

        .input-icon input {
            padding-left: 45px;
        }

        @media (max-width: 480px) {
            .login-container {
                padding: 30px 20px;
                margin: 10px;
            }
            
            body {
                padding: 10px;
            }
        }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>  
<body>  
    <div class="login-container">  
        <div class="login-header">
            <h2>欢迎登录</h2>
            <p>请输入您的账号信息</p>
        </div>
        
        <form action="" method="post">  
            <div class="form-group">
                <label for="username">用户名</label>
                <div class="input-icon">
                    <i class="fas fa-user"></i>
                    <input type="text" placeholder="请输入用户名" name="username" required>  
                </div>
            </div>

            <div class="form-group">
                <label for="password">密码</label>
                <div class="input-icon">
                    <i class="fas fa-lock"></i>
                    <input type="password" placeholder="请输入密码" name="password" required>  
                </div>
            </div>

            <button type="submit" class="submit-btn">
                <i class="fas fa-sign-in-alt"></i> 立即登录
            </button>  
        </form>  

        <div class="login-footer">
            <a href="#">忘记密码？</a> | 
            <a href="#">注册新账号</a>
        </div>
    </div>  

    <?php
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $username = $_POST["username"];
        $passwd = $_POST["password"];
        $conn = mysqli_connect("127.0.0.1", "root", "root", "study");
        $sql = "select * from user where username='$username' and password='$passwd'";
        $result = mysqli_query($conn, $sql);
        if (mysqli_fetch_array($result)) {
            echo "<script>
                document.addEventListener('DOMContentLoaded', function() {
                    const message = document.createElement('div');
                    message.className = 'message success';
                    message.innerHTML = '<i class=\"fas fa-check-circle\"></i> 登录成功！';
                    message.style.display = 'block';
                    document.querySelector('.login-header').after(message);
                    
                    setTimeout(() => {
                        message.style.opacity = '0';
                        message.style.transform = 'translateY(-20px)';
                        setTimeout(() => message.remove(), 300);
                    }, 3000);
                });
            </script>";
        } else if (!empty($username) || !empty($passwd)) {
            echo "<script>
                document.addEventListener('DOMContentLoaded', function() {
                    const message = document.createElement('div');
                    message.className = 'message error';
                    message.innerHTML = '<i class=\"fas fa-exclamation-circle\"></i> 用户名或密码错误！';
                    message.style.display = 'block';
                    document.querySelector('.login-header').after(message);
                    
                    setTimeout(() => {
                        message.style.opacity = '0';
                        message.style.transform = 'translateY(-20px)';
                        setTimeout(() => message.remove(), 300);
                    }, 3000);
                });
            </script>";
        }
    }
    ?>
</body>  
</html>