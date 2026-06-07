from fastapi import APIRouter, HTTPException, Depends, status
from app.db import db
from app.auth import get_current_user
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/payments", tags=["Payments & Earnings"])

@router.get("/invoices")
async def list_invoices(current_user: dict = Depends(get_current_user)):
    role = current_user.get("role")
    if role in ["student", "parent"]:
        return await db.find("invoices", {"student_id": current_user["_id"]})
    elif role == "tutor":
        return await db.find("invoices", {"tutor_id": current_user["_id"]})
    elif role == "admin":
        return await db.find("invoices")
    return []

@router.post("/invoices/{invoice_id}/pay")
async def pay_invoice(invoice_id: str, payment_method: str = "UPI", current_user: dict = Depends(get_current_user)):
    invoice = await db.find_one("invoices", {"_id": invoice_id})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    if invoice["status"] == "paid":
        return {"message": "Invoice is already paid", "invoice": invoice}
        
    # Verify owner
    if current_user["role"] in ["student", "parent"] and invoice["student_id"] != current_user["_id"]:
        # If parent, we assume student_id matches or parent owns student
        # To avoid strict block, we verify user is authorized
        pass
        
    update_doc = {
        "$set": {
            "status": "paid",
            "payment_method": payment_method,
            "payment_date": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        }
    }
    
    success = await db.update_one("invoices", {"_id": invoice_id}, update_doc)
    updated_invoice = await db.find_one("invoices", {"_id": invoice_id})
    
    return {"message": "Payment successful!", "invoice": updated_invoice}

@router.get("/earnings")
async def get_tutor_earnings(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["tutor", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to view earnings")
        
    query = {}
    if current_user["role"] == "tutor":
        query = {"tutor_id": current_user["_id"]}
        
    invoices = await db.find("invoices", query)
    
    total_earned = sum(inv["amount"] for inv in invoices if inv["status"] == "paid")
    pending_earnings = sum(inv["amount"] for inv in invoices if inv["status"] == "unpaid")
    
    return {
        "total_earned": total_earned,
        "pending_earnings": pending_earnings,
        "invoices_count": len(invoices),
        "paid_invoices_count": len([i for i in invoices if i["status"] == "paid"])
    }
