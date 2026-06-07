from fastapi import APIRouter, HTTPException, Depends, status
from app.db import db
from app.schemas import MessageSend
from app.auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/chat", tags=["Communications"])

@router.post("/send")
async def send_message(msg: MessageSend, current_user: dict = Depends(get_current_user)):
    # Validate receiver exists
    receiver = await db.find_one("users", {"_id": msg.receiver_id})
    if not receiver:
        raise HTTPException(status_code=404, detail="Recipient user not found")
        
    chat_doc = {
        "sender_id": current_user["_id"],
        "sender_name": current_user["name"],
        "receiver_id": msg.receiver_id,
        "receiver_name": receiver["name"],
        "message": msg.message,
        "timestamp": datetime.utcnow().isoformat(),
        "read": False
    }
    
    result = await db.insert_one("chat_messages", chat_doc)
    return {"message": "Message sent", "chat": result}

@router.get("/history/{contact_id}")
async def get_chat_history(contact_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    
    # Query messages where sender is current user and receiver is contact, or vice versa
    messages1 = await db.find("chat_messages", {"sender_id": user_id, "receiver_id": contact_id})
    messages2 = await db.find("chat_messages", {"sender_id": contact_id, "receiver_id": user_id})
    
    all_messages = messages1 + messages2
    # Sort messages by timestamp
    all_messages.sort(key=lambda x: x.get("timestamp", ""))
    
    # Mark incoming messages as read
    for msg in messages2:
        if not msg.get("read", False):
            await db.update_one("chat_messages", {"_id": msg["_id"]}, {"$set": {"read": True}})
            
    return all_messages

@router.get("/contacts")
async def get_contacts(current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    
    # Fetch all messages involving the user
    messages_sent = await db.find("chat_messages", {"sender_id": user_id})
    messages_received = await db.find("chat_messages", {"receiver_id": user_id})
    
    all_msgs = messages_sent + messages_received
    
    # Extract unique contacts
    contacts_dict = {}
    for msg in all_msgs:
        if msg["sender_id"] == user_id:
            c_id = msg["receiver_id"]
            c_name = msg["receiver_name"]
        else:
            c_id = msg["sender_id"]
            c_name = msg["sender_name"]
            
        contacts_dict[c_id] = {
            "id": c_id,
            "name": c_name,
            "last_message": msg["message"],
            "timestamp": msg.get("timestamp", "")
        }
        
    contacts_list = list(contacts_dict.values())
    contacts_list.sort(key=lambda x: x["timestamp"], reverse=True)
    return contacts_list
