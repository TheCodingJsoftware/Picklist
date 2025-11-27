import logging
import os
import uuid

import bcrypt

from config.environments import Environment
from handlers.base import BaseHandler
from utils.database import create_colony_database, get_master_pool


class ColonyPageHandler(BaseHandler):
    async def get(self, *args, **kwargs):
        colony_identifier = self.request.path.strip("/").lower()
        colony_identifier = colony_identifier.replace("/settings", "").replace("/items", "")
        logging.info(f"Fetching colony page for identifier: {colony_identifier}")

        pool = await get_master_pool()
        async with pool.acquire() as conn:
            colony_record = await conn.fetchrow(
                """
                SELECT id, colony_name, theme_color, banner_file
                FROM colonies
                WHERE colony_name = $1
                """,
                colony_identifier,
            )

        if not colony_record:
            self.set_status(404)
            self.finish(f"Colony '{colony_identifier}' not found.")
            return

        raw_role = self.get_secure_cookie("role")
        raw_colony = self.get_secure_cookie("colony")

        role = raw_role.decode("utf-8") if raw_role else None
        logged_colony = raw_colony.decode("utf-8") if raw_colony else None

        # Check if user is admin *AND* logged into THIS colony
        is_colony_admin = role == "admin" and logged_colony == colony_record["colony_name"]

        self.render_template(
            "colony_dashboard.html",
            colony_name=colony_record["colony_name"],
            theme_color=colony_record["theme_color"],
            banner_file=colony_record["banner_file"],
            is_colony_admin=is_colony_admin,
        )
