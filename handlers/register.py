import logging
import os
import uuid

import bcrypt

from config.environments import Environment
from handlers.base import BaseHandler
from utils.database import create_colony_database, get_master_pool


class RegisterHandler(BaseHandler):
    async def post(self):
        try:
            username = self.get_body_argument("username")
            password = self.get_body_argument("password")
            colony = self.get_body_argument("colony")
            theme_color = self.get_body_argument("theme_color")

            banner_meta = self.request.files.get("banner")

            colony_id = uuid.uuid4()
            banner_filename = None

            logging.info(f"Received registration data: username={username}, colony={colony}, theme_color={theme_color}, banner_meta={banner_meta}")

            if banner_meta:
                fileinfo = banner_meta[0]
                original_name = fileinfo["filename"]
                ext = os.path.splitext(original_name)[1]
                new_name = f"{colony_id}{ext}"

                save_path = f"{Environment.DATA_PATH}/uploaded_banners/{new_name}"
                os.makedirs(f"{Environment.DATA_PATH}/uploaded_banners", exist_ok=True)

                with open(save_path, "wb") as f:
                    f.write(fileinfo["body"])

                banner_filename = new_name

            # hash password
            salt = bcrypt.gensalt()
            pw_hash = bcrypt.hashpw(password.encode(), salt).decode()

            # colony ID + DB name
            colony_db = f"colony_{colony_id.hex}"

            # create colony database
            await create_colony_database(colony_db)

            # save to master table
            pool = await get_master_pool()
            async with pool.acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO colonies (
                        id, username, password_hash, colony_name,
                        theme_color, banner_file, database_name
                    )
                    VALUES ($1,$2,$3,$4,$5,$6,$7)
                """,
                    colony_id,
                    username,
                    pw_hash,
                    colony,
                    theme_color,
                    banner_filename,
                    colony_db,
                )

            self.finish({"success": True, "username": username, "colony": colony, "theme_color": theme_color, "banner_file": banner_filename})

        except Exception as e:
            self.set_status(400)
            self.finish({"error": str(e)})
