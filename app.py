from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime, timedelta
import jwt
import bcrypt
from functools import wraps
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app)


SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
DATABASE = "app.db"

SMTP_SERVER = "poczta.int.pl"
SMTP_PORT = 587
SMTP_EMAIL = "no_reply2@securebox.int.pl"  
SMTP_PASSWORD = "<your-smtp-password>"  
import secrets
import string

def generate_random_string(length=32):
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

def init_db():
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()

    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        isDeleted BOOLEAN DEFAULT 0
    )''')

    c.execute("PRAGMA table_info(users)")
    columns = [info[1] for info in c.fetchall()]  

    if 'isDeleted' not in columns:
        c.execute("ALTER TABLE users ADD COLUMN isDeleted BOOLEAN DEFAULT 0")

    c.execute("PRAGMA table_info(users)")
    columns = [info[1] for info in c.fetchall()]
    if 'createdDateTime' not in columns:
        default_datetime = datetime.utcnow().isoformat()
        c.execute(f"ALTER TABLE users ADD COLUMN createdDateTime TEXT DEFAULT '{default_datetime}'")

    c.execute('''CREATE TABLE IF NOT EXISTS communities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        createdDateTime TEXT NOT NULL
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS community_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        communityId INTEGER NOT NULL,
        userId TEXT NOT NULL,
        role TEXT NOT NULL,
        joinedDateTime TEXT NOT NULL,
        FOREIGN KEY (communityId) REFERENCES communities(id),
        FOREIGN KEY (userId) REFERENCES users(id),
        UNIQUE (communityId, userId)
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS followers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        followerId TEXT NOT NULL,
        followingId TEXT NOT NULL,
        followedDateTime TEXT NOT NULL,
        FOREIGN KEY (followerId) REFERENCES users(id),
        FOREIGN KEY (followingId) REFERENCES users(id),
        UNIQUE (followerId, followingId)
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        authorId TEXT NOT NULL,
        authorName TEXT NOT NULL,
        likesCount INTEGER DEFAULT 0,
        saved BOOLEAN DEFAULT 0,
        isLied BOOLEAN DEFAULT 0,
        isDisliked BOOLEAN DEFAULT 0,
        dislikesCount INTEGER DEFAULT 0,
        isSaved BOOLEAN DEFAULT 0,
        content TEXT NOT NULL,
        communityId INTEGER,
        createdDateTime TEXT NOT NULL,
        parentId INTEGER,
        isDeleted BOOLEAN DEFAULT 0,
        FOREIGN KEY (authorId) REFERENCES users(id)
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        postId INTEGER NOT NULL,
        reactionType INTEGER NOT NULL,  -- 1: Like, 2: Dislike, 3: DeleteReaction
        createdDateTime TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (postId) REFERENCES posts(id),
        UNIQUE (userId, postId)  -- Ensure one reaction per user per post
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        token TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        used BOOLEAN DEFAULT 0,
        FOREIGN KEY (email) REFERENCES users(email)
    )''')
    conn.commit()
    conn.close()


def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            try:
                token = request.headers["Authorization"].split(" ")[1]
                payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                request.user_id = payload["user_id"]
            except Exception as e:
                return jsonify({"error": "Invalid or missing token"}), 401
        else:
            return jsonify({"error": "Token is missing"}), 401
        return f(*args, **kwargs)
    return decorated



@app.route("/user/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    username = data.get("username")
    password = data.get("password")
    
    if not email or not username or not password:
        return jsonify({"error": "Missing email, username, or password"}), 400
    
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    
    conn = get_db()
    c = conn.cursor()
    try:
        user_id = f"u{str(len(list(c.execute('SELECT * FROM users'))) + 1).zfill(3)}"
        created_date = datetime.utcnow().isoformat()
        c.execute("INSERT INTO users (id, email, username, password, createdDateTime) VALUES (?, ?, ?, ?, ?)",
          (user_id, email, username, hashed, created_date))
        conn.commit()
        token = jwt.encode({"user_id": user_id, "exp": datetime.utcnow() + timedelta(hours=24)},
                           SECRET_KEY, algorithm="HS256")
        return jsonify({"token": token, "userName": username}), 200
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already exists"}), 400
    finally:
        conn.close()

@app.route("/user/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400
    
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = c.fetchone()
    conn.close()
    
    if user and bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
        token = jwt.encode({"user_id": user["id"], "exp": datetime.utcnow() + timedelta(hours=24)},
                           SECRET_KEY, algorithm="HS256")
        return jsonify({"token": token, "userName": user["username"]}), 200
    return jsonify({"error": "Invalid credentials"}), 401



@app.route("/posts", methods=["GET"])
@token_required
def fetch_posts():
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("pageSize", 10))
    offset = (page - 1) * page_size
    
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM posts WHERE isDeleted = 0 LIMIT ? OFFSET ?", (page_size, offset))
    posts = [dict(row) for row in c.fetchall()]
    for post in posts:
        c.execute("SELECT reactionType FROM likes WHERE userId = ? AND postId = ?", (request.user_id, post["id"]))
        reaction = c.fetchone()
        post["isLied"] = reaction["reactionType"] == 1 if reaction else False
        post["isDisliked"] = reaction["reactionType"] == 2 if reaction else False
    conn.close()
    return jsonify(posts), 200

@app.route("/posts/community/<int:community_id>", methods=["GET"])
@token_required
def fetch_community_posts(community_id):
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("pageSize", 10))
    offset = (page - 1) * page_size
    
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM posts WHERE communityId = ? AND isDeleted = 0 LIMIT ? OFFSET ?",
              (community_id, page_size, offset))
    posts = [dict(row) for row in c.fetchall()]
    for post in posts:
        c.execute("SELECT reactionType FROM likes WHERE userId = ? AND postId = ?", (request.user_id, post["id"]))
        reaction = c.fetchone()
        post["isLied"] = reaction["reactionType"] == 1 if reaction else False
        post["isDisliked"] = reaction["reactionType"] == 2 if reaction else False
    conn.close()
    return jsonify(posts), 200

@app.route("/posts/user/<author_id>", methods=["GET"])
@token_required
def fetch_user_posts(author_id):
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("pageSize", 10))
    offset = (page - 1) * page_size
    
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM posts WHERE authorId = ? AND isDeleted = 0 LIMIT ? OFFSET ?",
              (author_id, page_size, offset))
    posts = [dict(row) for row in c.fetchall()]
    for post in posts:
        c.execute("SELECT reactionType FROM likes WHERE userId = ? AND postId = ?", (request.user_id, post["id"]))
        reaction = c.fetchone()
        post["isLied"] = reaction["reactionType"] == 1 if reaction else False
        post["isDisliked"] = reaction["reactionType"] == 2 if reaction else False
    conn.close()
    return jsonify(posts), 200

@app.route("/posts/<int:parent_id>/comments", methods=["GET"])
@token_required
def fetch_post_comments(parent_id):
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("pageSize", 10))
    offset = (page - 1) * page_size
    
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM posts WHERE parentId = ? AND isDeleted = 0 LIMIT ? OFFSET ?",
              (parent_id, page_size, offset))
    comments = [dict(row) for row in c.fetchall()]
    
    for comment in comments:

        c.execute("SELECT reactionType FROM likes WHERE userId = ? AND postId = ?",
                  (request.user_id, comment["id"]))
        reaction = c.fetchone()
        comment["isLied"] = reaction["reactionType"] == 1 if reaction else False
        comment["isDisliked"] = reaction["reactionType"] == 2 if reaction else False
        

        c.execute("SELECT COUNT(*) as replyCount FROM posts WHERE parentId = ? AND isDeleted = 0",
                  (comment["id"],))
        reply_count = c.fetchone()
        comment["replyCount"] = reply_count["replyCount"] if reply_count else 0
    
    conn.close()
    return jsonify(comments), 200

@app.route("/posts/GetAll", methods=["GET"])
@token_required
def fetch_all_posts():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM posts WHERE isDeleted = 0")
    posts = [dict(row) for row in c.fetchall()]
    for post in posts:
        c.execute("SELECT reactionType FROM likes WHERE userId = ? AND postId = ?", (request.user_id, post["id"]))
        reaction = c.fetchone()
        post["isLied"] = reaction["reactionType"] == 1 if reaction else False
        post["isDisliked"] = reaction["reactionType"] == 2 if reaction else False
    conn.close()
    return jsonify(posts), 200

@app.route("/posts/<int:id>", methods=["GET"])
@token_required
def fetch_post_by_id(id):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM posts WHERE id = ? AND isDeleted = 0", (id,))
    post = c.fetchone()
    if post:
        post_dict = dict(post)
        c.execute("SELECT reactionType FROM likes WHERE userId = ? AND postId = ?", (request.user_id, id))
        reaction = c.fetchone()
        post_dict["isLied"] = reaction["reactionType"] == 1 if reaction else False
        post_dict["isDisliked"] = reaction["reactionType"] == 2 if reaction else False
        conn.close()
        return jsonify(post_dict), 200
    conn.close()
    return jsonify({"error": "Post not found"}), 404

@app.route("/posts", methods=["POST"])
@token_required
def create_post():
    data = request.get_json()
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT username FROM users WHERE id = ?", (request.user_id,))
    user = c.fetchone()
    if not user:
        conn.close()
        return jsonify({"error": "User not found"}), 404
    
    post = {
        "authorId": request.user_id,
        "authorName": user["username"],
        "likesCount": 0,  
        "saved": data.get("saved", False),
        "isLied": False,  
        "isDisliked": False,  
        "dislikesCount": 0,  
        "isSaved": data.get("isSaved", False),
        "content": data.get("content"),
        "communityId": data.get("communityId"),
        "createdDateTime": datetime.utcnow().isoformat(),
        "parentId": data.get("parentId"),
        "isDeleted": False
    }
    if not post["content"]:
        conn.close()
        return jsonify({"error": "Content is required"}), 400
    
    c.execute("""INSERT INTO posts (authorId, authorName, likesCount, saved, isLied, isDisliked, 
              dislikesCount, isSaved, content, communityId, createdDateTime, parentId, isDeleted)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
              (post["authorId"], post["authorName"], post["likesCount"], post["saved"], post["isLied"],
               post["isDisliked"], post["dislikesCount"], post["isSaved"], post["content"],
               post["communityId"], post["createdDateTime"], post["parentId"], post["isDeleted"]))
    post["id"] = c.lastrowid
    conn.commit()
    conn.close()
    return jsonify(post), 201

@app.route("/posts/community/<int:community_id>", methods=["POST"])
@token_required
def create_post_in_community(community_id):
    data = request.get_json()
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT username FROM users WHERE id = ?", (request.user_id,))
    user = c.fetchone()
    if not user:
        conn.close()
        return jsonify({"error": "User not found"}), 404
    
    post = {
        "authorId": request.user_id,
        "authorName": user["username"],
        "likesCount": 0,
        "saved": data.get("saved", False),
        "isLied": False,
        "isDisliked": False,
        "dislikesCount": 0,
        "isSaved": data.get("isSaved", False),
        "content": data.get("content"),
        "communityId": community_id,
        "createdDateTime": datetime.utcnow().isoformat(),
        "parentId": data.get("parentId"),
        "isDeleted": False
    }
    if not post["content"]:
        conn.close()
        return jsonify({"error": "Content is required"}), 400
    
    c.execute("""INSERT INTO posts (authorId, authorName, likesCount, saved, isLied, isDisliked, 
              dislikesCount, isSaved, content, communityId, createdDateTime, parentId, isDeleted)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
              (post["authorId"], post["authorName"], post["likesCount"], post["saved"], post["isLied"],
               post["isDisliked"], post["dislikesCount"], post["isSaved"], post["content"],
               post["communityId"], post["createdDateTime"], post["parentId"], post["isDeleted"]))
    post["id"] = c.lastrowid
    conn.commit()
    conn.close()
    return jsonify(post), 201

@app.route("/posts/<int:parent_id>", methods=["POST"])
@token_required
def create_comment(parent_id):
    data = request.get_json()
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT username FROM users WHERE id = ?", (request.user_id,))
    user = c.fetchone()
    if not user:
        conn.close()
        return jsonify({"error": "User not found"}), 404
    
    comment = {
        "authorId": request.user_id,
        "authorName": user["username"],
        "likesCount": 0,
        "saved": data.get("saved", False),
        "isLied": False,
        "isDisliked": False,
        "dislikesCount": 0,
        "isSaved": data.get("isSaved", False),
        "content": data.get("content"),
        "communityId": data.get("communityId"),
        "createdDateTime": datetime.utcnow().isoformat(),
        "parentId": parent_id,
        "isDeleted": False
    }
    if not comment["content"]:
        conn.close()
        return jsonify({"error": "Content is required"}), 400
    
    c.execute("""INSERT INTO posts (authorId, authorName, likesCount, saved, isLied, isDisliked, 
              dislikesCount, isSaved, content, communityId, createdDateTime, parentId, isDeleted)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
              (comment["authorId"], comment["authorName"], comment["likesCount"], comment["saved"],
               comment["isLied"], comment["isDisliked"], comment["dislikesCount"], comment["isSaved"],
               comment["content"], comment["communityId"], comment["createdDateTime"],
               comment["parentId"], comment["isDeleted"]))
    comment["id"] = c.lastrowid
    conn.commit()
    conn.close()
    return jsonify(comment), 201

@app.route("/posts/<int:post_id>/Like", methods=["POST"])
@token_required
def give_reaction(post_id):
    data = request.get_json()
    reaction_type = data.get("reactionType")  # 1: Like, 2: Dislike, 3: DeleteReaction
    
    if reaction_type not in [1, 2, 3]:
        return jsonify({"error": "Invalid reaction type"}), 400
    
    conn = get_db()
    c = conn.cursor()
    

    c.execute("SELECT * FROM posts WHERE id = ? AND isDeleted = 0", (post_id,))
    post = c.fetchone()
    if not post:
        conn.close()
        return jsonify({"error": "Post nie istnieje lub został usunięty"}), 404
    

    c.execute("SELECT reactionType FROM likes WHERE userId = ? AND postId = ?", (request.user_id, post_id))
    existing_reaction = c.fetchone()
    

    likes_count = post["likesCount"]
    dislikes_count = post["dislikesCount"]
    
    if existing_reaction:
        existing_type = existing_reaction["reactionType"]
        if existing_type == reaction_type:

            conn.close()
            return jsonify({"message": "Reaction already set"}), 200
        elif reaction_type == 3:  
            if existing_type == 1:
                likes_count -= 1
            elif existing_type == 2:
                dislikes_count -= 1
            c.execute("DELETE FROM likes WHERE userId = ? AND postId = ?", (request.user_id, post_id))
        else:

            if existing_type == 1:
                likes_count -= 1
            elif existing_type == 2:
                dislikes_count -= 1
            if reaction_type == 1:
                likes_count += 1
            elif reaction_type == 2:
                dislikes_count += 1
            c.execute("UPDATE likes SET reactionType = ?, createdDateTime = ? WHERE userId = ? AND postId = ?",
                      (reaction_type, datetime.utcnow().isoformat(), request.user_id, post_id))
    else:

        if reaction_type == 1:
            likes_count += 1
        elif reaction_type == 2:
            dislikes_count += 1
        elif reaction_type == 3:

            conn.close()
            return jsonify({"message": "No reaction to delete"}), 200
        c.execute("INSERT INTO likes (userId, postId, reactionType, createdDateTime) VALUES (?, ?, ?, ?)",
                  (request.user_id, post_id, reaction_type, datetime.utcnow().isoformat()))
    

    c.execute("UPDATE posts SET likesCount = ?, dislikesCount = ? WHERE id = ?",
              (likes_count, dislikes_count, post_id))
    
    conn.commit()
    conn.close()
    return jsonify({"message": "Reaction processed"}), 200

@app.route("/posts", methods=["PUT"])
@token_required
def update_post():
    data = request.get_json()
    post_id = data.get("Id")
    if not post_id:
        return jsonify({"error": "Post ID is required"}), 400
    
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM posts WHERE id = ? AND authorId = ?", (post_id, request.user_id))
    post = c.fetchone()
    if not post:
        conn.close()
        return jsonify({"error": "Post not found or not authorized"}), 404
    
    updated_post = {
        "saved": data.get("saved", post["saved"]),
        "isSaved": data.get("isSaved", post["isSaved"]),
        "content": data.get("content", post["content"]),
        "communityId": data.get("communityId", post["communityId"]),
        "isDeleted": data.get("isDeleted", post["isDeleted"])
    }
    c.execute("""UPDATE posts SET saved = ?, isSaved = ?, content = ?, communityId = ?, isDeleted = ?
              WHERE id = ?""",
              (updated_post["saved"], updated_post["isSaved"], updated_post["content"],
               updated_post["communityId"], updated_post["isDeleted"], post_id))
    conn.commit()
    conn.close()

    c = get_db().cursor()
    c.execute("SELECT * FROM posts WHERE id = ?", (post_id,))
    updated_post_db = c.fetchone()
    updated_post["id"] = post_id
    updated_post["authorId"] = updated_post_db["authorId"]
    updated_post["authorName"] = updated_post_db["authorName"]
    updated_post["likesCount"] = updated_post_db["likesCount"]
    updated_post["dislikesCount"] = updated_post_db["dislikesCount"]
    c.execute("SELECT reactionType FROM likes WHERE userId = ? AND postId = ?", (request.user_id, post_id))
    reaction = c.fetchone()
    updated_post["isLied"] = reaction["reactionType"] == 1 if reaction else False
    updated_post["isDisliked"] = reaction["reactionType"] == 2 if reaction else False
    updated_post["createdDateTime"] = updated_post_db["createdDateTime"]
    updated_post["parentId"] = updated_post_db["parentId"]
    conn.close()
    return jsonify(updated_post), 200

@app.route("/posts/Delete/<int:id>", methods=["PUT"])
@token_required
def delete_post(id):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM posts WHERE id = ? AND authorId = ?", (id, request.user_id))
    post = c.fetchone()
    if not post:
        conn.close()
        return jsonify({"error": "Post not found or not authorized"}), 404
    
    c.execute("UPDATE posts SET isDeleted = 1 WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Post marked as deleted"}), 200

@app.route("/posts/UndoDelete/<int:id>", methods=["PUT"])
@token_required
def undo_delete_post(id):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM posts WHERE id = ? AND authorId = ?", (id, request.user_id))
    post = c.fetchone()
    if not post:
        conn.close()
        return jsonify({"error": "Post not found or not authorized"}), 404
    
    c.execute("UPDATE posts SET isDeleted = 0 WHERE id = ?", (id,))
    conn.commit()
    post_dict = dict(post)
    c.execute("SELECT reactionType FROM likes WHERE userId = ? AND postId = ?", (request.user_id, id))
    reaction = c.fetchone()
    post_dict["isLied"] = reaction["reactionType"] == 1 if reaction else False
    post_dict["isDisliked"] = reaction["reactionType"] == 2 if reaction else False
    conn.close()
    return jsonify(post_dict), 200



@app.route("/user/test", methods=["GET"])
@token_required
def get_current_user_test():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT username, email FROM users WHERE id = ?", (request.user_id,))
    user = c.fetchone()
    conn.close()
    
    if not user:
        return jsonify({"message": "Użytkownik nie istnieje"}), 401
    
    return jsonify({"userName": user["username"], "email": user["email"]}), 200



def send_email(to_email, reset_link):
    try:

        msg = MIMEMultipart()
        msg['From'] = SMTP_EMAIL
        msg['To'] = to_email
        msg['Subject'] = 'Resetowanie hasła'


        body = f"""
        Cześć,

        Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta.
        Kliknij poniższy link, aby ustawić nowe hasło:

        {reset_link}

        Link jest ważny przez 1 godzinę. Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość.

        Pozdrawiamy,
        Zespół aplikacji
        """
        msg.attach(MIMEText(body, 'plain'))


        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  
            server.login(SMTP_EMAIL, SMTP_PASSWORD)  
            server.sendmail(SMTP_EMAIL, to_email, msg.as_string())  
        return True
    except Exception as e:
        print(f"Błąd podczas wysyłania emaila: {str(e)}")
        return False

@app.route("/user/sendResetLink", methods=["POST"])
def send_reset_link():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email jest wymagany"}), 400

    
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = c.fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "Użytkownik o podanym emailu nie istnieje"}), 404

    
    reset_token = jwt.encode(
        {"email": email, "exp": datetime.utcnow() + timedelta(hours=1)},
        SECRET_KEY,
        algorithm="HS256"
    )

   
    created_at = datetime.utcnow().isoformat()
    expires_at = (datetime.utcnow() + timedelta(hours=1)).isoformat()
    c.execute(
        "INSERT INTO password_resets (email, token, created_at, expires_at, used) VALUES (?, ?, ?, ?, ?)",
        (email, reset_token, created_at, expires_at, False)
    )
    conn.commit()
    conn.close()

  
    reset_link = generate_reset_link(reset_token)
    if send_email(email, reset_link):
        return jsonify({"message": "Link do resetowania hasła został wysłany na Twój email"}), 200
    else:
        return jsonify({"error": "Błąd podczas wysyłania emaila. Spróbuj ponownie później."}), 500
    
def generate_reset_link(token):
   
    return f"http://localhost:5173/resetconfirm?token={token}"


@app.route("/user/resetPassword", methods=["POST"])
def reset_password():
    data = request.get_json()
    token = data.get("token")
    new_password = data.get("newPassword")

    if not token or not new_password:
        return jsonify({"error": "Token i nowe hasło są wymagane"}), 400


    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM password_resets WHERE token = ? AND used = 0", (token,))
    reset_entry = c.fetchone()

    if not reset_entry:
        conn.close()
        return jsonify({"error": "Nieprawidłowy lub zużyty token"}), 400

   
    expires_at = datetime.fromisoformat(reset_entry["expires_at"])
    if datetime.utcnow() > expires_at:
        conn.close()
        return jsonify({"error": "Token wygasł"}), 400

  
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload["email"]
    except Exception as e:
        conn.close()
        return jsonify({"error": "Nieprawidłowy token"}), 400

    
    c.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = c.fetchone()
    if not user:
        conn.close()
        return jsonify({"error": "Użytkownik nie istnieje"}), 404

 
    hashed = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

  
    c.execute("UPDATE users SET password = ? WHERE email = ?", (hashed, email))

  
    c.execute("UPDATE password_resets SET used = 1 WHERE token = ?", (token,))

    conn.commit()
    conn.close()

    return jsonify({"message": "Hasło zostało pomyślnie zresetowane"}), 200

@app.route("/user/change-password", methods=["POST"])
@token_required
def change_password():
    data = request.get_json()
    old_password = data.get("oldPassword")
    new_password = data.get("newPassword")

   
    if not old_password or not new_password:
        return jsonify({"error": "Stare i nowe hasło są wymagane"}), 400

   
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE id = ?", (request.user_id,))
    user = c.fetchone()

    if not user:
        conn.close()
        return jsonify({"message": "Użytkownik nie istnieje."}), 404

    
    if not bcrypt.checkpw(old_password.encode("utf-8"), user["password"].encode("utf-8")):
        conn.close()
        errors = {"Status": 401, "Errors": {"PasswordError": ["Nieprawidłowe stare hasło."]}}
        return jsonify(errors), 401

    
    if len(new_password) < 8:
        conn.close()
        errors = {"Status": 400, "Errors": {"PasswordError": ["Nowe hasło musi mieć co najmniej 8 znaków."]}}
        return jsonify(errors), 400

   
    hashed_new_password = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    c.execute("UPDATE users SET password = ? WHERE id = ?", (hashed_new_password, request.user_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Hasło zostało pomyślnie zmienione."}), 200

@app.route("/user/delete", methods=["DELETE"])
@token_required
def delete_user():
  
    data = request.get_json()
    current_password = data.get("currentPassword")

    
    if not current_password:
        return jsonify({"error": "Aktualne hasło jest wymagane do usunięcia konta."}), 400

   
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE id = ? AND isDeleted = 0", (request.user_id,))
    user = c.fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "Użytkownik nie istnieje lub został już usunięty."}), 404

   
    if not bcrypt.checkpw(current_password.encode("utf-8"), user["password"].encode("utf-8")):
        conn.close()
        return jsonify({"error": "Nieprawidłowe hasło."}), 401

   
    random_email = f"deleted_{generate_random_string()}@example.com"

   
    c.execute(
        "UPDATE users SET email = ?, isDeleted = 1 WHERE id = ?",
        (random_email, request.user_id)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Konto zostało pomyślnie usunięte."}), 200


@app.route("/community/join/<int:community_id>", methods=["POST"])
@token_required
def join_community(community_id):
    conn = get_db()
    c = conn.cursor()

  
    c.execute("SELECT * FROM communities WHERE id = ?", (community_id,))
    community = c.fetchone()
    if not community:
        conn.close()
        return jsonify({"error": "Społeczność nie istnieje."}), 404

  
    c.execute("SELECT * FROM community_members WHERE communityId = ? AND userId = ?",
              (community_id, request.user_id))
    already_member = c.fetchone()
    if already_member:
        conn.close()
        return jsonify({"message": "Użytkownik już jest członkiem tej społeczności."}), 200

    
    c.execute("""INSERT INTO community_members (communityId, userId, role, joinedDateTime)
                 VALUES (?, ?, ?, ?)""",
              (community_id, request.user_id, "member", datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()

    return jsonify({"message": "Dołączono do społeczności."}), 201

@app.route("/community/left/<int:community_id>", methods=["POST"])
@token_required
def leave_community(community_id):
    conn = get_db()
    c = conn.cursor()

   
    c.execute("SELECT * FROM communities WHERE id = ?", (community_id,))
    community = c.fetchone()
    if not community:
        conn.close()
        return jsonify({"error": "Społeczność nie istnieje."}), 404

  
    c.execute("SELECT * FROM community_members WHERE communityId = ? AND userId = ?",
              (community_id, request.user_id))
    membership = c.fetchone()
    if not membership:
        conn.close()
        return jsonify({"error": "Użytkownik nie jest członkiem tej społeczności."}), 404

  
    c.execute("DELETE FROM community_members WHERE communityId = ? AND userId = ?",
              (community_id, request.user_id))
    conn.commit()
    conn.close()

    return jsonify({}), 204

@app.route("/community/<int:community_id>", methods=["GET"])
@token_required
def get_community(community_id):
    conn = get_db()
    c = conn.cursor()

    
    c.execute("SELECT * FROM communities WHERE id = ?", (community_id,))
    community = c.fetchone()
    if not community:
        conn.close()
        return jsonify({"error": "Społeczność nie istnieje."}), 404

    
    c.execute("SELECT * FROM community_members WHERE communityId = ? AND userId = ?",
              (community_id, request.user_id))
    member = c.fetchone()

   
    response = {
        "name": community["name"],
        "description": community["description"],
        "createdDate": community["createdDateTime"],
        "isMember": member is not None,
        "joinedDate": member["joinedDateTime"] if member else None,
        "role": member["role"] if member else None
    }

    conn.close()
    return jsonify(response), 200

@app.route("/community/edit/<int:community_id>", methods=["POST"])
@token_required
def edit_community(community_id):
    data = request.get_json()
    description = data.get("description", "")

   
    if len(description) > 500:
        return jsonify({"error": "Opis jest za długi."}), 400

    conn = get_db()
    c = conn.cursor()

    
    c.execute("SELECT * FROM communities WHERE id = ?", (community_id,))
    community = c.fetchone()
    if not community:
        conn.close()
        return jsonify({"error": "Społeczność nie istnieje."}), 404

    
    c.execute("SELECT * FROM community_members WHERE communityId = ? AND userId = ?",
              (community_id, request.user_id))
    member = c.fetchone()
    if not member or member["role"] not in ["owner", "moderator"]:
        conn.close()
        return jsonify({"error": "Brak uprawnień do edycji społeczności."}), 403

    
    c.execute("UPDATE communities SET description = ? WHERE id = ?",
              (description, community_id))
    conn.commit()
    conn.close()

    return jsonify({}), 204

@app.route("/community/new", methods=["POST"])
@token_required
def create_community():
    data = request.get_json()
    name = data.get("name", "").strip()
    description = data.get("description", "")

   
    if len(name) < 1 or not name:
        return jsonify({"error": "Nazwa społeczności jest wymagana."}), 400
    if len(name) > 50 or len(description) > 500:
        return jsonify({"error": "Nazwa lub opis są za długie."}), 413

    conn = get_db()
    c = conn.cursor()

  
    c.execute("SELECT * FROM communities WHERE name = ?", (name,))
    if c.fetchone():
        conn.close()
        return jsonify({"error": "Nazwa społeczności już istnieje."}), 400

   
    created_date = datetime.utcnow().isoformat()
    c.execute("""INSERT INTO communities (name, description, createdDateTime)
                 VALUES (?, ?, ?)""",
              (name, description, created_date))
    community_id = c.lastrowid

    
    c.execute("""INSERT INTO community_members (communityId, userId, role, joinedDateTime)
                 VALUES (?, ?, ?, ?)""",
              (community_id, request.user_id, "owner", created_date))
    
    conn.commit()
    conn.close()

    return jsonify({"message": "Społeczność została utworzona."}), 201

@app.route("/search/community/<int:community_id>", methods=["GET"])
@token_required
def search_community_posts(community_id):
    query = request.args.get("q", "")
    start = int(request.args.get("start", 0))
    amount = int(request.args.get("amount", 10))

    conn = get_db()
    c = conn.cursor()

    
    c.execute("SELECT * FROM communities WHERE id = ?", (community_id,))
    if not c.fetchone():
        conn.close()
        return jsonify({"error": "Społeczność nie istnieje."}), 404

   
    c.execute("""SELECT p.*, COUNT(l.id) as likeCount
                 FROM posts p
                 LEFT JOIN likes l ON p.id = l.postId
                 WHERE p.communityId = ? AND p.content LIKE ? AND p.isDeleted = 0
                 GROUP BY p.id
                 ORDER BY likeCount DESC
                 LIMIT ? OFFSET ?""",
              (community_id, f"%{query}%", amount, start))
    results = [dict(row) for row in c.fetchall()]

    
    for post in results:
        c.execute("SELECT reactionType FROM likes WHERE userId = ? AND postId = ?",
                  (request.user_id, post["id"]))
        reaction = c.fetchone()
        post["isLied"] = reaction["reactionType"] == 1 if reaction else False
        post["isDisliked"] = reaction["reactionType"] == 2 if reaction else False

    conn.close()

    if not results:
        return jsonify({}), 204

    return jsonify(results), 200

@app.route("/search/user/<author_id>", methods=["GET"])
@token_required
def search_user_posts(author_id):
    query = request.args.get("q", "")
    start = int(request.args.get("start", 0))
    amount = int(request.args.get("amount", 10))

    conn = get_db()
    c = conn.cursor()

   
    c.execute("SELECT * FROM users WHERE id = ?", (author_id,))
    if not c.fetchone():
        conn.close()
        return jsonify({"error": "Użytkownik nie istnieje."}), 404

 
    c.execute("""SELECT p.*, COUNT(l.id) as likeCount
                 FROM posts p
                 LEFT JOIN likes l ON p.id = l.postId
                 WHERE p.authorId = ? AND p.content LIKE ? AND p.isDeleted = 0
                 GROUP BY p.id
                 ORDER BY likeCount DESC
                 LIMIT ? OFFSET ?""",
              (author_id, f"%{query}%", amount, start))
    results = [dict(row) for row in c.fetchall()]

   
    for post in results:
        c.execute("SELECT reactionType FROM likes WHERE userId = ? AND postId = ?",
                  (request.user_id, post["id"]))
        reaction = c.fetchone()
        post["isLied"] = reaction["reactionType"] == 1 if reaction else False
        post["isDisliked"] = reaction["reactionType"] == 2 if reaction else False

    conn.close()

    if not results:
        return jsonify({}), 204

    return jsonify(results), 200

@app.route("/search/user", methods=["GET"])
@token_required
def search_users():
    query = request.args.get("q", "")
    start = int(request.args.get("start", 0))
    amount = int(request.args.get("amount", 10))

    conn = get_db()
    c = conn.cursor()

   
    c.execute("""SELECT u.*, COUNT(p.id) as postCount
                 FROM users u
                 LEFT JOIN posts p ON u.id = p.authorId AND p.isDeleted = 0
                 WHERE u.username LIKE ? AND u.isDeleted = 0
                 GROUP BY u.id
                 ORDER BY postCount DESC
                 LIMIT ? OFFSET ?""",
              (f"%{query}%", amount, start))
    results = [dict(row) for row in c.fetchall()]

  
    for user in results:
        user.pop("password", None)

    conn.close()

    if not results:
        return jsonify({}), 204

    return jsonify(results), 200

@app.route("/search/community", methods=["GET"])
@token_required
def search_communities():
    query = request.args.get("q", "")
    start = int(request.args.get("start", 0))
    amount = int(request.args.get("amount", 10))

    conn = get_db()
    c = conn.cursor()

 
    c.execute("""SELECT c.*, COUNT(cm.id) as memberCount
                 FROM communities c
                 LEFT JOIN community_members cm ON c.id = cm.communityId
                 WHERE c.name LIKE ?
                 GROUP BY c.id
                 ORDER BY memberCount DESC
                 LIMIT ? OFFSET ?""",
              (f"%{query}%", amount, start))
    results = [dict(row) for row in c.fetchall()]

    conn.close()

    if not results:
        return jsonify({}), 204

    return jsonify(results), 200

@app.route("/user/<user_id>/fans", methods=["GET"])
@token_required
def get_fans(user_id):
    conn = get_db()
    c = conn.cursor()


    c.execute("SELECT * FROM users WHERE id = ? AND isDeleted = 0", (user_id,))
    user = c.fetchone()
    if not user:
        conn.close()
        return jsonify({"error": "Użytkownik nie istnieje."}), 404


    c.execute("SELECT followerId FROM followers WHERE followingId = ?", (user_id,))
    follower_ids = [row["followerId"] for row in c.fetchall()]

    if not follower_ids:
        conn.close()
        return jsonify({}), 204


    placeholders = ",".join("?" for _ in follower_ids)
    c.execute(f"SELECT id, username FROM users WHERE id IN ({placeholders}) AND isDeleted = 0", follower_ids)
    fans = [{"id": row["id"], "userName": row["username"]} for row in c.fetchall()]

    conn.close()
    return jsonify(fans), 200

@app.route("/user/<user_id>/follows", methods=["GET"])
@token_required
def get_follows(user_id):
    conn = get_db()
    c = conn.cursor()


    c.execute("SELECT * FROM users WHERE id = ? AND isDeleted = 0", (user_id,))
    user = c.fetchone()
    if not user:
        conn.close()
        return jsonify({"error": "Użytkownik nie istnieje."}), 404


    c.execute("SELECT followingId FROM followers WHERE followerId = ?", (user_id,))
    following_ids = [row["followingId"] for row in c.fetchall()]

    if not following_ids:
        conn.close()
        return jsonify({}), 204


    placeholders = ",".join("?" for _ in following_ids)
    c.execute(f"SELECT id, username FROM users WHERE id IN ({placeholders}) AND isDeleted = 0", following_ids)
    follows = [{"id": row["id"], "userName": row["username"]} for row in c.fetchall()]

    conn.close()
    return jsonify(follows), 200

@app.route("/user/<user_id>/communities", methods=["GET"])
@token_required
def get_user_communities(user_id):
    conn = get_db()
    c = conn.cursor()


    c.execute("SELECT * FROM users WHERE id = ? AND isDeleted = 0", (user_id,))
    user = c.fetchone()
    if not user:
        conn.close()
        return jsonify({"error": "Użytkownik nie istnieje."}), 404


    c.execute("SELECT communityId FROM community_members WHERE userId = ?", (user_id,))
    community_ids = [row["communityId"] for row in c.fetchall()]

    if not community_ids:
        conn.close()
        return jsonify({}), 204


    placeholders = ",".join("?" for _ in community_ids)
    c.execute(f"SELECT id, name FROM communities WHERE id IN ({placeholders})", community_ids)
    communities = [{"id": row["id"], "name": row["name"]} for row in c.fetchall()]

    conn.close()
    return jsonify(communities), 200

@app.route("/user/<user_id>", methods=["GET"])
@token_required
def get_user_profile(user_id):
    conn = get_db()
    c = conn.cursor()


    c.execute("SELECT * FROM users WHERE id = ? AND isDeleted = 0", (user_id,))
    user = c.fetchone()
    if not user:
        conn.close()
        return jsonify({"message": "Użytkownik nie istnieje."}), 404

 
    c.execute("SELECT COUNT(*) as count FROM followers WHERE followingId = ?", (user_id,))
    followers_count = c.fetchone()["count"]

 
    c.execute("SELECT COUNT(*) as count FROM followers WHERE followerId = ?", (user_id,))
    following_count = c.fetchone()["count"]

  
    c.execute("SELECT COUNT(*) as count FROM community_members WHERE userId = ?", (user_id,))
    communities_count = c.fetchone()["count"]


    profile = {
        "id": user["id"],
        "userName": user["username"],
        "createdAt": user["createdDateTime"] if "createdDateTime" in user.keys() else datetime.utcnow().isoformat(),
        "isMe": request.user_id == user_id,
        "followersCount": followers_count,
        "followingCount": following_count,
        "communitiesCount": communities_count
    }

    conn.close()
    return jsonify(profile), 200

if __name__ == "__main__":
    init_db()
    app.run(debug=True, host="0.0.0.0", port=5192)