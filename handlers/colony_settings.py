import logging
import os

import bcrypt

from handlers.base import BaseHandler
from handlers.require_role import require_role
from utils.database import get_master_pool


class ColonySettingsPageHandler(BaseHandler):
    @require_role("admin")
    async def get(self, *args, **kwargs):
        # Normalize colony identifier from URL
        colony_identifier = self.request.path.strip("/").lower().replace("/settings", "").replace("/items", "")

        logging.info(f"[SETTINGS_PAGE] Fetching page for colony='{colony_identifier}'")

        pool = await get_master_pool()
        async with pool.acquire() as conn:
            colony_record = await conn.fetchrow(
                """
                SELECT id, colony_name, theme_color, banner_file, username
                FROM colonies
                WHERE colony_name = $1
                """,
                colony_identifier,
            )

        if not colony_record:
            logging.warning(f"[SETTINGS_PAGE] Colony NOT FOUND: '{colony_identifier}'")
            self.set_status(404)
            self.finish(f"Colony '{colony_identifier}' not found.")
            return

        raw_role = self.get_secure_cookie("role")
        role = raw_role.decode("utf-8") if raw_role else None

        logging.info(f"[SETTINGS_PAGE] Loaded colony='{colony_record['colony_name']}' theme='{colony_record['theme_color']}' banner='{colony_record['banner_file']}'")

        self.render_template(
            "colony_settings.html",
            colony_name=colony_record["colony_name"],
            theme_color=colony_record["theme_color"],
            banner_file=colony_record["banner_file"],
            username=colony_record["username"],
            role=role,
        )


class ColonySettingsAPIHandler(BaseHandler):
    @require_role("admin")
    async def post(self, colony_name):
        original_path = self.request.path
        logging.info(f"[SETTINGS_API] Incoming update request: path='{original_path}'")

        colony_identifier = self.request.path.strip("/").lower().replace("/settings", "").replace("/items", "")

        logging.info(f"[SETTINGS_API] Normalized colony_name='{colony_name}', colony_identifier='{colony_identifier}'")

        pool = await get_master_pool()
        async with pool.acquire() as conn:
            # Verify colony exists
            colony_record = await conn.fetchrow(
                """
                SELECT id, banner_file, colony_name
                FROM colonies
                WHERE colony_name = $1
                """,
                colony_name,
            )

            if not colony_record:
                logging.warning(f"[SETTINGS_API] Colony NOT FOUND: '{colony_name}' from path='{original_path}'")
                return self.write_json({"error": "Colony not found"}, status=404)

            colony_id = colony_record["id"]
            old_banner = colony_record["banner_file"]

            logging.info(f"[SETTINGS_API] Editing colony_id={colony_id} (colony='{colony_record['colony_name']}')")

            # Read form fields (never log password)
            username = self.get_body_argument("username", None)
            password = self.get_body_argument("password", None)
            new_name = self.get_body_argument("colony", None)
            theme_color = self.get_body_argument("theme_color", None)

            logging.info(f"[SETTINGS_API] Form fields: username='{username}', new_name='{new_name}', theme_color='{theme_color}'")

            # Banner upload
            banner_file = "placeholder-banner.png"
            if "banner" in self.request.files:
                uploaded = self.request.files["banner"][0]
                filename = f"{colony_id}_{uploaded.filename}"

                save_dir = os.path.join(os.getenv("DATA_PATH", "data"), "uploaded_banners")
                os.makedirs(save_dir, exist_ok=True)

                save_path = os.path.join(save_dir, filename)

                with open(save_path, "wb") as f:
                    f.write(uploaded.body)

                banner_file = filename

                logging.info(f"[SETTINGS_API] Uploaded new banner: '{filename}' (saved to '{save_path}', old='{old_banner}')")
            else:
                logging.info("[SETTINGS_API] No banner uploaded")

            # Hash password (log only that the hash was generated)
            hashed_password = None
            if password:
                hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
                logging.info("[SETTINGS_API] Password updated (hashed)")

            # Perform the update
            logging.info(f"[SETTINGS_API] Updating colony_id={colony_id} with new_name='{new_name}', theme='{theme_color}', banner='{banner_file}', username='{username}'")

            await conn.execute(
                """
                UPDATE colonies
                SET colony_name = COALESCE($1, colony_name),
                    theme_color = COALESCE($2, theme_color),
                    banner_file = COALESCE($3, banner_file),
                    username = COALESCE($4, username),
                    password_hash = COALESCE($5, password_hash)
                WHERE id = $6
                """,
                new_name,
                theme_color,
                banner_file,
                username,
                hashed_password,
                colony_id,
            )

            logging.info(f"[SETTINGS_API] Update SUCCESS for colony_id={colony_id} new_name='{new_name}'")

            return self.write_json({"success": True})
