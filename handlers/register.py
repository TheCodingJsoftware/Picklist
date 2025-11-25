import logging
import os
import uuid

from handlers.base import BaseHandler


class RegisterHandler(BaseHandler):
    async def post(self):
        try:
            username = self.get_body_argument("username")
            password = self.get_body_argument("password")
            colony = self.get_body_argument("colony")
            theme_color = self.get_body_argument("theme_color")

            banner_meta = self.request.files.get("banner")

            banner_filename = None

            logging.info(f"Received registration data: username={username}, colony={colony}, theme_color={theme_color}, banner_meta={banner_meta}")

            if banner_meta:
                fileinfo = banner_meta[0]
                original_name = fileinfo["filename"]
                ext = os.path.splitext(original_name)[1]
                new_name = f"{uuid.uuid4()}{ext}"

                save_path = f"uploaded_banners/{new_name}"
                os.makedirs("uploaded_banners", exist_ok=True)

                with open(save_path, "wb") as f:
                    f.write(fileinfo["body"])

                banner_filename = new_name

            # TODO: Save all data to DB here

            self.finish({"success": True, "username": username, "colony": colony, "theme_color": theme_color, "banner_file": banner_filename})

        except Exception as e:
            self.set_status(400)
            self.finish({"error": str(e)})
