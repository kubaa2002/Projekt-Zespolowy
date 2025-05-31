from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime, timedelta
import jwt
import bcrypt
from functools import wraps

app = Flask(__name__)
CORS(app)


SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
DATABASE = "app.db"


def init_db():
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()

    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        password TEXT NOT NULL
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
        c.execute("INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)",
                  (user_id, email, username, hashed))
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


if __name__ == "__main__":
    init_db()
    app.run(debug=True, host="0.0.0.0", port=5000)