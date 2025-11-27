import logging
import os
import uuid

import bcrypt

from config.environments import Environment
from handlers.base import BaseHandler
from handlers.require_role import require_role
from utils.database import create_colony_database, get_master_pool


class ColonyItemsPageHandler(BaseHandler):
    @require_role("admin")
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
        role = raw_role.decode("utf-8") if raw_role else None

        self.render_template(
            "colony_items.html",
            colony_name=colony_record["colony_name"],
            theme_color=colony_record["theme_color"],
            banner_file=colony_record["banner_file"],
            role=role,
        )
