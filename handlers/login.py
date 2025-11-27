import bcrypt
from tornado.web import HTTPError

from handlers.base import BaseHandler
from utils.database import get_master_pool


class ColonyAdminLoginHandler(BaseHandler):
    async def get(self, colony_name):
        colony_name = colony_name.lower()

        pool = await get_master_pool()
        async with pool.acquire() as conn:
            colony = await conn.fetchrow(
                """
                SELECT colony_name, banner_file, theme_color
                FROM colonies
                WHERE colony_name = $1
                """,
                colony_name,
            )

        if not colony:
            raise HTTPError(404, reason="Colony not found")

        self.render_template(
            "login.html",
            colony_name=colony["colony_name"],
            banner_file=colony["banner_file"],
            theme_color=colony["theme_color"],
        )

    async def post(self, colony_name):
        colony_name = colony_name.lower()

        username = self.get_body_argument("username", None)
        password = self.get_body_argument("password", None)

        if not username or not password:
            return self.write_json({"error": "Missing username or password"}, status=400)

        pool = await get_master_pool()
        async with pool.acquire() as conn:
            colony = await conn.fetchrow(
                """
                SELECT id, username, password_hash
                FROM colonies
                WHERE colony_name = $1
                """,
                colony_name,
            )

        if not colony:
            return self.write_json({"error": "Invalid colony"}, status=400)

        # username check
        if colony["username"] != username:
            return self.write_json({"error": "Invalid credentials"}, status=403)

        # password check
        if not bcrypt.checkpw(password.encode(), colony["password_hash"].encode()):
            return self.write_json({"error": "Invalid credentials"}, status=403)

        # Success → set secure cookie# Success → set secure cookies
        self.set_secure_cookie("role", "admin", httponly=True, samesite="Strict")
        self.set_secure_cookie("colony", colony_name, httponly=True, samesite="Strict")

        return self.write_json({"success": True})
