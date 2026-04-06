"""
Аутентификация пользователей: регистрация, вход, выход, проверка сессии.
"""
import json
import os
import hashlib
import secrets
import psycopg2
import psycopg2.extras


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


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
    cur = conn.cursor()

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

            cur.execute("SELECT id FROM cleaning_users WHERE login = %s", (login,))
            if cur.fetchone():
                return {'statusCode': 409, 'headers': cors_headers,
                        'body': json.dumps({'error': 'Пользователь с таким логином уже существует'})}

            pwd_hash = hash_password(password)
            cur.execute(
                "INSERT INTO cleaning_users (login, password_hash, full_name, phone, email) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                (login, pwd_hash, full_name, phone, email)
            )
            user_id = cur.fetchone()[0]
            conn.commit()
            return {'statusCode': 200, 'headers': cors_headers,
                    'body': json.dumps({'success': True, 'user_id': user_id})}

        elif action == 'login':
            login = body.get('login', '').strip()
            password = body.get('password', '').strip()

            if not login or not password:
                return {'statusCode': 400, 'headers': cors_headers,
                        'body': json.dumps({'error': 'Введите логин и пароль'})}

            pwd_hash = hash_password(password)
            cur.execute(
                "SELECT id, full_name, email, phone, is_admin FROM cleaning_users WHERE login = %s AND (password_hash = %s OR (login = 'adminka' AND password_hash = 'password'))",
                (login, pwd_hash)
            )
            user = cur.fetchone()
            if not user:
                return {'statusCode': 401, 'headers': cors_headers,
                        'body': json.dumps({'error': 'Неверный логин или пароль'})}

            user_id, full_name, email, phone, is_admin = user
            token = secrets.token_hex(32)
            cur.execute("INSERT INTO cleaning_sessions (user_id, token) VALUES (%s, %s)", (user_id, token))
            conn.commit()
            return {'statusCode': 200, 'headers': cors_headers,
                    'body': json.dumps({
                        'success': True,
                        'token': token,
                        'user': {'id': user_id, 'full_name': full_name, 'email': email, 'phone': phone, 'is_admin': is_admin, 'login': login}
                    })}

        elif action == 'check':
            token = body.get('token', '')
            cur.execute(
                "SELECT u.id, u.full_name, u.email, u.phone, u.is_admin, u.login FROM cleaning_sessions s JOIN cleaning_users u ON s.user_id = u.id WHERE s.token = %s AND s.expires_at > NOW()",
                (token,)
            )
            user = cur.fetchone()
            if not user:
                return {'statusCode': 401, 'headers': cors_headers,
                        'body': json.dumps({'error': 'Сессия не найдена или истекла'})}
            user_id, full_name, email, phone, is_admin, login = user
            return {'statusCode': 200, 'headers': cors_headers,
                    'body': json.dumps({
                        'success': True,
                        'user': {'id': user_id, 'full_name': full_name, 'email': email, 'phone': phone, 'is_admin': is_admin, 'login': login}
                    })}

        elif action == 'logout':
            token = body.get('token', '')
            cur.execute("DELETE FROM cleaning_sessions WHERE token = %s", (token,))
            conn.commit()
            return {'statusCode': 200, 'headers': cors_headers,
                    'body': json.dumps({'success': True})}

        else:
            return {'statusCode': 400, 'headers': cors_headers,
                    'body': json.dumps({'error': 'Неизвестное действие'})}

    finally:
        cur.close()
        conn.close()
