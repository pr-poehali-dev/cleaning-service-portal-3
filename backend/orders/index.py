"""
Управление заявками: создание, просмотр, смена статуса.
"""
import json
import os
import psycopg2
import psycopg2.extras


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_user_from_token(cur, token):
    cur.execute(
        "SELECT u.id, u.is_admin FROM cleaning_sessions s JOIN cleaning_users u ON s.user_id = u.id WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    return cur.fetchone()


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
    token = body.get('token', '')

    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        user = get_user_from_token(cur, token)
        if not user:
            return {'statusCode': 401, 'headers': cors_headers,
                    'body': json.dumps({'error': 'Необходима авторизация'})}

        user_id, is_admin = user['id'], user['is_admin']

        if action == 'create':
            address = body.get('address', '').strip()
            contact_phone = body.get('contact_phone', '').strip()
            contact_email = body.get('contact_email', '').strip()
            service_date = body.get('service_date', '').strip()
            service_time = body.get('service_time', '').strip()
            service_type = body.get('service_type', '').strip()
            payment_type = body.get('payment_type', '').strip()

            if not all([address, contact_phone, contact_email, service_date, service_time, service_type, payment_type]):
                return {'statusCode': 400, 'headers': cors_headers,
                        'body': json.dumps({'error': 'Все поля обязательны для заполнения'})}

            cur.execute(
                "INSERT INTO cleaning_orders (user_id, address, contact_phone, contact_email, service_date, service_time, service_type, payment_type) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (user_id, address, contact_phone, contact_email, service_date, service_time, service_type, payment_type)
            )
            order_id = cur.fetchone()['id']
            conn.commit()
            return {'statusCode': 200, 'headers': cors_headers,
                    'body': json.dumps({'success': True, 'order_id': order_id})}

        elif action == 'list':
            if is_admin:
                cur.execute(
                    "SELECT o.*, u.full_name, u.login, u.phone as user_phone, u.email as user_email FROM cleaning_orders o JOIN cleaning_users u ON o.user_id = u.id ORDER BY o.created_at DESC"
                )
            else:
                cur.execute(
                    "SELECT o.*, u.full_name, u.login FROM cleaning_orders o JOIN cleaning_users u ON o.user_id = u.id WHERE o.user_id = %s ORDER BY o.created_at DESC",
                    (user_id,)
                )
            orders = cur.fetchall()
            result = []
            for o in orders:
                row = dict(o)
                if row.get('service_date'):
                    row['service_date'] = str(row['service_date'])
                if row.get('created_at'):
                    row['created_at'] = str(row['created_at'])
                result.append(row)
            return {'statusCode': 200, 'headers': cors_headers,
                    'body': json.dumps({'success': True, 'orders': result})}

        elif action == 'update_status':
            if not is_admin:
                return {'statusCode': 403, 'headers': cors_headers,
                        'body': json.dumps({'error': 'Доступ запрещён'})}

            order_id = body.get('order_id')
            status = body.get('status')
            cancel_reason = body.get('cancel_reason', '')

            if status not in ['new', 'in_progress', 'done', 'cancelled']:
                return {'statusCode': 400, 'headers': cors_headers,
                        'body': json.dumps({'error': 'Недопустимый статус'})}

            if status == 'cancelled' and not cancel_reason.strip():
                return {'statusCode': 400, 'headers': cors_headers,
                        'body': json.dumps({'error': 'Укажите причину отмены'})}

            cur.execute(
                "UPDATE cleaning_orders SET status = %s, cancel_reason = %s WHERE id = %s",
                (status, cancel_reason if status == 'cancelled' else None, order_id)
            )
            conn.commit()
            return {'statusCode': 200, 'headers': cors_headers,
                    'body': json.dumps({'success': True})}

        else:
            return {'statusCode': 400, 'headers': cors_headers,
                    'body': json.dumps({'error': 'Неизвестное действие'})}

    finally:
        cur.close()
        conn.close()
