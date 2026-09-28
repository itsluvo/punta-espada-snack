#!/usr/bin/env python3
"""Punta Espada Snack & Bar — Cap Cana golf-course ordering."""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import string
import threading
import time
import urllib.error
import urllib.request
from datetime import datetime
from zoneinfo import ZoneInfo
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
ORDERS = DATA / "orders.json"
SESSIONS = DATA / "sessions.json"
CIERRES = DATA / "cierres.json"
PORT = int(os.environ.get("PORT", "8767"))
PIN = os.environ.get("CASHIER_PIN", "1411")
XAI_MODEL = os.environ.get("XAI_MODEL", "grok-4.7")
MAX_FOTO = 12_000_000
TAX_RATE = 0.18
STATUSES = ("new", "preparing", "ready", "done", "cancelled")
PAY = ("cash", "card")
ALPHABET = string.ascii_lowercase + string.digits
TZ = ZoneInfo("America/Santo_Domingo")
AUTO_TASA = 60.0
_lock = threading.Lock()


def _db_url() -> str:
    url = os.environ.get("DATABASE_URL", "").strip()
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    return url


def _pg_conn():
    import psycopg2
    return psycopg2.connect(_db_url(), connect_timeout=15)


def _ensure_db() -> None:
    if not _db_url() or getattr(_ensure_db, "done", False):
        return
    with _pg_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("CREATE TABLE IF NOT EXISTS app_json (name TEXT PRIMARY KEY, body TEXT NOT NULL)")
            for path in (ORDERS, SESSIONS, CIERRES):
                cur.execute("SELECT 1 FROM app_json WHERE name = %s", (path.name,))
                if cur.fetchone():
                    continue
                if path.exists():
                    cur.execute(
                        "INSERT INTO app_json (name, body) VALUES (%s, %s)",
                        (path.name, path.read_text("utf-8")),
                    )
        conn.commit()
    _ensure_db.done = True


def _load(path: Path, default):
    if _db_url():
        try:
            _ensure_db()
            with _pg_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT body FROM app_json WHERE name = %s", (path.name,))
                    row = cur.fetchone()
            if row:
                return json.loads(row[0])
        except Exception as exc:
            print("[punta-espada] db read", path.name, exc)
    try:
        return json.loads(path.read_text("utf-8"))
    except Exception:
        return default


