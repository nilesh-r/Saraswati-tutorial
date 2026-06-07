import os
import json
import uuid
import asyncio
from datetime import datetime
from app.config import settings

# Global async lock for writing to the local JSON file database
_json_lock = asyncio.Lock()

class Database:
    def __init__(self):
        self.use_mongo = False
        self.db = None
        self.client = None

        if settings.MONGODB_URI:
            try:
                from motor.motor_asyncio import AsyncIOMotorClient
                self.client = AsyncIOMotorClient(settings.MONGODB_URI)
                self.db = self.client[settings.DB_NAME]
                self.use_mongo = True
                print("Connected to MongoDB successfully.")
            except Exception as e:
                print(f"Failed to connect to MongoDB, falling back to local JSON. Error: {e}")
                self.use_mongo = False
        
        if not self.use_mongo:
            print(f"Using local JSON Database at: {settings.JSON_DB_PATH}")
            self._init_json_db()

    def _init_json_db(self):
        if not os.path.exists(settings.JSON_DB_PATH):
            default_data = {
                "users": [],
                "tutor_profiles": [],
                "inquiries": [],
                "enrollments": [],
                "schedules": [],
                "assignments": [],
                "grades": [],
                "invoices": [],
                "reviews": [],
                "chat_messages": []
            }
            # Ensure parent directories exist
            os.makedirs(os.path.dirname(settings.JSON_DB_PATH), exist_ok=True)
            with open(settings.JSON_DB_PATH, "w") as f:
                json.dump(default_data, f, indent=2)

    async def _read_json(self) -> dict:
        async with _json_lock:
            if not os.path.exists(settings.JSON_DB_PATH):
                return {
                    "users": [],
                    "tutor_profiles": [],
                    "inquiries": [],
                    "enrollments": [],
                    "schedules": [],
                    "assignments": [],
                    "grades": [],
                    "invoices": [],
                    "reviews": [],
                    "chat_messages": []
                }
            with open(settings.JSON_DB_PATH, "r") as f:
                try:
                    return json.load(f)
                except Exception:
                    return {
                        "users": [],
                        "tutor_profiles": [],
                        "inquiries": [],
                        "enrollments": [],
                        "schedules": [],
                        "assignments": [],
                        "grades": [],
                        "invoices": [],
                        "reviews": [],
                        "chat_messages": []
                    }

    async def _write_json(self, data: dict):
        async with _json_lock:
            with open(settings.JSON_DB_PATH, "w") as f:
                json.dump(data, f, indent=2)

    async def find(self, collection_name: str, query: dict = None) -> list:
        query = query or {}
        if self.use_mongo:
            cursor = self.db[collection_name].find(query)
            docs = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                docs.append(doc)
            return docs
        else:
            data = await self._read_json()
            docs = data.get(collection_name, [])
            filtered = []
            for doc in docs:
                match = True
                for k, v in query.items():
                    doc_val = doc.get(k)
                    if isinstance(v, dict):
                        # Support simple operators like $in, $gte, $lte, $ne
                        if "$in" in v:
                            in_list = v["$in"]
                            if isinstance(doc_val, list):
                                if not any(item in in_list for item in doc_val):
                                    match = False
                                    break
                            elif doc_val not in in_list:
                                match = False
                                break
                        elif "$gte" in v:
                            if doc_val is None or doc_val < v["$gte"]:
                                match = False
                                break
                        elif "$lte" in v:
                            if doc_val is None or doc_val > v["$lte"]:
                                match = False
                                break
                        elif "$ne" in v:
                            if doc_val == v["$ne"]:
                                match = False
                                break
                        else:
                            if doc_val != v:
                                match = False
                                break
                    else:
                        if doc_val != v:
                            match = False
                            break
                if match:
                    filtered.append(dict(doc))
            return filtered

    async def find_one(self, collection_name: str, query: dict) -> dict:
        results = await self.find(collection_name, query)
        return results[0] if results else None

    async def insert_one(self, collection_name: str, document: dict) -> dict:
        doc = dict(document)
        if "_id" not in doc:
            doc["_id"] = str(uuid.uuid4())
        
        for k, v in doc.items():
            if isinstance(v, datetime):
                doc[k] = v.isoformat()

        if self.use_mongo:
            await self.db[collection_name].insert_one(doc)
            return doc
        else:
            data = await self._read_json()
            if collection_name not in data:
                data[collection_name] = []
            data[collection_name].append(doc)
            await self._write_json(data)
            return doc

    async def update_one(self, collection_name: str, query: dict, update_doc: dict, upsert: bool = False) -> bool:
        set_data = update_doc.get("$set", {})
        
        for k, v in set_data.items():
            if isinstance(v, datetime):
                set_data[k] = v.isoformat()

        if self.use_mongo:
            result = await self.db[collection_name].update_one(query, update_doc, upsert=upsert)
            return result.modified_count > 0 or (result.upserted_id is not None)
        else:
            data = await self._read_json()
            docs = data.get(collection_name, [])
            found = False
            for i, doc in enumerate(docs):
                match = True
                for k, v in query.items():
                    if doc.get(k) != v:
                        match = False
                        break
                if match:
                    found = True
                    for k, v in set_data.items():
                        doc[k] = v
                    docs[i] = doc
                    break
            
            if not found and upsert:
                new_doc = {**query, **set_data}
                if "_id" not in new_doc:
                    new_doc["_id"] = str(uuid.uuid4())
                docs.append(new_doc)
                found = True
            
            if found:
                data[collection_name] = docs
                await self._write_json(data)
                return True
            return False

    async def delete_one(self, collection_name: str, query: dict) -> bool:
        if self.use_mongo:
            result = await self.db[collection_name].delete_one(query)
            return result.deleted_count > 0
        else:
            data = await self._read_json()
            docs = data.get(collection_name, [])
            idx = -1
            for i, doc in enumerate(docs):
                match = True
                for k, v in query.items():
                    if doc.get(k) != v:
                        match = False
                        break
                if match:
                    idx = i
                    break
            if idx != -1:
                docs.pop(idx)
                data[collection_name] = docs
                await self._write_json(data)
                return True
            return False

db = Database()
