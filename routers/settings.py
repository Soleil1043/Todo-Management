from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Response
from sqlalchemy.orm import Session
from database.database import get_db
from services.setting_service import SettingService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

def get_setting_service(db: Session = Depends(get_db)) -> SettingService:
    return SettingService(db)

@router.post("/settings/wallpaper")
async def upload_wallpaper(
    file: UploadFile = File(...),
    service: SettingService = Depends(get_setting_service)
):
    # 50MB limit
    MAX_SIZE = 50 * 1024 * 1024
    
    # Read file content
    try:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="文件大小超过50MB限制")
        
        service.save_wallpaper(content, file.content_type)
        return {"message": "壁纸上传成功"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"上传壁纸失败: {e}")
        raise HTTPException(status_code=500, detail="上传壁纸失败")

@router.get("/settings/wallpaper")
def get_wallpaper(service: SettingService = Depends(get_setting_service)):
    result = service.get_wallpaper()
    if not result:
        raise HTTPException(status_code=404, detail="未设置壁纸")
    
    data, content_type = result
    # 设置缓存头，让浏览器缓存壁纸
    return Response(content=data, media_type=content_type, headers={"Cache-Control": "public, max-age=31536000"})

@router.delete("/settings/wallpaper")
def delete_wallpaper(service: SettingService = Depends(get_setting_service)):
    service.delete_wallpaper()
    return {"message": "壁纸已删除"}
