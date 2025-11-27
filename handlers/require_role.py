from functools import wraps


def require_role(*allowed_roles):
    def decorator(method):
        @wraps(method)
        async def wrapper(self, colony_name=None, *args, **kwargs):
            if colony_name:
                colony_name = colony_name.lower()

            # Check role
            role = self.get_secure_cookie("role")
            colony_cookie = self.get_secure_cookie("colony")

            # Not logged in at all
            if not role or not colony_cookie:
                return self.redirect(f"/{colony_name}/login")

            role = role.decode("utf-8")
            logged_colony = colony_cookie.decode("utf-8").lower()

            # Colony mismatch → redirect to the correct colony login
            if logged_colony != colony_name:
                return self.redirect(f"/{colony_name}/login")

            # Wrong role
            if role not in allowed_roles:
                return self.redirect(f"/{colony_name}/login")

            return await method(self, colony_name=colony_name, *args, **kwargs)

        return wrapper

    return decorator
