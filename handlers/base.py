import json
import logging
import traceback
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
from typing import Awaitable

import jinja2
from tornado.web import RequestHandler


def urlencode_path_segment(value: str) -> str:
    return urllib.parse.quote(value, safe="")


loader = jinja2.FileSystemLoader("dist")
env = jinja2.Environment(loader=loader)
env.filters["urlencode_path"] = urlencode_path_segment

executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="file_directory_gatherer")


class BaseHandler(RequestHandler):
    def write_error(self, status_code: int, **kwargs):
        if exc_info := kwargs.get("exc_info"):
            tb_str = "".join(traceback.format_exception(*exc_info))
            logging.error("[%s] Exception in handler:\n%s", self.__class__.__name__, tb_str)
        else:
            logging.error("[%s] Unknown error with status code", status_code)

        self.set_header("Content-Type", "application/json")
        self.finish({"error": f"Server error (status: {status_code})"})

    def write_json(self, data, status=200):
        self.set_status(status)
        self.set_header("Content-Type", "application/json")
        self.write(json.dumps(data))

    def get_template(self, template_name: str):
        return env.get_template(template_name)

    def render_template(self, template_name: str, **kwargs):
        template = self.get_template(template_name)
        rendered_template = template.render(**kwargs)
        self.set_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.set_header("Pragma", "no-cache")  # HTTP 1.0 backward compatibility
        self.set_header("Expires", "0")  # Proxies
        self.write(rendered_template)

    def data_received(self, chunk: bytes) -> Awaitable[None] | None:
        return super().data_received(chunk)