def _save(path: Path, obj) -> None:
    text = json.dumps(obj, ensure_ascii=False, indent=2)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(text, "utf-8")
    tmp.replace(path)
    if not _db_url():
        return
    try:
        _ensure_db()
        with _pg_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO app_json (name, body) VALUES (%s, %s)
                    ON CONFLICT (name) DO UPDATE SET body = EXCLUDED.body
                    """,
                    (path.name, text),
                )
            conn.commit()
    except Exception as exc:
        print("[punta-espada] db write", path.name, exc)


def _day_key(ms: int) -> str:
    return datetime.fromtimestamp(int(ms) / 1000, TZ).strftime("%Y-%m-%d")


def _today_key() -> str:
    return datetime.now(TZ).strftime("%Y-%m-%d")


def close_past_days() -> int:
    """At midnight, file each finished day's paid orders into that day's cierre.

    A day that already has a cierre is left as it is.
    """
    made = 0
    with _lock:
        orders = _load(ORDERS, {})
        cierres = _load(CIERRES, {})
        today = _today_key()
        buckets: dict[str, list] = {}
        for order in orders.values():
            if not isinstance(order, dict):
                continue
            if order.get("status") != "done" or order.get("pay") not in PAY:
                continue
            stamp = order.get("statusTs") or order.get("ts") or 0
            try:
                day = _day_key(int(stamp))
            except (TypeError, ValueError, OSError):
                continue
            if day >= today:
                continue
            buckets.setdefault(day, []).append(order)
        for day, rows in buckets.items():
            if day in cierres:
                continue
            cash = sum(float(o.get("total") or 0) for o in rows if o.get("pay") == "cash")
            card = sum(float(o.get("total") or 0) for o in rows if o.get("pay") == "card")
            cierres[day] = {
                "date": day,
                "tasa": AUTO_TASA,
                "efectivo": round(cash * AUTO_TASA + 1e-9, 2),
                "tarjeta": round(card * AUTO_TASA + 1e-9, 2),
                "creditos": 0,
                "creditosNota": "",
                "propinaTC": 0,
                "entregado": "",
                "recibido": "",
                "origen": "pedidos",
                "ts": int(time.time() * 1000),
            }
            made += 1
        if made:
            _save(CIERRES, cierres)
    return made


def new_id(orders: dict) -> str:
    for _ in range(40):
        oid = "".join(secrets.choice(ALPHABET) for _ in range(6))
        if oid not in orders:
            return oid
    return secrets.token_hex(4)


def _xai_key() -> str:
    key = (os.environ.get("XAI_API_KEY") or "").strip()
    if key:
        return key
    env = ROOT / ".env"
    if not env.exists():
        return ""
    for line in env.read_text("utf-8", errors="ignore").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        name, value = line.split("=", 1)
        if name.strip() == "XAI_API_KEY":
            return value.strip().strip('"').strip("'")
    return ""


def _date_iso(value) -> str:
    s = str(value or "").strip()
    if re.match(r"^\d{4}-\d{2}-\d{2}$", s):
        try:
            datetime.strptime(s, "%Y-%m-%d")
            return s
        except ValueError:
            return ""
    m = re.match(r"^(\d{1,2})\s*[/\-.]\s*(\d{1,2})\s*[/\-.]\s*(\d{2,4})$", s)
    if not m:
        return ""
    day, month, year = int(m.group(1)), int(m.group(2)), int(m.group(3))
    if year < 100:
        year += 2000
    try:
        return datetime(year, month, day).strftime("%Y-%m-%d")
    except ValueError:
        return ""


def _money(value):
    if value is None or value == "":
        return None
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        x = float(value)
    else:
        t = str(value).strip().replace("RD$", "").replace("$", "").replace(" ", "")
        t = t.replace("—", "").replace("-", "")
        if not t:
            return None
        if "," in t and "." in t:
            t = t.replace(",", "")
        elif re.match(r"^\d{1,3}(,\d{3})+$", t):
            t = t.replace(",", "")
        else:
            t = t.replace(",", ".")
        t = re.sub(r"[^0-9.]", "", t)
        if not t or t == ".":
            return None
        try:
            x = float(t)
        except ValueError:
            return None
    if x < 0 or x > 5_000_000:
        return None
    return round(x + 1e-9, 2)


def _clip(value, n=80) -> str:
    return str(value or "").replace("\n", " ").strip()[:n]


def _one_cierre(raw):
    if not isinstance(raw, dict):
        return None
    date = _date_iso(raw.get("date") or raw.get("fecha"))
    tasa = _money(raw.get("tasa"))
    efectivo = _money(raw.get("efectivo"))
    tarjeta = _money(raw.get("tarjeta"))
    extra = _money(raw.get("tarjetaDelivery") or raw.get("tarjeta_delivery"))
    if tarjeta is None:
        tarjeta = extra
    elif extra:
        tarjeta = round(tarjeta + extra + 1e-9, 2)
    creditos = _money(raw.get("creditos"))
    propina = _money(raw.get("propinaTC") or raw.get("propina"))
    if efectivo is None and tarjeta is None and creditos is None and propina is None:
        return None
    aviso = _clip(raw.get("aviso"), 180)
    confianza = str(raw.get("confianza") or "").lower()
    if confianza not in ("alta", "media", "baja"):
        confianza = "media"
    return {
        "cierre": {
            "date": date,
            "tasa": tasa if tasa else 60.0,
            "efectivo": efectivo,
            "tarjeta": tarjeta,
            "creditos": creditos,
            "creditosNota": _clip(raw.get("creditosNota") or raw.get("creditos_nota")),
            "propinaTC": propina,
            "entregado": _clip(raw.get("entregado")),
            "recibido": _clip(raw.get("recibido")),
        },
        "aviso": aviso,
        "confianza": confianza,
    }


def normalize_cierres(raw) -> list:
    if isinstance(raw, dict) and isinstance(raw.get("cierres"), list):
        items = raw["cierres"]
    elif isinstance(raw, list):
        items = raw
    elif isinstance(raw, dict):
        items = [raw]
    else:
        return []
    out = []
    for item in items:
        one = _one_cierre(item)
        if one:
            out.append(one)
    return out


_FOTO_PROMPT = """Esta foto es el cierre del día de Snack Bar Punta Espada, en pesos dominicanos (RD$).
Puede ser un papel escrito a mano o la pantalla de la oficina. Ignora tickets largos de impresora (listas de productos, CASH, MasterCard, Visa).
Lee solo el cuadre del día. Si hay varias hojas de cierre, devuelve una por hoja.
No inventes cifras. Si un número no se lee, pon null.
La fecha va en formato YYYY-MM-DD. En el papel el orden es día/mes/año.
Si hay "Tarjeta" y además "Tarjeta Delivery", suma las dos en tarjeta y deja tarjetaDelivery en null.
Créditos: el monto en creditos y el nombre de la persona en creditosNota.
No uses el total de venta, el 5% ni el total efectivo como si fueran efectivo o tarjeta: esos se calculan solos.
Responde solo JSON con esta forma:
{"cierres":[{"date":"YYYY-MM-DD o null","tasa":60,"efectivo":0,"tarjeta":0,"creditos":0,"creditosNota":"","propinaTC":0,"entregado":"","recibido":"","confianza":"alta","aviso":""}]}
confianza es alta, media o baja. aviso es una frase corta en español si algún número costó leerlo."""


def _jpeg_bytes(raw: bytes) -> bytes:
    try:
        from PIL import Image, ImageOps
    except Exception:
        return raw
    img = ImageOps.exif_transpose(Image.open(BytesIO(raw)))
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")
    img.thumbnail((1800, 1800))
    out = BytesIO()
    img.convert("RGB").save(out, format="JPEG", quality=86)
    return out.getvalue()


def _decode_image(payload: dict) -> bytes:
    image = payload.get("image") or payload.get("foto") or ""
    if not isinstance(image, str) or not image.strip():
        raise ValueError("falta la foto")
    b64 = image.split(",", 1)[1] if "," in image[:80] else image
    try:
        raw = base64.b64decode(b64, validate=False)
    except Exception as exc:
        raise ValueError("la foto no se pudo abrir") from exc
    if len(raw) < 32:
        raise ValueError("la foto está vacía")
    return _jpeg_bytes(raw)


def _leer_con_grok(jpeg: bytes, key: str) -> list:
    body = {
        "model": XAI_MODEL,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64," + base64.b64encode(jpeg).decode("ascii"), "detail": "high"}},
                {"type": "text", "text": _FOTO_PROMPT},
            ],
        }],
    }
    req = urllib.request.Request(
        "https://api.x.ai/v1/chat/completions",
        data=json.dumps(body).encode("utf-8"),
        headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as res:
            data = json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")[:300]
        print(f"[punta-espada] vision http {exc.code} {detail}")
        raise RuntimeError("No se pudo leer la foto. Inténtalo otra vez.") from exc
    except Exception as exc:
        print(f"[punta-espada] vision error {type(exc).__name__}")
        raise RuntimeError("No se pudo leer la foto. Inténtalo otra vez.") from exc
    try:
        text = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError("La lectura no trajo números.") from exc
    if isinstance(text, list):
        text = " ".join(part.get("text", "") for part in text if isinstance(part, dict))
    parsed = _extract_json(str(text))
    if parsed is None:
        raise RuntimeError("No entendí la lectura de la foto.")
    return normalize_cierres(parsed)


def _extract_json(text: str):
    text = text.strip()
    text = re.sub(r"^```(?:json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", text, re.S)
        if not m:
            return None
        try:
            return json.loads(m.group(0))
        except json.JSONDecodeError:
            return None


def leer_foto(jpeg: bytes) -> dict:
    key = _xai_key()
    if not key:
        raise ValueError("Todavía no puedo leer el papel. Falta activar la lectura en la computadora.")
    cierres = _leer_con_grok(jpeg, key)
    if not cierres:
        raise ValueError("No pude leer las ventas. Acerca la foto al papel, con luz, y tómala de nuevo.")
    return {"modo": "grok", "cierres": cierres}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(ROOT), **k)

    def log_message(self, fmt, *args):
        print(f"[punta-espada {self.address_string()}] {fmt % args}")

    def end_headers(self):
        path = urlparse(self.path).path
        if path.endswith((".html", ".js", ".css", ".webmanifest")) or path in ("/", "/kitchen", "/office", ""):
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
            self.send_header("Pragma", "no-cache")
        super().end_headers()

    def _json(self, code: int, obj) -> None:
        raw = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def _read_json(self):
        n = int(self.headers.get("Content-Length") or 0)
        try:
            return json.loads(self.rfile.read(n).decode("utf-8") or "{}"), None
        except Exception:
            return None, "bad json"

    def _token(self) -> str:
        h = self.headers.get("Authorization") or ""
        return h.split(" ", 1)[1].strip() if h.lower().startswith("bearer ") else ""

    def _auth(self) -> bool:
        tok = self._token()
        sessions = _load(SESSIONS, {})
        s = sessions.get(tok)
        if not s or s.get("exp", 0) < time.time():
            self._json(401, {"error": "auth"})
            return False
        return True

    def do_GET(self):
        path = urlparse(self.path).path.rstrip("/") or "/"
        if path == "/kitchen":
            self.path = "/kitchen.html"
            return super().do_GET()
        if path == "/office":
            self.path = "/office.html"
            return super().do_GET()
        if path == "/api/orders":
            close_past_days()
            orders = list(_load(ORDERS, {}).values())
            orders.sort(key=lambda o: o.get("ts") or 0, reverse=True)
            return self._json(200, {"orders": orders})
        if path == "/api/cierres":
            if not self._auth():
                return
            close_past_days()
            return self._json(200, {"cierres": _load(CIERRES, {})})
        m = re.match(r"^/api/order/([a-z0-9]+)$", path)
        if m:
            o = _load(ORDERS, {}).get(m.group(1))
            return self._json(200, o) if o else self._json(404, {"error": "not found"})
        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path.rstrip("/") or "/"
        if path == "/api/cashier/login":
            payload, err = self._read_json()
            if err:
                return self._json(400, {"error": err})
            pin = str((payload or {}).get("pin") or "")
            if not hmac.compare_digest(pin, PIN):
                return self._json(401, {"error": "bad pin"})
            tok = secrets.token_hex(16)
            sessions = _load(SESSIONS, {})
            sessions[tok] = {"exp": time.time() + 86400 * 7}
            _save(SESSIONS, sessions)
            return self._json(200, {"token": tok})
        if path == "/api/order":
            payload, err = self._read_json()
            if err or not isinstance(payload, dict) or "items" not in payload:
                return self._json(400, {"error": "invalid order"})
            items = payload.get("items") or []
            if not isinstance(items, list) or not items:
                return self._json(400, {"error": "invalid order"})
            sub = 0.0
            for it in items:
                if not isinstance(it, dict):
                    continue
                try:
                    sub += float(it.get("price") or 0) * int(it.get("qty") or 0)
                except (TypeError, ValueError):
                    continue
            sub = round(sub + 1e-9, 2)
            tax = round(sub * TAX_RATE + 1e-9, 2)
            payload["subtotal"] = sub
            payload["taxRate"] = TAX_RATE
            payload["tax"] = tax
            payload["total"] = round(sub + tax + 1e-9, 2)
            payload["currency"] = "USD"
            with _lock:
                orders = _load(ORDERS, {})
                oid = new_id(orders)
                payload["id"] = oid
                payload["status"] = "new"
                payload["ts"] = int(time.time() * 1000)
                orders[oid] = payload
                _save(ORDERS, orders)
            return self._json(201, {"id": oid, "status": "new"})
        if path == "/api/cierre/leer":
            if not self._auth():
                return
            n = int(self.headers.get("Content-Length") or 0)
            if n > MAX_FOTO:
                return self._json(413, {"error": "La foto es demasiado grande. Tómala de nuevo."})
            payload, err = self._read_json()
            if err or not isinstance(payload, dict):
                return self._json(400, {"error": "No llegó la foto."})
            try:
                jpeg = _decode_image(payload)
                result = leer_foto(jpeg)
            except ValueError as exc:
                return self._json(422, {"error": str(exc)})
            except RuntimeError as exc:
                return self._json(502, {"error": str(exc)})
            except Exception:
                print("[punta-espada] leer foto falló")
                return self._json(500, {"error": "No se pudo leer la foto."})
            return self._json(200, result)
        if path == "/api/cierre":
            if not self._auth():
                return
            payload, err = self._read_json()
            if err or not isinstance(payload, dict):
                return self._json(400, {"error": err or "invalid"})
            date = str(payload.get("date") or "")
            if not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
                return self._json(400, {"error": "date"})
            def money_in(key):
                try:
                    return round(float(payload.get(key) or 0) + 1e-9, 2)
                except (TypeError, ValueError):
                    return 0.0
            rec = {
                "date": date,
                "tasa": money_in("tasa") or 60.0,
                "efectivo": money_in("efectivo"),
                "tarjeta": money_in("tarjeta"),
                "creditos": money_in("creditos"),
                "creditosNota": str(payload.get("creditosNota") or "")[:80],
                "propinaTC": money_in("propinaTC"),
                "entregado": str(payload.get("entregado") or "")[:80],
                "recibido": str(payload.get("recibido") or "")[:80],
                "ts": int(time.time() * 1000),
            }
            if str(payload.get("origen") or "") == "foto":
                rec["origen"] = "foto"
            with _lock:
                allc = _load(CIERRES, {})
                allc[date] = rec
                _save(CIERRES, allc)
            return self._json(200, rec)
        self._json(404, {"error": "not found"})

    def do_PATCH(self):
        path = urlparse(self.path).path
        m = re.match(r"^/api/order/([a-z0-9]+)/?$", path)
        if not m:
            return self._json(404, {"error": "not found"})
        oid = m.group(1)
        payload, err = self._read_json()
        if err:
            return self._json(400, {"error": err})
        with _lock:
            orders = _load(ORDERS, {})
            o = orders.get(oid)
            if not o:
                return self._json(404, {"error": "not found"})
            st = str((payload or {}).get("status") or "").lower()
            if st not in STATUSES:
                return self._json(400, {"error": "bad status"})
            if st == "done":
                pay = str((payload or {}).get("pay") or "").lower()
                if pay not in PAY:
                    return self._json(400, {"error": "pay"})
                o["pay"] = pay
            o["status"] = st
            o["statusTs"] = int(time.time() * 1000)
            _save(ORDERS, orders)
        return self._json(200, o)


def _midnight_loop() -> None:
    while True:
        try:
            close_past_days()
        except Exception:
            print("[punta-espada] cierre automático falló")
        time.sleep(30)


def main() -> None:
    DATA.mkdir(exist_ok=True)
    if not ORDERS.exists():
        _save(ORDERS, {})
    if not SESSIONS.exists():
        _save(SESSIONS, {})
    if not CIERRES.exists():
        _save(CIERRES, {})
    threading.Thread(target=_midnight_loop, daemon=True).start()
    httpd = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Punta Espada Snack & Bar  http://127.0.0.1:{PORT}")
    print(f"Kitchen  http://127.0.0.1:{PORT}/kitchen   PIN {PIN}")
    print(f"Oficina  http://127.0.0.1:{PORT}/office    PIN {PIN}")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
