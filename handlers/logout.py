from handlers.base import BaseHandler


class ColonyAdminLogoutHandler(BaseHandler):
    async def get(self, colony_name):
        colony_name = colony_name.lower()
        self.clear_cookie("role")
        self.redirect(f"/{colony_name}")
