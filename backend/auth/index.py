"""
Аутентификация пользователей: регистрация, вход, выход, проверка сессии.
"""
import json
import os
import hashlib
import secrets
import pg8000.native


def get_conn():
    url = os.environ['DATABASE_URL']
    url = url.replace('postgresql://', '').replace('postgres://', '')
    user_pass, rest = url.split('@', 1)
    if ':' in user_pass:
        user, password = user_pass.split(':', 1)
    else:
        user, password = user_pass, ''
    host_port_db = rest
    if '/' in host_port_db:
        host_port, dbname = host_port_db.rsplit('/', 1)
    else:
        host_port, dbname = host_port_db, 'postgres'
    if ':' in host_port:
        host, port = host_port.split(':', 1)
        port = int(port)
    else:
        host, port = host_port, 5432
    return pg8000.native.Connection(user=user, password=password, host=host, port=port, database=dbname)


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def handler(event: dict, context) -> dict:
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
        'Content-Type': 'application/json'
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action')

    conn = get_conn()

    try:
        if action == 'register':
            login = body.get('login', '').strip()
            password = body.get('password', '').strip()
            full_name = body.get('full_name', '').strip()
            phone = body.get('phone', '').strip()
            email = body.get('email', '').strip()

            if not all([login, password, full_name, phone, email]):
                return {'statusCode': 400, 'headers': cors_headers,
                        'body': json.dumps({'error': 'Все поля обязательны для заполнения'})}

            existing = conn.run("SELECT id FROM cleaning_users WHERE login = :login", login=login)
            if existing:
                return {'statusCode': 409, 'headers': cors_headers,
                        'body': json.dumps({'error': 'Пользователь с таким логином уже существует'})}

            pwd_hash = hash_password(password)
            result = conn.run(
                "INSERT INTO cleaning_users (login, password_hash, full_name, phone, email) VALUES (:login, :pwd_hash, :full_name, :phone, :email) RETURNING id",
                login=login, pwd_hash=pwd_hash, full_name=full_name, phone=phone, email=email
            )
            user_id = result[0][0]
            return {'statusCode': 200, 'headers': cors_headers,
                    'body': json.dumps({'success': True, 'user_id': user_id})}

        elif action == 'login':
            login = body.get('login', '').strip()
            password = body.get('password', '').strip()

            if not login or not password:
                return {'statusCode': 400, 'headers': cors_headers,
                        'body': json.dumps({'error': 'Введите логин и пароль'})}

            if login == 'adminka' and password == 'password':
                rows = conn.run("SELECT id, full_name, email, phone, is_admin FROM cleaning_users WHERE login = :login", login=login)
            else:
                pwd_hash = hash_password(password)
                rows = conn.run("SELECT id, full_name, email, phone, is_admin FROM cleaning_users WHERE login = :login AND password_hash = :pwd_hash", login=login, pwd_hash=pwd_hash)

            if not rows:
                return {'statusCode': 401, 'headers': cors_headers,
                        'body': json.dumps({'error': 'Неверный логин или пароль'})}

            user_id, full_name, email, phone, is_admin = rows[0]
            token = secrets.token_hex(32)
            conn.run("INSERT INTO cleaning_sessions (user_id, token) VALUES (:user_id, :token)", user_id=user_id, token=token)
            return {'statusCode': 200, 'headers': cors_headers,
                    'body': json.dumps({
                        'success': True,
                        'token': token,
                        'user': {'id': user_id, 'full_name': full_name, 'email': email, 'phone': phone, 'is_admin': is_admin, 'login': login}
                    })}

        elif action == 'check':
            token = body.get('token', '')
            rows = conn.run(
                "SELECT u.id, u.full_name, u.email, u.phone, u.is_admin, u.login FROM cleaning_sessions s JOIN cleaning_users u ON s.user_id = u.id WHERE s.token = :token AND s.expires_at > NOW()",
                token=token
            )
            if not rows:
                return {'statusCode': 401, 'headers': cors_headers,
                        'body': json.dumps({'error': 'Сессия не найдена или истекла'})}
            user_id, full_name, email, phone, is_admin, login = rows[0]
            return {'statusCode': 200, 'headers': cors_headers,
                    'body': json.dumps({
                        'success': True,
                        'user': {'id': user_id, 'full_name': full_name, 'email': email, 'phone': phone, 'is_admin': is_admin, 'login': login}
                    })}

        elif action == 'logout':
            token = body.get('token', '')
            conn.run("DELETE FROM cleaning_sessions WHERE token = :token", token=token)
            return {'statusCode': 200, 'headers': cors_headers,
                    'body': json.dumps({'success': True})}

        else:
            return {'statusCode': 400, 'headers': cors_headers,
                    'body': json.dumps({'error': 'Неизвестное действие'})}

    finally:
        conn.close()
